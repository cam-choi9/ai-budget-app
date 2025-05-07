import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { getPlaidClient } from "../utils/plaidClient.js";
import admin from "../utils/initFirebase.js";

const PLAID_SANDBOX_CLIENT_ID = defineSecret("PLAID_SANDBOX_CLIENT_ID");
const PLAID_SANDBOX_SECRET = defineSecret("PLAID_SANDBOX_SECRET");
const PLAID_PROD_CLIENT_ID = defineSecret("PLAID_PROD_CLIENT_ID");
const PLAID_PROD_SECRET = defineSecret("PLAID_PROD_SECRET");

export const createLinkToken = onRequest(
  {
    region: "us-central1",
    secrets: [
      PLAID_SANDBOX_CLIENT_ID,
      PLAID_SANDBOX_SECRET,
      PLAID_PROD_CLIENT_ID,
      PLAID_PROD_SECRET,
    ],
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      const authHeader = req.headers.authorization;
      let uid = "anonymous";

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split("Bearer ")[1];
        const decoded = await admin.auth().verifyIdToken(token);
        uid = decoded.uid;
      }

      const useProd = req.query.env === "prod" || req.body?.env === "prod";

      const clientId = useProd
        ? PLAID_PROD_CLIENT_ID.value()
        : PLAID_SANDBOX_CLIENT_ID.value();
      const secret = useProd
        ? PLAID_PROD_SECRET.value()
        : PLAID_SANDBOX_SECRET.value();

      // console.log("🛠️ useProd:", useProd);
      // console.log("🛠️ clientId:", clientId);
      // console.log("🛠️ secret:", secret);

      if (!clientId || !secret) {
        throw new Error("Plaid credentials are undefined");
      }

      const plaidClient = getPlaidClient({
        clientId,
        secret,
        useProd,
      });

      const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: uid }, // ✅ Dynamic ID for production
        client_name: "AI Budget App",
        products: ["transactions"],
        country_codes: ["US"],
        language: "en",
      });

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
