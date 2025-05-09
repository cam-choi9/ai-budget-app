import "../styles/Dashboard.css";
import PlaidLinkButton from "../components/PlaidLinkButton";
import AccountsDisplay from "../components/AccountsDisplay";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";
import { useState, useEffect } from "react";
import { fetchAccounts, refreshBalances } from "../services/plaidService";

function Dashboard() {
  const functions = getFunctions(getApp(), "us-central1");
  const exchangePublicToken = httpsCallable(functions, "exchangePublicToken");

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Load accounts on mount
  useEffect(() => {
    async function loadAccounts() {
      const result = await fetchAccounts();
      if (result.success) {
        setAccounts(result.accounts);
      }
      setLoading(false);
    }

    loadAccounts();
  }, []);

  const handleSuccess = async (public_token, metadata) => {
    console.log("🏦 Received public_token:", public_token);
    console.log("🏦 Received metadata:", metadata);

    try {
      const result = await exchangePublicToken({
        public_token,
        useProd: import.meta.env.VITE_USE_PROD === "true",
      });
      console.log("✅ Token exchanged successfully:", result.data.item_id);

      const updated = await fetchAccounts();
      if (updated.success) setAccounts(updated.accounts);
    } catch (err) {
      console.error("❌ Token exchange failed:", err);
    }
  };

  const handleRefresh = async () => {
    try {
      const result = await refreshBalances();
      alert(`✅ Refreshed ${result.updated} account(s).`);

      const updated = await fetchAccounts();
      if (updated.success) setAccounts(updated.accounts);
    } catch (err) {
      console.error("❌ Failed to refresh balances:", err.message);
      alert("Failed to refresh balances.");
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <div className="button-group">
        <button onClick={handleRefresh}>🔄 Refresh Balances</button>
        <PlaidLinkButton onSuccessCallback={handleSuccess} />
      </div>

      {!loading && accounts.length === 0 && (
        <div className="link-bank-message">
          <p>You haven’t linked any banks yet.</p>
        </div>
      )}

      {accounts.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <AccountsDisplay />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
