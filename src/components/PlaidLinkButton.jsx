import { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { getLinkToken } from "../services/plaidService"; // 👈 import your service here

export default function PlaidLinkButton({ onSuccessCallback }) {
  const [linkToken, setLinkToken] = useState(null);

  useEffect(() => {
    async function fetchLinkToken() {
      const token = await getLinkToken();
      setLinkToken(token);
    }
    fetchLinkToken();
  }, []);

  const config = {
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      console.log("✅ Plaid Link onSuccess triggered");
      console.log("Public Token:", public_token);
      console.log("Metadata:", metadata);
      if (onSuccessCallback) {
        onSuccessCallback(public_token, metadata);
      }
    },
    onExit: (err, metadata) => {
      console.log("👋 Plaid Link exited", err, metadata);
    },
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect a bank account
    </button>
  );
}
