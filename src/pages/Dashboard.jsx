import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlaidLinkButton from "../components/PlaidLinkButton";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:8000/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();
        console.log("📥 /api/me response text:", text);
        console.log("📥 /api/me status:", res.status);

        if (!res.ok) {
          throw new Error("Token invalid or expired");
        }

        const user = JSON.parse(text);
        console.log("✅ Authenticated user:", user);

        setUser(user);
        setLoading(false);
      } catch (err) {
        console.error("❌ Token invalid or expired", err);
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    }

    fetchUser();
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
        </div>
      ) : (
        <p>❌ Not authenticated</p>
      )}
    </div>
  );
}

export default Dashboard;

// import "../styles/Dashboard.css";
// import PlaidLinkButton from "../components/PlaidLinkButton";
// import AccountsDisplay from "../components/AccountsDisplay";
// import { useState, useEffect } from "react";
// import { fetchAccounts, refreshBalances } from "../services/plaidService";

// function Dashboard() {
//   const exchangePublicToken = async (public_token) => {
//     const token = localStorage.getItem("access_token");

//     const res = await fetch("/api/plaid/exchange_public_token", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         public_token,
//         useProd: import.meta.env.VITE_USE_PROD === "true",
//       }),
//     });

//     if (!res.ok) throw new Error("Failed to exchange token");
//     return await res.json();
//   };

//   const [accounts, setAccounts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // 🔁 Load accounts on mount
//   useEffect(() => {
//     async function loadAccounts() {
//       const result = await fetchAccounts();
//       if (result.success) {
//         setAccounts(result.accounts);
//       }
//       setLoading(false);
//     }

//     loadAccounts();
//   }, []);

//   const handleSuccess = async (public_token, metadata) => {
//     console.log("🏦 Received public_token:", public_token);
//     console.log("🏦 Received metadata:", metadata);

//     try {
//       const result = await exchangePublicToken(public_token);
//       console.log("✅ Token exchanged successfully:", result.item_id);

//       const updated = await fetchAccounts();
//       if (updated.success) setAccounts(updated.accounts);
//     } catch (err) {
//       console.error("❌ Token exchange failed:", err);
//     }
//   };

//   const handleRefresh = async () => {
//     try {
//       const result = await refreshBalances();
//       alert(`✅ Refreshed ${result.updated} account(s).`);

//       const updated = await fetchAccounts();
//       if (updated.success) setAccounts(updated.accounts);
//     } catch (err) {
//       console.error("❌ Failed to refresh balances:", err.message);
//       alert("Failed to refresh balances.");
//     }
//   };

//   return (
//     <div className="dashboard-page">
//       <h1>Dashboard</h1>

//       <div className="button-group">
//         <button onClick={handleRefresh}>🔄 Refresh Balances</button>
//         <PlaidLinkButton onSuccessCallback={handleSuccess} />
//       </div>

//       {!loading && accounts.length === 0 && (
//         <div className="link-bank-message">
//           <p>You haven’t linked any banks yet.</p>
//         </div>
//       )}

//       {accounts.length > 0 && (
//         <div style={{ marginTop: "2rem" }}>
//           <AccountsDisplay />
//         </div>
//       )}
//     </div>
//   );
// }

// export default Dashboard;
