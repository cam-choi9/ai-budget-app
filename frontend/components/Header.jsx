import "../styles/Header.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem("access_token"); // remove token
      setUser(null); // clear user context
      navigate("/login"); // redirect to login
      console.log("🚪 User logged out");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name}`
    : user?.email;

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
