import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import admin from "../utils/initFirebase.js";
import { getPlaidClient } from "../utils/plaidClient.js";

const PLAID_SANDBOX_CLIENT_ID = defineSecret("PLAID_SANDBOX_CLIENT_ID");
const PLAID_SANDBOX_SECRET = defineSecret("PLAID_SANDBOX_SECRET");
const PLAID_PROD_CLIENT_ID = defineSecret("PLAID_PROD_CLIENT_ID");
const PLAID_PROD_SECRET = defineSecret("PLAID_PROD_SECRET");

export const getAccounts = onCall(
  {
    cors: true,
    secrets: [
      PLAID_SANDBOX_CLIENT_ID,
      PLAID_SANDBOX_SECRET,
      PLAID_PROD_CLIENT_ID,
      PLAID_PROD_SECRET,
    ],
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new Error("User not authenticated");

    try {
      const tokenDocs = await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .collection("plaid_tokens")
        .get();

      // ✅ Graceful exit if no banks linked
      if (tokenDocs.empty) {
        console.warn("No Plaid tokens found for user:", uid);
        return {
          success: true,
          accounts: [],
        };
      }

      let allAccounts = [];

      for (const doc of tokenDocs.docs) {
        const { access_token, environment, item_id } = doc.data();

        const plaidClient = getPlaidClient({
          clientId:
            environment === "production"
              ? PLAID_PROD_CLIENT_ID.value()
              : PLAID_SANDBOX_CLIENT_ID.value(),
          secret:
            environment === "production"
              ? PLAID_PROD_SECRET.value()
              : PLAID_SANDBOX_SECRET.value(),
          useProd: environment === "production",
        });

        const response = await plaidClient.accountsGet({ access_token });

        // ✅ Inject item_id into each account object
        const accountsWithItem = response.data.accounts.map((acc) => ({
          ...acc,
          item_id,
        }));

        // ✅ Save to environment-specific subcollection
        const snapshotRef = admin
          .firestore()
          .collection("users")
          .doc(uid)
          .collection(`plaid_data_${environment}`)
          .doc(item_id);

        await snapshotRef.set({
          fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
          accounts: accountsWithItem,
        });

        allAccounts.push(...accountsWithItem);
      }

      return {
        success: true,
        accounts: allAccounts,
      };
    } catch (error) {
      console.error("Error fetching accounts", { uid, error: error.message });
      throw new Error("Failed to fetch accounts");
    }
  }
);
