import React, { useEffect, useState } from "react";
import TransactionTableHeader from "./TransactionTableHeader";
import TransactionRow from "./TransactionRow";
import {
  fetchRealTransactions,
  fetchLatestAccountBalances,
} from "../../firebase/firestore";
import {
  computeSnapshots,
  getUniqueAccounts,
  getUniqueCategories,
  filterTransactions,
} from "./transactionUtils";
import { useCategorizeTransaction } from "./useCategorizeTransaction";
import "../../styles/TransactionTable.css";

function TransactionTable() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [accountTypes, setAccountTypes] = useState({});
  const [filters, setFilters] = useState({
    type: "all",
    paymentMethods: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const { categorizeTransaction } = useCategorizeTransaction();

  useEffect(() => {
    (async () => {
      try {
        const [txs, balances] = await Promise.all([
          fetchRealTransactions(),
          fetchLatestAccountBalances(),
        ]);
        const { result, types } = computeSnapshots(txs, balances);
        setTransactions(result);
        setFiltered(result);
        setAccountTypes(types);
      } catch (err) {
        console.error("❌ Load error:", err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applyFilters = (nextFilters) => {
    setFilters(nextFilters);
    setFiltered(filterTransactions(transactions, nextFilters));
  };

  const handleCategorizeAll = async () => {
    const updated = [...transactions];
    for (const tx of filtered.filter((t) => !t.category)) {
      try {
        const category = await categorizeTransaction(tx);
        updated.find((t) => t.id === tx.id).category = [category];
      } catch (err) {
        console.error(`❌ Categorization failed: ${tx.id}`, err.message);
      }
    }
    setTransactions(updated);
    setFiltered(filterTransactions(updated, filters));
  };

  if (loading) return <p>Loading transactions...</p>;
  if (!transactions.length) return <p>No transactions found.</p>;

  const sortedAccounts = getUniqueAccounts(transactions, accountTypes);
  const uniqueAccounts = [
    ...new Set(transactions.map((tx) => tx.account_name || "Unknown")),
  ];
  const uniqueCategories = getUniqueCategories(transactions);

  return (
    <div className="transaction-table-container">
      <h2>💰 Transactions</h2>
      <button onClick={handleCategorizeAll}>Categorize All</button>
      <table className="transaction-table">
        <TransactionTableHeader
          filters={filters}
          onUpdateFilters={applyFilters}
          accounts={uniqueAccounts}
          categories={uniqueCategories}
          sortedAccounts={sortedAccounts}
        />
        <tbody>
          {filtered.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              sortedAccounts={sortedAccounts}
              onCategorize={categorizeTransaction}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
