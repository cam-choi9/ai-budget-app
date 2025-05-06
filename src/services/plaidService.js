import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebase.js";
import { getAuth } from "firebase/auth";

export async function getLinkToken() {
  const useProd = import.meta.env.VITE_USE_PROD === "true";
  const url = `https://createlinktoken-6xfpnkvkoq-uc.a.run.app?env=${
    useProd ? "prod" : "sandbox"
  }`;

  try {
    const user = getAuth().currentUser;
    const token = user ? await user.getIdToken() : null;

    const response = await fetch(url, {
      method: "GET",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

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

export async function fetchInstitution() {
  try {
    const getInstitution = httpsCallable(functions, "getInstitution");
    const result = await getInstitution();
    return result.data;
  } catch (error) {
    console.error("🔴 Error fetching institution info:", error.message);
    return { success: false, error: error.message };
  }
}
