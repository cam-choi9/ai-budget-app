import { onCall } from "firebase-functions/v2/https";
import admin from "../utils/initFirebase.js";
import { defineSecret } from "firebase-functions/params";
import { getPlaidClient } from "../utils/plaidClient.js";

const PLAID_CLIENT_ID = defineSecret("PLAID_CLIENT_ID");
const PLAID_SECRET = defineSecret("PLAID_SECRET");

export const getAccounts = onCall(
  {
    cors: true,
    secrets: [PLAID_CLIENT_ID, PLAID_SECRET],
  },
  async (request) => {
    const uid = request.auth?.uid;

    if (!uid) {
      console.warn("Unauthenticated function call");
      throw new Error("User not authenticated");
    }

    try {
      const userRef = admin.firestore().collection("users").doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.error("User doc not found for:", uid);
        throw new Error("No user data found");
      }

      const userData = userDoc.data();
      console.log("✅ Retrieved user data:", userData); // 👀 DEBUG

      const accessToken = userData?.access_token;

      if (!accessToken) {
        console.error("Access token not found for user", { uid });
        throw new Error("No access token found");
      }

      const plaidClient = getPlaidClient({
        clientId: PLAID_CLIENT_ID.value(),
        secret: PLAID_SECRET.value(),
      });

      const response = await plaidClient.accountsGet({
        access_token: accessToken,
      });
      const accounts = response.data.accounts;

      await userRef.collection("plaid_data").doc("accounts").set({
        fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
        accounts,
      });

      console.log("✅ Fetched and stored accounts for", uid);
      return {
        success: true,
        accounts,
      };
    } catch (error) {
      console.error("Error fetching accounts", { uid, error: error.message });
      throw new Error("Failed to fetch accounts");
    }
  }
);
