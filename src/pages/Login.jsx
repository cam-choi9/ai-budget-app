import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // ⬅️ grab setUser from AuthContext

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Login response not OK:", errorText);
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log("✅ Login success:", data);

      localStorage.setItem("access_token", data.access_token);

      // ✅ fetch user info
      const meRes = await fetch("http://localhost:8000/api/me", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (!meRes.ok) {
        const errorText = await meRes.text();
        console.error("❌ Failed to fetch user info:", errorText);
        throw new Error("Invalid or expired token");
      }

      const userData = await meRes.json();
      console.log("✅ User info:", userData);

      setUser(userData);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Log In</button>
      </form>

      <p>
        Don’t have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}

export default Login;
