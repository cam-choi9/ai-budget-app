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
