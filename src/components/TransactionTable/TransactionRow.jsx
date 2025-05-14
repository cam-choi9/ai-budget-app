import React from "react";

function TransactionRow({ tx, sortedAccounts, onCategorize }) {
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
      <td>
        <td>
          {Array.isArray(tx.category)
            ? tx.category.join(" > ")
            : tx.category || "—"}
        </td>

        {!tx.category && (
          <button
            onClick={() => onCategorize(tx)}
            style={{ marginLeft: "0.5em" }}
          >
            Categorize
          </button>
        )}
      </td>
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
}

export default TransactionRow;
