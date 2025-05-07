import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import admin from "../utils/initFirebase.js";
import { getPlaidClient } from "../utils/plaidClient.js";

const PLAID_SANDBOX_CLIENT_ID = defineSecret("PLAID_SANDBOX_CLIENT_ID");
const PLAID_SANDBOX_SECRET = defineSecret("PLAID_SANDBOX_SECRET");
const PLAID_PROD_CLIENT_ID = defineSecret("PLAID_PROD_CLIENT_ID");
const PLAID_PROD_SECRET = defineSecret("PLAID_PROD_SECRET");

export const getTransactions = onCall(
  {
    region: "us-central1",
    secrets: [
      PLAID_SANDBOX_CLIENT_ID,
      PLAID_SANDBOX_SECRET,
      PLAID_PROD_CLIENT_ID,
      PLAID_PROD_SECRET,
    ],
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new Error("User not authenticated");
    }

    try {
      // Get the user's plaid_items collection
      const itemsSnap = await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .collection("plaid_items")
        .get();

      if (itemsSnap.empty) {
        console.warn("No Plaid tokens found for user:", uid);
        return { transactions: [] };
      }

      // Use the first item (for now)
      const item = itemsSnap.docs[0].data();
      const { access_token, environment } = item;
      const useProd = environment === "production";

      const plaidClient = getPlaidClient({
        clientId: useProd
          ? PLAID_PROD_CLIENT_ID.value()
          : PLAID_SANDBOX_CLIENT_ID.value(),
        secret: useProd
          ? PLAID_PROD_SECRET.value()
          : PLAID_SANDBOX_SECRET.value(),
        useProd,
      });

      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const response = await plaidClient.transactionsGet({
        access_token,
        start_date: thirtyDaysAgo,
        end_date: today,
        options: {
          count: 100,
          offset: 0,
        },
      });

      return { transactions: response.data.transactions };
    } catch (error) {
      console.error("[getTransactions] ❌", error.response?.data ?? error);
      throw new Error("Failed to fetch transactions");
    }
  }
);
