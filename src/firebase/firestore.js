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

// Example: Add transaction
export async function addTransaction(userId, transactionData) {
  const ref = collection(db, `users/${userId}/transactions`);
  await addDoc(ref, {
    ...transactionData,
    createdAt: serverTimestamp(),
  });
}

// Example: Get all transactions
export async function getTransactions(userId) {
  const ref = collection(db, `users/${userId}/transactions`);
  const q = query(ref, orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
