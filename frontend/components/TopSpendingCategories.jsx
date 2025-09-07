import { useEffect, useState } from "react";
import "../styles/TopSpendingCategories.css";
import { getJSON, postJSON, putJSON, delJSON } from "../src/lib/api";

function TopSpendingCategories() {
  const [topCategories, setTopCategories] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return; // optionally handle unauthenticated state

    getJSON("/api/transactions/top-categories", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(setTopCategories)
      .catch((e) => {
        console.error("Failed to fetch top categories:", e);
        setError(e.message);
      });
  }, []);

  const maxValue = Math.max(...topCategories.map((cat) => cat.total), 1);

  return (
    <div className="top-spending">
      <h3>Top 5 Spending for this week</h3>
      {topCategories.map((cat, idx) => {
        const widthPercent = (cat.total / maxValue) * 100;

        return (
          <div key={cat.category} className="bar-row">
            <span className="label" title={cat.category}>
              {cat.category}
            </span>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: idx === 0 ? "#ff5722" : "#ffc4a3",
                }}
              ></div>
            </div>
            <span className="amount">${cat.total.toFixed(0)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default TopSpendingCategories;
