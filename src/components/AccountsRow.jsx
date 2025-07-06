import AccountCard from "./AccountCard";
import AddAccountCard from "./AddAccountCard";

function AccountsRow({ accounts, onAddClick }) {
  return (
    <div className="accounts-row">
      {accounts.map((account) => (
        <AccountCard key={account.account_id} account={account} />
      ))}
      <AddAccountCard onClick={onAddClick} />
    </div>
  );
}

export default AccountsRow;
