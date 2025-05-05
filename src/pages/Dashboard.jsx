import "../styles/Dashboard.css";
import PlaidLinkButton from "../components/PlaidLinkButton";
import AccountsDisplay from "../components/AccountsDisplay"; // ✅ Import new component
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

function Dashboard() {
  const functions = getFunctions(getApp(), "us-central1");
  const exchangePublicToken = httpsCallable(functions, "exchangePublicToken");

  const handleSuccess = async (public_token, metadata) => {
    console.log("🏦 Received public_token:", public_token);
    console.log("🏦 Received metadata:", metadata);

    try {
      const result = await exchangePublicToken({ public_token });
      console.log("✅ Token exchanged successfully:", result.data.item_id);
    } catch (err) {
      console.error("❌ Token exchange failed:", err);
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <PlaidLinkButton onSuccessCallback={handleSuccess} />

      <div style={{ marginTop: "2rem" }}>
        <AccountsDisplay /> {/* ✅ Show linked accounts */}
      </div>
    </div>
  );
}

export default Dashboard;
