import "../styles/Dashboard.css";
import PlaidLinkButton from "../components/PlaidLinkButton";
import { getFunctions, httpsCallable } from "firebase/functions";

function Dashboard() {
  const functions = getFunctions();
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
    </div>
  );
}

export default Dashboard;
