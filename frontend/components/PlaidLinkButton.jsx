import { useEffect, useState } from "react";

function PlaidLinkButton({ onSuccessCallback }) {
  const [linkToken, setLinkToken] = useState(null);

  useEffect(() => {
    async function fetchLinkToken() {
      try {
        const res = await fetch(
          "http://localhost:8000/api/plaid/create_link_token",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        const data = await res.json();
        setLinkToken(data.link_token);
      } catch (err) {
        console.error("Error fetching link token:", err);
      }
    }

    fetchLinkToken();
  }, []);

  const handleClick = () => {
    if (!linkToken) return;

    if (window.Plaid) {
      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: onSuccessCallback, // ✅ delegate to parent (Dashboard)
        onExit: (err, metadata) => {
          console.warn("👋 Plaid Exit:", err, metadata);
        },
      });

      handler.open();
    } else {
      console.error("🚫 Plaid script not loaded. Check your index.html.");
      alert("Plaid is not ready. Please refresh and try again.");
    }
  };

  return (
    <button
      id="plaid-link-btn"
      onClick={handleClick}
      style={{ display: "none" }}
    >
      🔗 Link Bank Account
    </button>
  );
}

export default PlaidLinkButton;
