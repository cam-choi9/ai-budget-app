// src/components/SummaryRow.jsx
import React from "react";
import SummaryCard from "./SummaryCard";

function SummaryRow({ totalBalance }) {
  return (
    <div className="summary-row">
      <SummaryCard title="Total Balance" value={`$${totalBalance}`} icon="💰" />
      <SummaryCard title="Monthly Revenue" value="–" icon="📈" />
      <SummaryCard title="Monthly Expenses" value="–" icon="📉" />
    </div>
  );
}

export default SummaryRow;
