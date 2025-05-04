import { onCall } from "firebase-functions/v2/https";
import admin from "../utils/initFirebase.js";
import { getPlaidClient } from "../utils/plaidClient.js";

export const exchangePublicToken = onCall(
  {
    region: "us-central1",
    secrets: ["PLAID_CLIENT_ID", "PLAID_SECRET"], // Load securely from Firebase Secret Manager
  },
  async (req) => {
    const { auth, data } = req;
    const publicToken = data.public_token;

    if (!auth) {
      throw new Error("User must be authenticated.");
    }

    try {
      const plaidClient = getPlaidClient();

      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      await admin
        .firestore()
        .collection("users")
        .doc(auth.uid)
        .collection("plaid")
        .doc(itemId)
        .set({
          access_token: accessToken,
          item_id: itemId,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

      return { item_id: itemId };
    } catch (error) {
      console.error("Token exchange error:", error?.response?.data ?? error);
      throw new Error("Exchange failed");
    }
  }
);
