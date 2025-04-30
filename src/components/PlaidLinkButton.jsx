import { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { getLinkToken } from "../services/plaidService"; // 👈 import your service here

export default function PlaidLinkButton() {
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
      console.log("Public Token:", public_token);
      console.log("Metadata:", metadata);
      // TODO: after this, we exchange public_token -> access_token via backend
    },
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect a bank account
    </button>
  );
}
