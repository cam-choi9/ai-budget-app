import { onCall } from "firebase-functions/v2/https";
import admin from "../utils/initFirebase.js";
import { getPlaidClient } from "../utils/plaidClient.js";
import { defineSecret } from "firebase-functions/params";

const PLAID_SANDBOX_CLIENT_ID = defineSecret("PLAID_SANDBOX_CLIENT_ID");
const PLAID_SANDBOX_SECRET = defineSecret("PLAID_SANDBOX_SECRET");
const PLAID_PROD_CLIENT_ID = defineSecret("PLAID_PROD_CLIENT_ID");
const PLAID_PROD_SECRET = defineSecret("PLAID_PROD_SECRET");

export const refreshAccountBalances = onCall(
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
    const uid = req.auth?.uid;
    if (!uid) throw new Error("Unauthenticated");

    const itemsSnap = await admin
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("plaid_items")
      .get();

    const updates = [];

    for (const doc of itemsSnap.docs) {
      const data = doc.data();
      const useProd = data.environment === "production";
      const plaidClient = getPlaidClient({
        clientId: useProd
          ? PLAID_PROD_CLIENT_ID.value()
          : PLAID_SANDBOX_CLIENT_ID.value(),
        secret: useProd
          ? PLAID_PROD_SECRET.value()
          : PLAID_SANDBOX_SECRET.value(),
        useProd,
      });

      const res = await plaidClient.accountsGet({
        access_token: data.access_token,
      });

      await doc.ref.set(
        {
          accounts: res.data.accounts, // 🔄 replace existing account array
          refreshed_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      updates.push({
        item_id: data.item_id,
        account_count: res.data.accounts.length,
      });
    }

    return {
      updated: updates.length,
      items: updates,
    };
  }
);
