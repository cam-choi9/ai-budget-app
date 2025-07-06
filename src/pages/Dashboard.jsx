import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlaidLinkButton from "../components/PlaidLinkButton";
import AccountsDisplay from "../components/AccountsDisplay";
import GreetingHeader from "../components/GreetingHeader";
import SummaryRow from "../components/SummaryRow";
import AccountsRow from "../components/AccountsRow";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchAccounts() {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("access_token");
      const accRes = await fetch("http://localhost:8000/api/plaid/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const accData = await accRes.json();
      console.log("🔁 Refreshed Accounts:", accData);
      setAccounts(accData.accounts || []);
    } catch (err) {
      console.error("❌ Failed to refresh accounts", err);
      alert("Failed to refresh accounts");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchUserAndAccounts() {
      try {
        // Fetch user info
        const res = await fetch("http://localhost:8000/api/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        const text = await res.text();
        if (!res.ok) throw new Error("Token invalid or expired");
        const userData = JSON.parse(text);
        setUser(userData);

        await fetchAccounts();
      } catch (err) {
        console.error("❌ Dashboard load failed:", err);
        localStorage.removeItem("access_token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndAccounts();
  }, [navigate]);

  const handlePlaidSuccess = async (public_token, metadata) => {
    console.log("✅ Got public_token from Plaid:", public_token, metadata);

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        "http://localhost:8000/api/plaid/exchange_public_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ public_token, metadata }), // ✅ ensure metadata is included
        }
      );

      if (!res.ok) throw new Error("Token exchange failed");

      const data = await res.json();
      console.log("✅ Successfully exchanged public_token:", data);
      alert(`Bank account linked successfully! (${data.institution_name})`);

      // ✅ Refetch accounts
      const accRes = await fetch("http://localhost:8000/api/plaid/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const accData = await accRes.json();
      setAccounts(accData.accounts || []);
    } catch (err) {
      console.error("❌ Failed to exchange Plaid token", err);
      alert("Linking bank account failed.");
    }
  };

  if (loading) return <p>Loading...</p>;

  function calculateTotalBalance(accounts) {
    let total = 0;
    for (const acc of accounts) {
      const isCredit = acc.type === "credit";
      const raw = isCredit ? acc.balances?.current : acc.balances?.available;
      if (typeof raw === "number") {
        total += isCredit ? -raw : raw;
      }
    }
    return total.toFixed(2);
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {user ? (
          <div>
            <GreetingHeader name={user?.name || user?.email?.split("@")[0]} />
            <SummaryRow totalBalance={calculateTotalBalance(accounts)} />
            <PlaidLinkButton onSuccessCallback={handlePlaidSuccess} />

            <div className="accounts-section">
              <div className="accounts-header">
                <h2>💳 Bank Accounts</h2>
                <button className="refresh-btn" onClick={fetchAccounts}>
                  🔁 Refresh Balances
                </button>
              </div>

              <AccountsRow
                accounts={accounts}
                onAddClick={() =>
                  document.getElementById("plaid-link-btn")?.click()
                }
              />
            </div>
          </div>
        ) : (
          <p>❌ Not authenticated</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
