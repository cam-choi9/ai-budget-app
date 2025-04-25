import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import "../styles/Profile.css";

function Profile() {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.displayName) {
      const [first, ...rest] = user.displayName.split(" ");
      setFirstName(first || "");
      setLastName(rest.join(" ") || "");
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const displayName = `${firstName} ${lastName}`.trim();

    try {
      await updateProfile(user, { displayName });
      setMessage("✅ Name updated successfully.");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("❌ Failed to update name. Please try again.");
    }
  };

  return (
    <div className="profile-container">
      <h2>Edit Your Name</h2>

      <form onSubmit={handleSave}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <button type="submit">Save Changes</button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Profile;
