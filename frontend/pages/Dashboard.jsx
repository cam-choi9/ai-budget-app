import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopSpendingCategories from "../components/TopSpendingCategories";
import PlaidLinkButton from "../components/PlaidLinkButton";
import GreetingHeader from "../components/GreetingHeader";
import SummaryRow from "../components/SummaryRow";
import AccountsRow from "../components/AccountsRow";
import "../styles/Dashboard.css";
import { getJSON, postJSON, putJSON, delJSON } from "../src/lib/api";

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

      const accData = await getJSON("/api/plaid/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });

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
        const token = localStorage.getItem("access_token");

        const userData = await getJSON("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // save user
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

      // Exchange the public_token for access_token on the backend
      const data = await postJSON(
        "/api/plaid/exchange_public_token",
        {
          public_token,
          metadata, // keep if your backend reads/records it
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Successfully exchanged public_token:", data);
      alert(`Bank account linked successfully! (${data.institution_name})`);

      // ✅ Refetch accounts
      const accData = await getJSON("/api/plaid/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const isCredit = acc.account_type === "credit";
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

            <div className="spending-section">
              <h2>📊 Top Spending Categories</h2>
              <TopSpendingCategories />
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
