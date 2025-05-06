import React, { useEffect, useState } from "react";
import { fetchAccounts, fetchInstitution } from "../services/plaidService";
import "../styles/AccountsDisplay.css";

const envLabel = {
  sandbox: "🧪 Sandbox",
  production: "✅ Production",
};

const AccountsDisplay = () => {
  const [accounts, setAccounts] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [accRes, instRes] = await Promise.all([
        fetchAccounts(),
        fetchInstitution(),
      ]);

      if (accRes.success) setAccounts(accRes.accounts);
      if (instRes.success) setInstitutions(instRes.institutions);

      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) return <p>Loading linked accounts...</p>;

  const grouped = institutions.reduce((acc, inst) => {
    const env = inst.environment;
    if (!acc[env]) acc[env] = [];
    acc[env].push(inst);
    return acc;
  }, {});

  return (
    <div className="accounts-wrapper">
      <h2>🏦 Linked Institutions</h2>

      {Object.entries(grouped).map(([env, envInstitutions]) => (
        <div key={env} className="env-section">
          <div className="env-label">{envLabel[env]}</div>

          {envInstitutions.map(({ item_id, institution }) => {
            const relatedAccounts = accounts.filter(
              (acc) => acc.item_id === item_id
            );

            return (
              <div key={item_id} className="institution-card">
                <div className="institution-header">
                  {institution.logo ? (
                    <img
                      src={`data:image/png;base64,${institution.logo}`}
                      alt={institution.name}
                      className="institution-logo"
                    />
                  ) : (
                    <div className="institution-logo">🏦</div>
                  )}
                  <span>{institution.name}</span>
                </div>

                {relatedAccounts.length > 0 ? (
                  <div className="account-list">
                    {relatedAccounts.map((acc) => (
                      <div key={acc.account_id} className="account-item">
                        <p>
                          <strong>{acc.name}</strong> ({acc.subtype})
                        </p>
                        <p>💳 Masked: •••• {acc.mask}</p>
                        <p>
                          ✅ Available: $
                          {acc.balances?.available?.toFixed(2) ?? "N/A"}
                        </p>
                        <p>
                          📘 Current: $
                          {acc.balances?.current?.toFixed(2) ?? "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-accounts">
                    No accounts found for this bank.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default AccountsDisplay;
