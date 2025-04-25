import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { addTransaction, getTransactions } from "../firebase/firestore";
import "../styles/AddTransactionForm.css";
import AddTransactionFields from "./AddTransactionFields";

function AddTransactionForm({ onAdd }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    type: "expense",
    expenseType: "variable",
    paymentMethod: "",
    date: "",
    note: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const transaction = {
        ...formData,
        amount: parseFloat(formData.amount),
        isManual: true,
        isAI: false,
        accountId: "manual-entry",
      };

      await addTransaction(user.uid, transaction);

      if (onAdd) {
        const updated = await getTransactions(user.uid);
        onAdd(updated);
      }

      setFormData({
        name: "",
        amount: "",
        category: "",
        type: "expense",
        expenseType: "variable",
        paymentMethod: "",
        date: "",
        note: "",
      });
    } catch (err) {
      console.error("Add transaction error:", err);
      setError("Failed to add transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-transaction-form">
      <h3 className="form-title">Add Transaction</h3>

      <AddTransactionFields formData={formData} handleChange={handleChange} />

      <button type="submit" disabled={loading} className="submit-button">
        {loading ? "Adding..." : "Add Transaction"}
      </button>

      {error && <p className="error-message">{error}</p>}
    </form>
  );
}

export default AddTransactionForm;
