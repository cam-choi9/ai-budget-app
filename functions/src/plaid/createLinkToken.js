import { onRequest } from "firebase-functions/v2/https";
import { getPlaidClient } from "../utils/plaidClient.js";

export const createLinkToken = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 60,
    secrets: ["PLAID_CLIENT_ID", "PLAID_SECRET"], // uses Firebase Secret Manager
  },

  async (req, res) => {
    console.log("[createLinkToken] Incoming request method:", req.method);

    // ✅ Set CORS headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    // ✅ Preflight OPTIONS check
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      const plaidClient = getPlaidClient();

      const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: "test-user-id" }, // Later: use context.auth.uid
        client_name: "Better & Better - AI Budget App",
        products: ["auth", "transactions"],
        country_codes: ["US"],
        language: "en",
      });

      console.log("[createLinkToken] ✅ Link token created");
      res.status(200).json({ link_token: response.data.link_token });
    } catch (error) {
      console.error(
        "[createLinkToken] ❌ Error:",
        error?.response?.data ?? error
      );
      res.status(500).json({ error: "Failed to create link token" });
    }
  }
);
