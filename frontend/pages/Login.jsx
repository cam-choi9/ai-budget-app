import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";
import { getJSON, postJSON, putJSON, delJSON, postForm } from "../src/lib/api";

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
      // 1) login (form-encoded)
      const data = await postForm("/api/login", {
        username: email,
        password: password,
      });

      console.log("✅ Login success:", data);

      // 2) store token
      localStorage.setItem("access_token", data.access_token);

      // 3) fetch user info with the token
      const userData = await getJSON("/api/me", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

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
