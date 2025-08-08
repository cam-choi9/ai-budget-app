import React from "react";
import "../styles/DashboardOverview.css";

function GreetingHeader({ name = "there" }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : "Good afternoon";

  return (
    <div className="greeting-header">
      <h1 className="greeting-text">
        👋 {greeting}, {name}!
      </h1>
      <p className="greeting-subtext">
        Here's what's happening with your money today.
      </p>
    </div>
  );
}

export default GreetingHeader;
