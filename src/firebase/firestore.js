import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { updateDoc } from "firebase/firestore"; // already partially imported

export async function updateTransactionCategory(transactionId, newCategory) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("User not logged in");

  const txRef = doc(
    db,
    `users/${user.uid}/plaid_transactions/${transactionId}`
  );
  await updateDoc(txRef, { category: newCategory });
}

// ✅ Add manual transaction
export async function addTransaction(userId, transactionData) {
  const ref = collection(db, `users/${userId}/transactions`);
  await addDoc(ref, {
    ...transactionData,
    createdAt: serverTimestamp(),
  });
}

// ✅ Get manual transactions (user-entered)
export async function getManualTransactions(userId) {
  const ref = collection(db, `users/${userId}/transactions`);
  const q = query(ref, orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ✅ Get Plaid (real) transactions
export async function fetchRealTransactions() {
  const user = getAuth().currentUser;
  if (!user) throw new Error("User not logged in");

  const ref = collection(db, `users/${user.uid}/plaid_transactions`);
  const q = query(ref, orderBy("date", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// ✅ Get latest current balance for each account
export async function fetchLatestAccountBalances() {
  const user = getAuth().currentUser;
  if (!user) throw new Error("User not logged in");

  const ref = collection(db, `users/${user.uid}/plaid_items`);
  const snapshot = await getDocs(ref);

  const balances = {};

  snapshot.forEach((doc) => {
    const item = doc.data();
    (item.accounts || []).forEach((acc) => {
      const name = acc.name || acc.account_id;
      const subtype = acc.subtype || acc.account_type || "";
      const isChecking = subtype.includes("checking") || subtype === "checking";
      const current = isChecking
        ? acc.balances?.available
        : acc.balances?.current;

      if (typeof current === "number") {
        balances[name] = current;
      }
    });
  });

  return balances;
}
