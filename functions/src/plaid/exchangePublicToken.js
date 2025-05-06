import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import admin from "../utils/initFirebase.js";
import { getPlaidClient } from "../utils/plaidClient.js";

// 🔐 Define secrets
const PLAID_SANDBOX_CLIENT_ID = defineSecret("PLAID_SANDBOX_CLIENT_ID");
const PLAID_SANDBOX_SECRET = defineSecret("PLAID_SANDBOX_SECRET");
const PLAID_PROD_CLIENT_ID = defineSecret("PLAID_PROD_CLIENT_ID");
const PLAID_PROD_SECRET = defineSecret("PLAID_PROD_SECRET");

export const exchangePublicToken = onCall(
  {
    region: "us-central1",
    secrets: [
      PLAID_SANDBOX_CLIENT_ID,
      PLAID_SANDBOX_SECRET,
      PLAID_PROD_CLIENT_ID,
      PLAID_PROD_SECRET,
    ],
  },
  async (req) => {
    const { auth, data } = req;
    const publicToken = data.public_token;
    const useProd = data.useProd === true;

    if (!auth || !publicToken) {
      throw new Error("Missing authentication or public_token");
    }

    try {
      const plaidClient = getPlaidClient({
        clientId: useProd
          ? PLAID_PROD_CLIENT_ID.value()
          : PLAID_SANDBOX_CLIENT_ID.value(),
        secret: useProd
          ? PLAID_PROD_SECRET.value()
          : PLAID_SANDBOX_SECRET.value(),
        useProd,
      });

      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      await admin
        .firestore()
        .collection("users")
        .doc(auth.uid)
        .collection("plaid_tokens")
        .doc(itemId)
        .set({
          access_token: accessToken,
          item_id: itemId,
          environment: useProd ? "production" : "sandbox",
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(
        `✅ Token exchanged and stored for ${auth.uid} (${
          useProd ? "prod" : "sandbox"
        })`
      );
      return { item_id: itemId };
    } catch (error) {
      console.error(
        "❌ exchangePublicToken error:",
        error?.response?.data ?? error
      );
      throw new Error("Exchange failed");
    }
  }
);
