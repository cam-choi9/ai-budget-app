import React from "react";
import "../styles/DashboardOverview.css";

function SummaryCard({ title, value, icon }) {
  return (
    <div className="summary-card">
      <div className="summary-icon">{icon}</div>
      <div className="summary-info">
        <p className="summary-title">{title}</p>
        <p className="summary-value">{value}</p>
      </div>
    </div>
  );
}

export default SummaryCard;
