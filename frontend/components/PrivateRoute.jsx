import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  console.log("🔐 Auth Check:", user);

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Otherwise, render the protected content
  return children;
}

export default PrivateRoute;
