export const format = (value, isCredit = false) => {
  let num = Number(value);
  if (isCredit && num > 0) num = Math.abs(num);
  const fixed = num.toFixed(2);
  return `$${fixed.startsWith("-0.00") ? "0.00" : fixed}`;
};

export function computeSnapshots(transactions, latestBalances) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const balances = {};
  const types = {};
  const result = [];

  for (const tx of sorted) {
    const acc = tx.account_name || "Unknown";
    const subtype = tx.subtype || tx.account_type || "other";

    if (!(acc in types)) {
      types[acc] =
        subtype.includes("credit") || subtype === "credit"
          ? "credit"
          : subtype.includes("checking") || subtype === "checking"
          ? "checking"
          : "other";
    }

    if (!(acc in balances)) {
      const latest = latestBalances[acc];
      balances[acc] = typeof latest === "number" ? latest : 0;
    }
  }

  for (const tx of sorted) {
    const acc = tx.account_name || "Unknown";
    const type = types[acc];
    const isCredit = type === "credit";
    const amount = Number(tx.amount) || 0;

    const current = balances[acc];
    let previous = current;

    if (tx.type === "expense") {
      previous = isCredit ? current - amount : current + amount;
    } else if (tx.type === "revenue") {
      previous = isCredit ? current + amount : current - amount;
    }

    balances[acc] = previous;

    const snapshot = {};
    for (const name of Object.keys(balances)) {
      const isAcctCredit = types[name] === "credit";
      if (name === acc) {
        snapshot[name] = {
          changed: true,
          display: `${format(previous, isAcctCredit)} >> ${format(
            current,
            isAcctCredit
          )}`,
        };
      } else {
        snapshot[name] = {
          changed: false,
          display: format(balances[name], isAcctCredit),
        };
      }
    }

    result.push({ ...tx, balance_snapshot: snapshot });
  }

  return { result, types };
}

export function getUniqueAccounts(transactions, accountTypes) {
  const all = Array.from(
    new Set(
      transactions.flatMap((tx) => Object.keys(tx.balance_snapshot || {}))
    )
  );
  return all.sort((a, b) => {
    const typeA = accountTypes[a] || "other";
    const typeB = accountTypes[b] || "other";
    if (typeA === typeB) return a.localeCompare(b);
    if (typeA === "checking") return -1;
    if (typeB === "checking") return 1;
    if (typeA === "credit") return -1;
    if (typeB === "credit") return 1;
    return 0;
  });
}

export function getUniqueCategories(transactions) {
  return Array.from(
    new Set(
      transactions.flatMap((tx) => {
        if (!tx.category) return [];
        if (Array.isArray(tx.category)) return [tx.category.join(" > ")];
        return [tx.category]; // handle string
      })
    )
  );
}

export function filterTransactions(transactions, filters) {
  return transactions.filter((tx) => {
    const matchType = filters.type === "all" || tx.type === filters.type;
    const matchPayment =
      filters.paymentMethods.length === 0 ||
      filters.paymentMethods.includes(tx.account_name);
    const matchCategory =
      filters.categories.length === 0 ||
      filters.categories.some((cat) => tx.category?.join(" > ").includes(cat));
    return matchType && matchPayment && matchCategory;
  });
}
