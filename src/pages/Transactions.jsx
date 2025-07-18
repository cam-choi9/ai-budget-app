import { useEffect, useState } from "react";
import {
  fetchTransactions,
  syncTransactions,
  categorizeTransactions,
  updateTransaction,
  addTransaction,
} from "../services/transactions";

import AddTransactionForm from "../components/AddTransactionForm";

import "../styles/transactions.css";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const [newTx, setNewTx] = useState({
    user_id: 2, // hardcoded for now
    date: today,
    item: "",
    type: "expense",
    primary_category: "",
    subcategory: "",
    amount: "",
    account_name: "",
    account_type: "",
  });

  const loadTransactions = () => {
    setLoading(true);
    fetchTransactions(simulationMode)
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

  const handleSaveEdit = async (id) => {
    try {
      await updateTransaction(id, {
        item: editValues.item,
        primary_category: editValues.primary_category,
        subcategory: editValues.subcategory,
      });
      setEditingId(null);
      loadTransactions(); // refresh
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTx((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTransaction = async () => {
    try {
      if (!newTx.item || !newTx.amount) {
        alert("Item and amount are required.");
        return;
      }

      await addTransaction(newTx);
      setShowAddForm(false);
      setNewTx({
        user_id: 2,
        date: today,
        item: "",
        type: "expense",
        primary_category: "",
        subcategory: "",
        amount: "",
        account_name: "",
        account_type: "",
      });
      loadTransactions();
    } catch (err) {
      console.error("Failed to add transaction:", err);
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
          🧾 Transactions
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

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              backgroundColor: "#8b5cf6",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {showAddForm ? "Cancel" : "➕ Add Transaction"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <label style={{ fontWeight: 500 }}>Simulation Mode</label>
            <div
              onClick={() => {
                setSimulationMode(!simulationMode);
                setTimeout(() => loadTransactions(), 0);
              }}
              style={{
                width: "40px",
                height: "22px",
                borderRadius: "9999px",
                backgroundColor: simulationMode ? "#d1d5db" : "#10b981", // ✅ green if ON, gray if OFF
                position: "relative",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  backgroundColor: "#fff",
                  borderRadius: "9999px",
                  position: "absolute",
                  top: "2px",
                  left: simulationMode ? "2px" : "20px", // ✅ knob moves right when ON
                  transition: "left 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <AddTransactionForm
            newTx={newTx}
            onChange={handleInputChange}
            onSave={handleAddTransaction}
          />
        </div>
      )}

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
                {editingId === tx.id ? (
                  <>
                    <input
                      value={editValues.item || ""}
                      onChange={(e) =>
                        setEditValues({ ...editValues, item: e.target.value })
                      }
                      placeholder="Item"
                    />
                    <input
                      value={editValues.primary_category || ""}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          primary_category: e.target.value,
                        })
                      }
                      placeholder="Primary category"
                    />
                    <input
                      value={editValues.subcategory || ""}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          subcategory: e.target.value,
                        })
                      }
                      placeholder="Subcategory"
                    />
                    <button onClick={() => handleSaveEdit(tx.id)}>
                      💾 Save
                    </button>
                  </>
                ) : (
                  <>
                    <div className="transaction-title">{tx.item}</div>
                    <div className="transaction-subtext">
                      {tx.date} •{" "}
                      <span className="tx-category">
                        {tx.primary_category || "Uncategorized"}
                        {tx.subcategory ? ` › ${tx.subcategory}` : ""}
                      </span>{" "}
                      • {tx.account_name}
                    </div>
                  </>
                )}
              </div>

              <div className="amount-edit-wrapper">
                <div
                  className={`transaction-amount ${
                    tx.type === "income" ? "income" : "expense"
                  }`}
                >
                  {tx.type === "income"
                    ? `+$${Math.abs(tx.amount).toFixed(2)}`
                    : `-$${Math.abs(tx.amount).toFixed(2)}`}
                </div>
                {editingId !== tx.id && (
                  <button
                    onClick={() => {
                      setEditingId(tx.id);
                      setEditValues({
                        item: tx.item,
                        primary_category: tx.primary_category,
                        subcategory: tx.subcategory,
                      });
                    }}
                    className="edit-btn"
                  >
                    ✏️
                  </button>
                )}
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
