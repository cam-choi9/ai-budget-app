import React, { useEffect, useState } from "react";
import { fetchAccounts } from "../services/plaidService";
import "../styles/AccountsDisplay.css";

const AccountsDisplay = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await fetchAccounts();
      if (res.success) {
        setBanks(res.accounts);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) return <p>Loading linked accounts...</p>;

  return (
    <div className="accounts-wrapper">
      <h2>🏦 Linked Bank Accounts</h2>

      {banks.length === 0 && <p>No banks linked yet.</p>}

      {banks.map((bank, idx) => (
        <div key={idx} className="institution-card">
          <div className="institution-header">
            <div className="institution-logo">🏦</div>
            <span>{bank.institution}</span>
          </div>

          {bank.accounts.length > 0 ? (
            <div className="account-list">
              {bank.accounts.map((acc, j) => (
                <div key={j} className="account-item">
                  <p>
                    <strong>{acc.name}</strong> ({acc.subtype})
                  </p>
                  <p>💳 Masked: •••• {acc.mask}</p>
                  <p>
                    ✅ Available: $
                    {acc.balances?.available != null
                      ? acc.balances.available.toFixed(2)
                      : "N/A"}
                  </p>
                  <p>
                    📘 Current: $
                    {acc.balances?.current != null
                      ? acc.balances.current.toFixed(2)
                      : "N/A"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-accounts">No accounts found for this bank.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AccountsDisplay;
