import { storePlaidTransactions } from "../services/plaidService";
import TransactionTable from "../components/TransactionTable/TransactionTable";

function Transactions() {
  const handleSync = async () => {
    try {
      const result = await storePlaidTransactions();
      alert(`✅ Synced ${result.count} transactions.`);
    } catch (err) {
      alert("❌ Failed to sync transactions.");
    }
  };

  return (
    <div className="dashboard">
      <h1>Transactions</h1>
      <button onClick={handleSync}>🔄 Sync Transactions from Plaid</button>

      {/* ✅ Show synced transaction table */}
      <TransactionTable />
    </div>
  );
}

export default Transactions;
