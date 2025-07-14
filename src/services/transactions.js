import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export const fetchTransactions = async () => {
  const res = await axios.get(`${API_BASE}/transactions`);
  return res.data;
};

export const syncTransactions = async (userId) => {
  const res = await fetch(
    `${
      import.meta.env.VITE_API_BASE || "http://localhost:8000/api"
    }/plaid/sync-transactions?user_id=${userId}`,
    {
      method: "POST",
    }
  );
  if (!res.ok) {
    throw new Error("Failed to sync transactions");
  }
  return res.json();
};

export const categorizeTransactions = async () => {
  const res = await fetch(`${API_BASE}/ai/categorize-transactions`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to categorize transactions");
  }
  return res.json();
};
