import "../styles/AddTransactionForm.css";

export default function AddTransactionForm({
  newTx,
  onChange,
  onSave,
  accounts,
}) {
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

        <select
          className="form-input"
          name="account_id"
          value={newTx.account_id}
          onChange={onChange}
          required
          style={{ minWidth: "300px" }} // ✅ Wider dropdown
        >
          <option value="">Select Linked Account</option>
          {accounts.map((acc) => {
            const label = acc.custom_name?.trim()
              ? acc.custom_name
              : `${acc.institution_name} ${acc.subtype} •••${acc.mask}`;
            return (
              <option key={acc.id} value={acc.id}>
                {label}
              </option>
            );
          })}
        </select>
      </div>

      <button className="form-button" onClick={onSave}>
        Save Transaction
      </button>
    </div>
  );
}
