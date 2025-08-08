function AddTransactionFields({ formData, handleChange }) {
  return (
    <>
      <div className="input-group">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
      </div>

      <div className="input-group">
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          required
        />
      </div>

      <div className="input-group">
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-group">
        <input
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          required
        />
      </div>

      <div className="input-group">
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div className="input-group">
        <select
          name="expenseType"
          value={formData.expenseType}
          onChange={handleChange}
        >
          <option value="fixed">Fixed</option>
          <option value="variable">Variable</option>
        </select>
      </div>

      <div className="input-group">
        <input
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          placeholder="Payment Method (e.g. Chase, BofA)"
        />
      </div>

      <div className="input-group">
        <textarea
          name="note"
          placeholder="Note (optional)"
          value={formData.note}
          onChange={handleChange}
        />
      </div>
    </>
  );
}

export default AddTransactionFields;
