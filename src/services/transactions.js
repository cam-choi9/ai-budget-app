import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export const fetchTransactions = async (includeVirtual = false) => {
  const res = await fetch(
    `${
      import.meta.env.VITE_API_BASE || "http://localhost:8000/api"
    }/transactions?include_virtual=${includeVirtual}`
  );
  if (!res.ok) throw new Error("Failed to fetch transactions");

  return res.json();
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

export const updateTransaction = async (id, data) => {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update transaction");
  }

  return res.json();
};

export const addTransaction = async (data) => {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to add transaction");
  }

  return res.json();
};
