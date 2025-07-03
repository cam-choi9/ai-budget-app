import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlaidLinkButton from "../components/PlaidLinkButton";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

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
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();
        console.log("📥 /api/me response text:", text);

        if (!res.ok) throw new Error("Token invalid or expired");

        const userData = JSON.parse(text);
        setUser(userData);

        // Fetch accounts info
        const accRes = await fetch("http://localhost:8000/api/plaid/accounts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const accData = await accRes.json();
        console.log("🏦 Accounts:", accData);

        setAccounts(accData.accounts || []);
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
    console.log("✅ Got public_token from Plaid:", public_token);

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
          body: JSON.stringify({ public_token }),
        }
      );

      if (!res.ok) throw new Error("Token exchange failed");

      const data = await res.json();
      console.log("✅ Successfully exchanged public_token:", data);
      alert("Bank account linked successfully!");

      // ✅ Refetch accounts
      const accRes = await fetch("http://localhost:8000/api/plaid/accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const accData = await accRes.json();
      setAccounts(accData.accounts || []);
    } catch (err) {
      console.error("❌ Failed to exchange Plaid token", err);
      alert("Linking bank account failed.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-page">
      <h1>Welcome to your Dashboard</h1>
      {user ? (
        <div>
          <p>
            ✅ Logged in as: <strong>{user.email}</strong>
          </p>
          <p>User ID: {user.id}</p>
          <br />
          <PlaidLinkButton onSuccessCallback={handlePlaidSuccess} />
          <h2>💳 Linked Accounts</h2>
          {accounts.length === 0 ? (
            <p>No accounts linked.</p>
          ) : (
            <ul>
              {accounts.map((acc) => (
                <li key={acc.account_id}>
                  <strong>{acc.name}</strong> — {acc.subtype} — $
                  {acc.balances.available ?? "N/A"}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p>❌ Not authenticated</p>
      )}
    </div>
  );
}

export default Dashboard;
