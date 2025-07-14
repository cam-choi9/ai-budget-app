import { useEffect, useState } from "react";
import {
  fetchTransactions,
  syncTransactions,
  categorizeTransactions,
} from "../services/transactions";

import "../styles/transactions.css";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [categorizing, setCategorizing] = useState(false);

  const loadTransactions = () => {
    setLoading(true);
    fetchTransactions()
      .then(setTransactions)
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleSyncClick = async () => {
    try {
      setSyncing(true);
      await syncTransactions(2); // hardcoded user_id=2
      loadTransactions(); // refresh after sync
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleCategorizeClick = async () => {
    try {
      setCategorizing(true);
      const result = await categorizeTransactions();
      alert(`✅ Categorized ${result.updated} transactions`);
      loadTransactions(); // refresh list
    } catch (err) {
      console.error("Categorization failed:", err);
      alert("❌ Categorization failed");
    } finally {
      setCategorizing(false);
    }
  };

  return (
    <div className="transaction-list">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          🧾 Your Transactions
        </h1>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={handleSyncClick}
            disabled={syncing}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {syncing ? "Fetching..." : "Fetch Transactions"}
          </button>

          <button
            onClick={handleCategorizeClick}
            disabled={categorizing}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {categorizing ? "Categorizing..." : "Categorize with AI"}
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No transactions found.</p>
      ) : (
        transactions.map((tx) => (
          <div
            key={tx.id}
            className={`transaction-card ${
              tx.type === "income" ? "income" : "expense"
            }`}
          >
            <div className="transaction-header">
              <div>
                <div className="transaction-title">{tx.item}</div>
                <div className="transaction-subtext">
                  {tx.date} •{" "}
                  <span className="tx-category">
                    {tx.primary_category || "Uncategorized"}
                    {tx.subcategory ? ` › ${tx.subcategory}` : ""}
                  </span>{" "}
                  • {tx.account_name}
                </div>
              </div>
              <div
                className={`transaction-amount ${
                  tx.type === "income" ? "income" : "expense"
                }`}
              >
                {tx.type === "income"
                  ? `+$${Math.abs(tx.amount).toFixed(2)}`
                  : `-$${Math.abs(tx.amount).toFixed(2)}`}
              </div>
            </div>
            <div className="transaction-balance">
              Balance: ${tx.balance_before.toFixed(2)} →{" "}
              <strong>${tx.balance_after.toFixed(2)}</strong>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
