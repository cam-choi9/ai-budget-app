import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase"; // adjust path if needed

export function useCategorizeTransaction() {
  const functions = getFunctions(getApp(), "us-central1");
  const categorize = httpsCallable(functions, "categorizeTransaction");

  const categorizeTransaction = async (tx) => {
    const user = getAuth().currentUser;
    if (!user) throw new Error("User not authenticated");

    const result = await categorize({
      item: tx.name || tx.item || "",
      amount: tx.amount,
      description: tx.memo || "",
      paymentMethod: tx.account_name || "Unknown",
    });

    const newCategory = result.data.category;
    const txRef = doc(db, `users/${user.uid}/plaid_transactions/${tx.id}`);
    await updateDoc(txRef, { category: newCategory });

    return newCategory;
  };

  return { categorizeTransaction };
}
