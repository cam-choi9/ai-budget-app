// src/components/Sidebar.jsx
import "../styles/Sidebar.css";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/transactions">Transactions</Link>
        </li>
        <li>
          <Link to="/dashboard">Budget</Link>
        </li>
        <li>
          <Link to="/dashboard">Settings</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
