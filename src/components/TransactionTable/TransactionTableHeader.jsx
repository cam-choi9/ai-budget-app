import React from "react";

function TransactionTableHeader({
  filters,
  onUpdateFilters,
  accounts,
  categories,
  sortedAccounts,
}) {
  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    const updated = checked
      ? [...filters[name], value]
      : filters[name].filter((v) => v !== value);
    onUpdateFilters({ ...filters, [name]: updated });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    onUpdateFilters({ ...filters, [name]: value });
  };

  return (
    <thead>
      <tr>
        <th>Date</th>
        <th>
          Type
          <details className="filter-popover">
            <summary> ▾ </summary>
            <select
              name="type"
              value={filters.type}
              onChange={handleSelectChange}
            >
              <option value="all">All</option>
              <option value="expense">Expenses</option>
              <option value="revenue">Revenue</option>
              <option value="virtual">Virtual</option>
            </select>
          </details>
        </th>
        <th>
          Category
          <details className="filter-popover">
            <summary> ▾ </summary>
            <div>
              {categories.map((cat) => (
                <label key={cat}>
                  <input
                    type="checkbox"
                    name="categories"
                    value={cat}
                    checked={filters.categories.includes(cat)}
                    onChange={handleCheckboxChange}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </details>
        </th>
        <th>Item</th>
        <th>Amount</th>
        <th>
          Payment Method
          <details className="filter-popover">
            <summary> ▾ </summary>
            <div>
              {accounts.map((acc) => (
                <label key={acc}>
                  <input
                    type="checkbox"
                    name="paymentMethods"
                    value={acc}
                    checked={filters.paymentMethods.includes(acc)}
                    onChange={handleCheckboxChange}
                  />
                  {acc}
                </label>
              ))}
            </div>
          </details>
        </th>
        {sortedAccounts.map((acc) => (
          <th key={acc}>{acc} Balance</th>
        ))}
      </tr>
    </thead>
  );
}

export default TransactionTableHeader;
