import { httpsCallable } from "firebase/functions";
import { functions, db } from "../firebase/firebase.js";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

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

export async function fetchAccounts() {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error("User not authenticated");

    const ref = collection(db, `users/${user.uid}/plaid_items`);
    const snapshot = await getDocs(ref);

    const accounts = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.accounts?.length > 0) {
        accounts.push({
          institution: data.institution?.name ?? "Unknown Bank",
          accounts: data.accounts.map((acc) => ({
            name: acc.name,
            mask: acc.mask,
            subtype: acc.subtype,
            balances: acc.balances,
          })),
        });
      }
    });

    return { success: true, accounts };
  } catch (error) {
    console.error("🔴 Error fetching accounts from Firestore:", error.message);
    return { success: false, error: error.message };
  }
}

export async function storePlaidTransactions() {
  try {
    const fn = httpsCallable(functions, "storePlaidTransactions");
    const result = await fn();
    console.log("✅ Transactions stored:", result.data.count);
    return result.data;
  } catch (error) {
    console.error("❌ Error storing transactions:", error.message);
    throw error;
  }
}
