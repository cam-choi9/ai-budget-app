import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import admin from "../utils/initFirebase.js";
import { getPlaidClient } from "../utils/plaidClient.js";

const PLAID_SANDBOX_CLIENT_ID = defineSecret("PLAID_SANDBOX_CLIENT_ID");
const PLAID_SANDBOX_SECRET = defineSecret("PLAID_SANDBOX_SECRET");
const PLAID_PROD_CLIENT_ID = defineSecret("PLAID_PROD_CLIENT_ID");
const PLAID_PROD_SECRET = defineSecret("PLAID_PROD_SECRET");

export const storePlaidTransactions = onCall(
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
    if (!uid) throw new Error("User not authenticated");

    const db = admin.firestore();
    const itemsSnap = await db.collection(`users/${uid}/plaid_items`).get();

    if (itemsSnap.empty) {
      console.warn("No linked Plaid items found.");
      return { count: 0 };
    }

    let totalStored = 0;

    for (const doc of itemsSnap.docs) {
      const { access_token, environment, item_id, institution, accounts } =
        doc.data();
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
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const txRes = await plaidClient.transactionsGet({
        access_token,
        start_date: startDate,
        end_date: today,
        options: { count: 250, offset: 0 },
      });

      for (const tx of txRes.data.transactions) {
        const accountMeta = accounts.find(
          (a) => a.account_id === tx.account_id
        );

        const isRevenue = tx.amount < 0 || tx.category?.[0] === "Income";
        const txType = isRevenue ? "revenue" : "expense";

        const docRef = db
          .collection(`users/${uid}/plaid_transactions`)
          .doc(tx.transaction_id);

        await docRef.set(
          {
            ...tx,
            uid,
            item_id,
            type: txType,
            amount: Math.abs(tx.amount), // treat all as positive
            institution_name: institution?.name ?? "Unknown",
            account_name: accountMeta?.name ?? "Unknown",
            stored_at: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true } // ✅ avoids duplicates
        );

        totalStored++;
      }
    }

    return { count: totalStored };
  }
);
