// src/components/Sidebar.jsx
import "../styles/Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <ul>
        <li>Dashboard</li>
        <li>Transactions</li>
        <li>Budget</li>
        <li>Settings</li>
      </ul>
    </aside>
  );
}

export default Sidebar;
