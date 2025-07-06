import "../styles/AccountsRow.css";

function AddAccountCard({ onClick }) {
  return (
    <div className="account-card add-account-card" onClick={onClick}>
      <div className="add-account-content">
        <p className="add-plus">＋ Add Bank Account</p>
        <p className="add-subtext">Connect a new account with Plaid</p>
      </div>
    </div>
  );
}

export default AddAccountCard;
