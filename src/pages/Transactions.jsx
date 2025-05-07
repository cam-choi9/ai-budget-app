import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getTransactions as getManualTransactions,
  getAccessToken,
} from "../firebase/firestore";
import { fetchTransactions as getPlaidTransactions } from "../services/plaidService";
import AddTransactionForm from "../components/AddTransactionForm";

function Transactions() {
  const { user } = useAuth();
  const [manualTransactions, setManualTransactions] = useState([]);
  const [plaidTransactions, setPlaidTransactions] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Load manual transactions
    getManualTransactions(user.uid).then(setManualTransactions);

    // Load Plaid transactions from Firestore access_token
    getAccessToken(user.uid)
      .then((accessToken) => {
        return getPlaidTransactions(accessToken, true);
      })
      .then(setPlaidTransactions)
      .catch((err) => {
        console.error("❌ Failed to fetch Plaid transactions:", err.message);
      });
  }, [user]);

  return (
    <div className="dashboard" style={{ display: "flex", gap: "2rem" }}>
      {/* Left Column: Add Manual Transaction */}
      <div style={{ flex: 1 }}>
        <h2>Manual Entry</h2>
        <AddTransactionForm onAdd={setManualTransactions} />
        <ul style={{ marginTop: "2rem" }}>
          {manualTransactions.map((tx) => (
            <li key={tx.id}>
              <strong>{tx.name}</strong> — ${tx.amount} ({tx.category})
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column: Auto-Synced Transactions */}
      <div style={{ flex: 1 }}>
        <h2>Synced from Bank</h2>
        <ul style={{ marginTop: "2rem" }}>
          {plaidTransactions.map((tx) => (
            <li key={tx.transaction_id}>
              <strong>{tx.name}</strong> — ${tx.amount.toFixed(2)} (
              {tx.category?.join(" > ")})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Transactions;
