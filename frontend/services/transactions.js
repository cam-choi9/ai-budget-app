import { getJSON, postJSON, patchJSON } from "../src/lib/api";

export const fetchTransactions = async (
  startingBalances = {},
  includeVirtual = false
) => {
  const token = localStorage.getItem("access_token");
  return postJSON(
    "/api/transactions",
    {
      include_virtual: includeVirtual,
      starting_balances: startingBalances,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const syncTransactions = async (userId) => {
  // If your backend requires auth here, add the Authorization header too.
  return postJSON(
    `/api/plaid/sync-transactions?user_id=${encodeURIComponent(userId)}`,
    {}
  );
};

export const categorizeTransactions = async () => {
  return postJSON("/api/ai/categorize-transactions", {});
};

export const updateTransaction = async (id, data) => {
  return patchJSON(`/api/transactions/${id}`, data);
};

export const addTransaction = async (data, starting_balance) => {
  const token = localStorage.getItem("access_token");
  const payload = {
    transaction: data,
    starting_balance,
  };
  return postJSON("/api/transactions/new", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
