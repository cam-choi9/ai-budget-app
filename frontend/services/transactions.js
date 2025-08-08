const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export const fetchTransactions = async (
  startingBalances = {},
  includeVirtual = false
) => {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      include_virtual: includeVirtual,
      starting_balances: startingBalances,
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch transactions");

  return res.json();
};

export const syncTransactions = async (userId) => {
  const res = await fetch(
    `${API_BASE}/plaid/sync-transactions?user_id=${userId}`,
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

export const addTransaction = async (data, starting_balance) => {
  const token = localStorage.getItem("access_token");

  const payload = {
    transaction: data, // Your transaction fields
    starting_balance, // Required for accurate virtual balance calc
  };

  const res = await fetch(`${API_BASE}/transactions/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to add transaction");
  }

  return res.json();
};
