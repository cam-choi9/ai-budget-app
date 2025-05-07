import { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { getLinkToken } from "../services/plaidService";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

export default function PlaidLinkButton({ onSuccessCallback }) {
  const [linkToken, setLinkToken] = useState(null);

  useEffect(() => {
    async function fetchLinkToken() {
      const token = await getLinkToken();
      setLinkToken(token);
    }
    fetchLinkToken();
  }, []);

  const functions = getFunctions(getApp(), "us-central1");
  const exchangePublicToken = httpsCallable(functions, "exchangePublicToken");

  const config = {
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      console.log("✅ Plaid Link onSuccess triggered");
      console.log("Public Token:", public_token);
      console.log("Metadata:", metadata);

      try {
        const result = await exchangePublicToken({
          public_token,
          useProd: import.meta.env.VITE_USE_PROD === "true",
        });
        console.log("✅ Token exchanged and stored:", result.data);

        if (onSuccessCallback) {
          onSuccessCallback(public_token, metadata);
        }
      } catch (err) {
        console.error("❌ Failed to exchange token:", err.message);
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
