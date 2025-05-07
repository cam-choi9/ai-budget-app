import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// ✅ Add manual transaction
export async function addTransaction(userId, transactionData) {
  const ref = collection(db, `users/${userId}/transactions`);
  await addDoc(ref, {
    ...transactionData,
    createdAt: serverTimestamp(),
  });
}

// ✅ Get manual transactions
export async function getTransactions(userId) {
  const ref = collection(db, `users/${userId}/transactions`);
  const q = query(ref, orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ✅ Get Plaid access token for user (assumes one linked item for now)
export async function getAccessToken(userId) {
  const ref = collection(db, `users/${userId}/plaid_items`);
  const snapshot = await getDocs(ref);
  if (snapshot.empty) throw new Error("No linked Plaid accounts found");

  // Return the first access_token
  return snapshot.docs[0].data().access_token;
}
