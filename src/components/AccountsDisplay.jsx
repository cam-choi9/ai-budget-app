import React, { useEffect, useState } from "react";
import { fetchAccounts } from "../services/plaidService";

const AccountsDisplay = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts().then((res) => {
      if (res.success) {
        setAccounts(res.accounts);
      } else {
        console.error(res.error);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading accounts...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">💰 Linked Bank Accounts</h2>
      {accounts.map((acc) => (
        <div key={acc.account_id} className="border p-4 mb-3 rounded shadow">
          <p>
            <strong>{acc.name}</strong> ({acc.subtype})
          </p>
          <p>💳 Masked: •••• {acc.mask}</p>
          <p>
            ✅ Available Balance: ${acc.balances.available?.toFixed(2) ?? "N/A"}
          </p>
          <p>
            📘 Current Balance: ${acc.balances.current?.toFixed(2) ?? "N/A"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AccountsDisplay;
