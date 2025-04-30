import "../styles/Dashboard.css";
import PlaidLinkButton from "../components/PlaidLinkButton";

function Dashboard() {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <PlaidLinkButton
        onSuccessCallback={(public_token, metadata) => {
          console.log("🏦 Received public_token:", public_token);
          console.log("🏦 Received metadata:", metadata);
          // Next step: send public_token to backend for secure exchange
        }}
      />
    </div>
  );
}

export default Dashboard;
