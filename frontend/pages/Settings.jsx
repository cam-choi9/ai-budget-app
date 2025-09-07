import { useEffect, useState } from "react";
import "../styles/Settings.css";
import { useAuth } from "../context/AuthContext";
import { getJSON, putJSON } from "../src/lib/api";

function Settings() {
  const [accounts, setAccounts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingNames, setEditingNames] = useState({});
  const { setUser } = useAuth();

  const [userInfo, setUserInfo] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });
  const [editingField, setEditingField] = useState(null);
  const [userMessage, setUserMessage] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) return;

    // Fetch accounts
    getJSON("/api/plaid/accounts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        setAccounts(data.accounts || []);
        const initialNames = {};
        (data.accounts || []).forEach((acc) => {
          initialNames[acc.id] = acc.custom_name || "";
        });
        setEditingNames(initialNames);
      })
      .catch((err) => console.error("❌ Failed to load accounts:", err));

    // Fetch user info
    getJSON("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        setUserInfo((prev) => ({
          ...prev,
          email: data.email || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
        }));
      })
      .catch((err) => console.error("❌ Failed to load user info:", err));
  }, [token]);

  const handleNameChange = (id, value) => {
    setEditingNames((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (id) => {
    const name = editingNames[id] ?? "";
    try {
      await putJSON(
        `/api/accounts/${id}/custom_name?name=${encodeURIComponent(name)}`,
        {}, // backend reads name from the query string; empty JSON body is fine
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Saved");
      setEditingId(null);
    } catch (err) {
      console.error("❌ Save failed:", err);
    }
  };

  const handleUserChange = (field, value) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserUpdate = async () => {
    try {
      const updatedUser = await putJSON("/api/users/me", userInfo, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(updatedUser);
      setUserInfo((prev) => ({ ...prev, password: "" }));
      setUserMessage("✅ User info updated");
      setEditingField(null);
    } catch (err) {
      console.error("❌ Failed to update user info:", err);
      setUserMessage("❌ Failed to update user info");
    }
  };

  return (
    <div className="settings-page">
      <h2>Update Your Info</h2>
      <table className="settings-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {["email", "first_name", "last_name", "password"].map((field) => (
            <tr key={field}>
              <td>
                {field === "first_name"
                  ? "First Name"
                  : field === "last_name"
                  ? "Last Name"
                  : field.charAt(0).toUpperCase() + field.slice(1)}
              </td>
              <td>
                {editingField === field ? (
                  <input
                    type={field === "password" ? "password" : "text"}
                    value={userInfo[field]}
                    onChange={(e) => handleUserChange(field, e.target.value)}
                    placeholder={field === "password" ? "New password" : ""}
                  />
                ) : (
                  <span>
                    {field === "password"
                      ? "••••••••"
                      : userInfo[field] || <em>(empty)</em>}
                  </span>
                )}
              </td>
              <td>
                {editingField === field ? (
                  <button onClick={handleUserUpdate}>💾 Save</button>
                ) : (
                  <button onClick={() => setEditingField(field)}>
                    ✏️ Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
          {userMessage && (
            <tr>
              <td colSpan="3">
                <span>{userMessage}</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>Customize Account Names</h2>
      {accounts.length === 0 ? (
        <p>No linked accounts found.</p>
      ) : (
        <table className="settings-table">
          <thead>
            <tr>
              <th>Linked Account</th>
              <th>Custom Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>
                  {account.institution_name} • {account.account_type} • ****
                  {account.last_four}
                </td>
                <td>
                  {editingId === account.id ? (
                    <input
                      type="text"
                      value={editingNames[account.id]}
                      onChange={(e) =>
                        handleNameChange(account.id, e.target.value)
                      }
                      placeholder="e.g. Chase Flex"
                    />
                  ) : (
                    <span>
                      {editingNames[account.id] || <em>(no name)</em>}
                    </span>
                  )}
                </td>
                <td>
                  {editingId === account.id ? (
                    <button onClick={() => handleSave(account.id)}>
                      💾 Save
                    </button>
                  ) : (
                    <button onClick={() => setEditingId(account.id)}>
                      ✏️ Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Settings;
