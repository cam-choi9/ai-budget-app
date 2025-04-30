const { onRequest } = require("firebase-functions/v2/https");
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

exports.createLinkToken = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 60,
    secrets: ["PLAID_CLIENT_ID", "PLAID_SECRET"], // ✅ tell Firebase this function uses these secrets
  },
  async (req, res) => {
    console.log("[createLinkToken] Incoming request method:", req.method);

    // ✅ Always set CORS headers manually
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    // ✅ Preflight OPTIONS request
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      // ✅ Load from environment variables (Cloud Secrets)
      const clientId = process.env.PLAID_CLIENT_ID || "MISSING_CLIENT_ID";
      const secret = process.env.PLAID_SECRET || "MISSING_SECRET";

      if (clientId === "MISSING_CLIENT_ID" || secret === "MISSING_SECRET") {
        throw new Error("Missing Plaid credentials in environment variables.");
      }

      // ✅ Initialize Plaid API Client
      const plaidClient = new PlaidApi(
        new Configuration({
          basePath: PlaidEnvironments.sandbox,
          baseOptions: {
            headers: {
              "PLAID-CLIENT-ID": clientId,
              "PLAID-SECRET": secret,
            },
          },
        })
      );

      // ✅ Request Link Token from Plaid
      const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: "test-user-id" },
        client_name: "AI Budget App",
        products: ["auth", "transactions"],
        country_codes: ["US"],
        language: "en",
      });

      console.log("[createLinkToken] Link token created successfully.");
      res.status(200).json({ link_token: response.data.link_token });
    } catch (error) {
      console.error(
        "[createLinkToken] Full error object:",
        JSON.stringify(error, Object.getOwnPropertyNames(error))
      );
      res.status(500).json({ error: "Failed to create link token" });
    }
  }
);
