import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebase.js";

export async function getLinkToken() {
  const url = "https://createlinktoken-6xfpnkvkoq-uc.a.run.app";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Failed to fetch link token: ${response.status} ${errText}`
      );
    }

    const { link_token } = await response.json();
    return link_token;
  } catch (error) {
    console.error(
      "🔴 Error fetching Plaid Link Token:",
      error?.message ?? error
    );
    return null;
  }
}

// Firebase Callable Function for getting accounts
export async function fetchAccounts() {
  try {
    const getAccounts = httpsCallable(functions, "getAccounts");
    const result = await getAccounts();
    return result.data;
  } catch (error) {
    console.error("🔴 Error calling getAccounts:", error.message);
    return { success: false, error: error.message };
  }
}
