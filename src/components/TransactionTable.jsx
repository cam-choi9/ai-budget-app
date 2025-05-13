import React, { useEffect, useState } from "react";
import {
  fetchRealTransactions,
  fetchLatestAccountBalances,
} from "../firebase/firestore";
import "../styles/TransactionTable.css";

function TransactionTable() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountTypes, setAccountTypes] = useState({});
  const [filters, setFilters] = useState({
    type: "all",
    paymentMethods: [],
    categories: [],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [txs, latestBalances] = await Promise.all([
          fetchRealTransactions(),
          fetchLatestAccountBalances(),
        ]);
        console.log("🔥 Transactions fetched:", txs);
        console.log("🏦 Latest account balances:", latestBalances);
        computeSnapshots(txs, latestBalances);
      } catch (err) {
        console.error("❌ Failed to load data:", err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const format = (value, isCredit = false) => {
    let num = Number(value);
    if (isCredit && num > 0) num = Math.abs(num);
    const fixed = num.toFixed(2);
    return `$${fixed.startsWith("-0.00") ? "0.00" : fixed}`;
  };

  const computeSnapshots = (txs, latestBalances) => {
    const sorted = [...txs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const balances = {};
    const types = {};
    const result = [];

    for (const tx of sorted) {
      const acc = tx.account_name || "Unknown";
      const subtype = tx.subtype || tx.account_type || "other";

      if (!(acc in types)) {
        types[acc] =
          subtype.includes("credit") || subtype === "credit"
            ? "credit"
            : subtype.includes("checking") || subtype === "checking"
            ? "checking"
            : "other";
      }

      if (!(acc in balances)) {
        const fallback = 0;
        const latest = latestBalances[acc];
        balances[acc] = typeof latest === "number" ? latest : fallback;
      }
    }

    setAccountTypes(types);

    for (const tx of sorted) {
      const acc = tx.account_name || "Unknown";
      const type = types[acc];
      const isCredit = type === "credit";
      const amount = Number(tx.amount) || 0;

      const current = balances[acc];
      let previous = current;

      if (tx.type === "expense") {
        previous = isCredit ? current - amount : current + amount;
      } else if (tx.type === "revenue") {
        previous = isCredit ? current + amount : current - amount;
      }

      balances[acc] = previous;

      const snapshot = {};
      for (const name of Object.keys(balances)) {
        const isAcctCredit = types[name] === "credit";
        if (name === acc) {
          snapshot[name] = {
            changed: true,
            display: `${format(previous, isAcctCredit)} >> ${format(
              current,
              isAcctCredit
            )}`,
          };
        } else {
          snapshot[name] = {
            changed: false,
            display: format(balances[name], isAcctCredit),
          };
        }
      }

      result.push({ ...tx, balance_snapshot: snapshot });
    }

    setTransactions(result);
    setFiltered(result);
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    const updatedValues = checked
      ? [...filters[name], value]
      : filters[name].filter((val) => val !== value);

    const nextFilters = { ...filters, [name]: updatedValues };
    setFilters(nextFilters);

    const newFiltered = transactions.filter((tx) => {
      const matchType =
        nextFilters.type === "all" || tx.type === nextFilters.type;
      const matchPayment =
        nextFilters.paymentMethods.length === 0 ||
        nextFilters.paymentMethods.includes(tx.account_name);
      const matchCategory =
        nextFilters.categories.length === 0 ||
        nextFilters.categories.some((cat) =>
          tx.category?.join(" > ").includes(cat)
        );
      return matchType && matchPayment && matchCategory;
    });

    setFiltered(newFiltered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);

    const newFiltered = transactions.filter((tx) => {
      const matchType =
        nextFilters.type === "all" || tx.type === nextFilters.type;
      const matchPayment =
        nextFilters.paymentMethods.length === 0 ||
        nextFilters.paymentMethods.includes(tx.account_name);
      const matchCategory =
        nextFilters.categories.length === 0 ||
        nextFilters.categories.some((cat) =>
          tx.category?.join(" > ").includes(cat)
        );
      return matchType && matchPayment && matchCategory;
    });

    setFiltered(newFiltered);
  };

  const allAccounts = Array.from(
    new Set(
      transactions.flatMap((tx) => Object.keys(tx.balance_snapshot || {}))
    )
  );

  const sortedAccounts = allAccounts.sort((a, b) => {
    const typeA = accountTypes[a] || "other";
    const typeB = accountTypes[b] || "other";

    if (typeA === typeB) return a.localeCompare(b);
    if (typeA === "checking") return -1;
    if (typeB === "checking") return 1;
    if (typeA === "credit") return -1;
    if (typeB === "credit") return 1;
    return 0;
  });

  const uniqueAccounts = Array.from(
    new Set(transactions.map((tx) => tx.account_name || "Unknown"))
  );

  const uniqueCategories = Array.from(
    new Set(
      transactions.flatMap((tx) =>
        tx.category ? [tx.category.join(" > ")] : []
      )
    )
  );

  if (loading) return <p>Loading transactions...</p>;
  if (transactions.length === 0) return <p>No transactions found.</p>;

  return (
    <div className="transaction-table-container">
      <h2>💰 Transactions</h2>
      <table className="transaction-table">
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
                  onChange={handleFilterChange}
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
                  {uniqueCategories.map((cat) => (
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
                  {uniqueAccounts.map((acc) => (
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
        <tbody>
          {filtered.map((tx) => {
            const rowType =
              tx.type === "virtual"
                ? "virtual-row"
                : tx.type === "revenue"
                ? "revenue-row"
                : "real-row";

            return (
              <tr key={tx.id} className={rowType}>
                <td>{tx.date || "—"}</td>
                <td>{tx.type || "—"}</td>
                <td>{tx.category?.join(" > ") || "—"}</td>
                <td>{tx.name || "—"}</td>
                <td>${Number(tx.amount || 0).toFixed(2)}</td>
                <td>{tx.account_name || "—"}</td>
                {sortedAccounts.map((acc) => {
                  const cell = tx.balance_snapshot?.[acc];
                  return (
                    <td key={acc}>
                      {cell?.changed ? (
                        <strong>{cell.display}</strong>
                      ) : (
                        cell?.display || "—"
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
