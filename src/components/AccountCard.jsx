import "../styles/AccountsRow.css";

function AccountCard({ account }) {
  const {
    institution_name,
    name,
    mask,
    type,
    subtype,
    balances,
    recent_transactions = [],
  } = account;

  const isCredit = type === "credit";
  const rawBalance = isCredit ? balances?.current : balances?.available;
  const creditLimit = balances?.limit;

  const formattedBalance =
    typeof rawBalance === "number"
      ? `$${Math.abs(rawBalance).toFixed(2)}`
      : "N/A";

  const utilization =
    isCredit &&
    typeof rawBalance === "number" &&
    typeof creditLimit === "number"
      ? (rawBalance / creditLimit) * 100
      : null;

  const icon = isCredit ? "💳" : subtype === "savings" ? "🏦" : "💵";

  return (
    <div className="account-card">
      <div className="account-header">
        <span className="account-icon">{icon}</span>
        <div>
          <p className="account-institution">
            {institution_name || "Unnamed Bank"}
          </p>
          <p className="account-type">{`${subtype || type} ••••${
            mask || "XXXX"
          }`}</p>
        </div>
      </div>

      <p className="account-balance">{formattedBalance}</p>

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
