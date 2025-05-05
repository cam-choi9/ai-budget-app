import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import admin from "../utils/initFirebase.js";
import { getPlaidClient } from "../utils/plaidClient.js";

// Declare secrets
const PLAID_CLIENT_ID = defineSecret("PLAID_CLIENT_ID");
const PLAID_SECRET = defineSecret("PLAID_SECRET");

export const exchangePublicToken = onCall(
  {
    region: "us-central1",
    secrets: [PLAID_CLIENT_ID, PLAID_SECRET],
  },
  async (req) => {
    const { auth, data } = req;
    const publicToken = data.public_token;

    if (!auth) {
      throw new Error("User must be authenticated.");
    }

    try {
      const plaidClient = getPlaidClient({
        clientId: PLAID_CLIENT_ID.value(),
        secret: PLAID_SECRET.value(),
      });

      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      // ✅ Save access_token at users/{uid} for getAccounts.js to access
      await admin.firestore().collection("users").doc(auth.uid).set(
        {
          access_token: accessToken,
          item_id: itemId,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      console.log("✅ Token exchanged and saved under users/" + auth.uid);
      return { item_id: itemId };
    } catch (error) {
      console.error("❌ Token exchange error:", error?.response?.data ?? error);
      throw new Error("Exchange failed");
    }
  }
);
