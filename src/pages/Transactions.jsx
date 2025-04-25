import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTransactions, addTransaction } from "../firebase/firestore";
import AddTransactionForm from "../components/AddTransactionForm";

function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (user) {
      getTransactions(user.uid).then(setTransactions);
    }
  }, [user]);

  return (
    <div className="dashboard">
      <h2>Transactions</h2>

      {/* Add Transaction Form */}
      <AddTransactionForm onAdd={setTransactions} />

      {/* Transaction List */}
      <ul style={{ marginTop: "2rem" }}>
        {transactions.map((tx) => (
          <li key={tx.id}>
            <strong>{tx.name}</strong> — ${tx.amount} ({tx.category})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Transactions;
