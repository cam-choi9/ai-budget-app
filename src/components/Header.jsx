import "../styles/Header.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      console.log("🚪 User logged out");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const displayName = user?.displayName || user?.email;

  return (
    <header className="header">
      <Link to="/dashboard" className="app-title">
        AI Budget App
      </Link>

      {user && (
        <div className="user-info">
          <span className="user-name">Welcome, {displayName}</span>
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
