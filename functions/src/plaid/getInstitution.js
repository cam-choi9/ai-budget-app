import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import admin from "../utils/initFirebase.js";
import { getPlaidClient } from "../utils/plaidClient.js";

const PLAID_SANDBOX_CLIENT_ID = defineSecret("PLAID_SANDBOX_CLIENT_ID");
const PLAID_SANDBOX_SECRET = defineSecret("PLAID_SANDBOX_SECRET");
const PLAID_PROD_CLIENT_ID = defineSecret("PLAID_PROD_CLIENT_ID");
const PLAID_PROD_SECRET = defineSecret("PLAID_PROD_SECRET");

export const getInstitution = onCall(
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

      // ✅ Gracefully return empty list if no institutions linked
      if (tokenDocs.empty) {
        console.warn("No Plaid tokens found for user:", uid);
        return {
          success: true,
          institutions: [],
        };
      }

      const institutions = [];

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

        const itemRes = await plaidClient.itemGet({ access_token });
        const institutionId = itemRes.data.item.institution_id;

        const instRes = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: ["US"],
        });

        institutions.push({
          item_id,
          environment,
          institution: instRes.data.institution,
        });
      }

      return {
        success: true,
        institutions,
      };
    } catch (error) {
      console.error(
        "❌ Error fetching institution info",
        error?.response?.data ?? error
      );
      throw new Error("Failed to fetch institutions");
    }
  }
);
