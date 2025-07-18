import React from "react";
import "../styles/AddTransactionForm.css";

export default function AddTransactionForm({ newTx, onChange, onSave }) {
  return (
    <div className="add-transaction-card">
      <h2 className="form-title">➕ Add a New Transaction</h2>

      <div className="form-grid">
        <input
          className="form-input"
          name="item"
          value={newTx.item}
          onChange={onChange}
          placeholder="Transaction name"
        />

        <input
          className="form-input"
          name="amount"
          type="number"
          value={newTx.amount}
          onChange={onChange}
          placeholder="Amount"
        />

        <select
          className="form-input"
          name="type"
          value={newTx.type}
          onChange={onChange}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          className="form-input"
          name="date"
          type="date"
          value={newTx.date}
          onChange={onChange}
        />

        <input
          className="form-input"
          name="primary_category"
          value={newTx.primary_category}
          onChange={onChange}
          placeholder="Primary Category"
        />

        <input
          className="form-input"
          name="subcategory"
          value={newTx.subcategory}
          onChange={onChange}
          placeholder="Subcategory"
        />

        <input
          className="form-input"
          name="account_name"
          value={newTx.account_name}
          onChange={onChange}
          placeholder="Account Name"
        />

        <select
          className="form-input"
          name="account_type"
          value={newTx.account_type}
          onChange={onChange}
        >
          <option value="">Account Type</option>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="credit">Credit</option>
          <option value="cash">Cash</option>
          <option value="investment">Investment</option>
          <option value="other">Other</option>
        </select>
      </div>

      <button className="form-button" onClick={onSave}>
        Save Transaction
      </button>
    </div>
  );
}
