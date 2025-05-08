import React, { useEffect, useState } from "react";
import { fetchRealTransactions } from "../firebase/firestore";
import "../styles/TransactionTable.css";

function TransactionTable() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealTransactions()
      .then((data) => {
        console.log("🔥 Transactions fetched:", data);
        computeBacktrackedBalances(data);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch transactions:", err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const computeBacktrackedBalances = (txs) => {
    const sorted = [...txs].sort((a, b) => new Date(b.date) - new Date(a.date)); // newest → oldest

    const balances = {};
    const accountTypes = {};

    // Initialize current known balances
    for (const tx of sorted) {
      const acc = tx.account_name || "Unknown";

      if (!(acc in balances)) {
        const current = Number(tx?.balances?.current);
        balances[acc] = isNaN(current) ? 0 : current;
        accountTypes[acc] =
          tx.subtype === "credit" || tx.account_type === "credit"
            ? "credit"
            : "bank";
      }
    }

    // Process each transaction in descending order (latest → oldest)
    const withSnapshots = sorted.map((tx) => {
      const acc = tx.account_name || "Unknown";
      const isCredit = accountTypes[acc] === "credit";
      const amount = Number(tx.amount) || 0;

      // Reverse this transaction to get previous balance
      if (tx.type === "expense") {
        balances[acc] += isCredit ? -amount : amount;
      } else if (tx.type === "revenue") {
        balances[acc] += isCredit ? amount : -amount;
      }

      // 🧠 This is the balance AFTER reversing (i.e., balance *at* the time of this transaction)
      const snapshot = { ...balances };

      return { ...tx, balance_after: snapshot };
    });

    // Set transactions in same order as original (most recent first)
    setTransactions(withSnapshots);
  };

  if (loading) return <p>Loading transactions...</p>;
  if (transactions.length === 0) return <p>No transactions found.</p>;

  const allAccounts = Array.from(
    new Set(transactions.flatMap((tx) => Object.keys(tx.balance_after || {})))
  );

  return (
    <div className="transaction-table-container">
      <h2>💰 Transactions</h2>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Item</th>
            <th>Category</th>
            <th>Payment Method</th>
            <th>Amount</th>
            <th>Type</th>
            {allAccounts.map((acc) => (
              <th key={acc}>{acc} Balance</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const rowType =
              tx.type === "virtual"
                ? "virtual-row"
                : tx.type === "revenue"
                ? "revenue-row"
                : "real-row";

            return (
              <tr key={tx.id} className={rowType}>
                <td>{tx.date || "—"}</td>
                <td>{tx.name || "—"}</td>
                <td>{tx.category?.join(" > ") || "—"}</td>
                <td>{tx.account_name || "—"}</td>
                <td>{`$${Number(tx.amount || 0).toFixed(2)}`}</td>
                <td>{tx.type || "—"}</td>
                {allAccounts.map((acc) => (
                  <td key={acc}>
                    {!isNaN(tx.balance_after?.[acc])
                      ? `$${tx.balance_after[acc].toFixed(2)}`
                      : "—"}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
