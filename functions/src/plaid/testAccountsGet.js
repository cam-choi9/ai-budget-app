import { onCall } from "firebase-functions/v2/https";
import { getPlaidClient } from "../utils/plaidClient.js";

// Only for testing in sandbox!
export const testAccountsGet = onCall(
  {
    region: "us-central1",
    secrets: ["PLAID_CLIENT_ID", "PLAID_SECRET"], // Optional: include if accessing Plaid secrets
  },
  async (data) => {
    const accessToken = data.access_token; // Use a sandbox access token

    try {
      const plaidClient = getPlaidClient();

      const response = await plaidClient.accountsGet({
        access_token: accessToken,
      });

      console.log("✅ /accounts/get response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ accountsGet error:", error?.response?.data ?? error);
      throw new Error("accountsGet failed");
    }
  }
);
