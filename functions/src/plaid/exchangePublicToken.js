import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import admin from "../utils/initFirebase.js";
import { getPlaidClient } from "../utils/plaidClient.js";

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
    const public_token = data.public_token; // ✅ match variable used below
    const useProd = data.useProd === true;

    if (!auth || !public_token) {
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

      // 🔁 Exchange token
      const tokenRes = await plaidClient.itemPublicTokenExchange({
        public_token,
      });

      const access_token = tokenRes.data.access_token;
      const item_id = tokenRes.data.item_id;

      // 🏦 Get institution info
      const itemRes = await plaidClient.itemGet({ access_token });
      const institution_id = itemRes.data.item.institution_id;

      let institution = null;
      if (institution_id) {
        const instRes = await plaidClient.institutionsGetById({
          institution_id,
          country_codes: ["US"],
        });
        institution = instRes.data.institution;
      }

      // 💳 Get accounts
      const accountsRes = await plaidClient.accountsGet({ access_token });

      // 🧠 Store in Firestore
      await admin
        .firestore()
        .collection("users")
        .doc(auth.uid)
        .collection("plaid_items")
        .doc(item_id)
        .set({
          access_token,
          item_id,
          environment: useProd ? "production" : "sandbox",
          linked_at: admin.firestore.FieldValue.serverTimestamp(),
          institution, // { name, institution_id, ... }
          accounts: accountsRes.data.accounts, // [{ name, mask, subtype, ... }]
        });

      console.log(`✅ Token exchanged and saved for ${auth.uid} [${item_id}]`);
      return { item_id };
    } catch (error) {
      console.error(
        "❌ exchangePublicToken error:",
        error?.response?.data ?? error
      );
      throw new Error("Exchange failed");
    }
  }
);
