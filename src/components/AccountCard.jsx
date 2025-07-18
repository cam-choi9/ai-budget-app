import "../styles/AccountsRow.css";

function AccountCard({ account }) {
  const {
    institution_name,
    official_name,
    custom_name,
    account_type,
    last_four,
    balances,
    recent_transactions = [],
  } = account;

  // Handle credit vs checking/savings
  const isCredit = account_type === "credit";
  const rawBalance = isCredit ? balances?.current : balances?.available;
  const creditLimit = balances?.limit;

  let formattedBalance = "N/A";

  if (typeof rawBalance === "number") {
    // ✅ Show the real sign (negative or positive)
    const sign = rawBalance < 0 ? "-" : "";
    formattedBalance = `${sign}$${Math.abs(rawBalance).toFixed(2)}`;
  }

  const utilization =
    isCredit &&
    typeof rawBalance === "number" &&
    typeof creditLimit === "number"
      ? (rawBalance / creditLimit) * 100
      : null;

  const icon = isCredit ? "💳" : account_type === "savings" ? "🏦" : "💵";

  return (
    <div className="account-card">
      {/* Header: Icon + Account Name */}
      <div className="account-header">
        <span className="account-icon">{icon}</span>
        <div>
          <p className="account-institution">
            {custom_name ||
              `${institution_name} • ${account_type} • ****${last_four}`}
          </p>
          <p className="account-type">{official_name || ""}</p>
        </div>
      </div>

      {/* Balance Display */}
      <p className="account-balance">{formattedBalance}</p>

      {/* Credit Utilization (only for credit accounts) */}
      {isCredit && creditLimit && (
        <div className="credit-utilization-container">
          <div className="credit-utilization-bar-bg">
            <div
              className="credit-utilization-bar-fill"
              style={{ width: `${Math.min(utilization, 100)}%` }}
            ></div>
          </div>
          <p className="credit-utilization-label">
            {Math.round(utilization)}% of ${creditLimit.toFixed(2)} used
          </p>
        </div>
      )}

      {/* Recent Transactions */}
      {recent_transactions.length > 0 && (
        <div className="account-transactions">
          {recent_transactions.slice(0, 2).map((tx, idx) => (
            <p key={idx} className="transaction-item">
              • {tx.name} — ${tx.amount.toFixed(2)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default AccountCard;
