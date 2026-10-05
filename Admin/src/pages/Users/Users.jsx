import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { authFetch } from "../Login/auth.js";
import "./Users.css";

export default function Users() {
  const { theme } = useOutletContext() ?? { theme: "light" };
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch("/api/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Couldn't load users");
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !users) {
    return (
      <div className="dash" data-theme={theme}>
        <div className="dash-state">Loading users…</div>
      </div>
    );
  }

  if (error && !users) {
    return (
      <div className="dash" data-theme={theme}>
        <div className="dash-state">
          <b>Couldn't load users</b>
          <span>{error}</span>
          <br />
          <button className="dash-btn dash-btn-primary" style={{ marginTop: 14 }} onClick={load}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filtered = (users || []).filter((u) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s);
  });

  return (
    <div className="dash" data-theme={theme}>
      <div className="dash-top">
        <div>
          <h1 className="dash-title">Users</h1>
          <p className="dash-subtitle">{users.length} registered accounts</p>
        </div>
        <div className="dash-actions">
          <button className="dash-btn dash-btn-primary" onClick={load} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <input
        className="users-search"
        type="search"
        placeholder="Search by name or email"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="dash-card" style={{ padding: 0, overflowX: "auto" }}>
        <table className="dash-table users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="dash-hint" style={{ padding: 24, textAlign: "center" }}>No users found</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td className="users-email">{u.email}</td>
                  <td><span className={`dash-badge dash-badge-${roleTone(u.role?.name)}`}>{u.role?.name}</span></td>
                  <td>
                    <span className={`dash-badge ${u.isActive ? "dash-badge-success" : "dash-badge-danger"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="dash-hint">{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function roleTone(role) {
  if (role === "owner" || role === "admin") return "accent";
  if (role === "customer") return "neutral";
  return "gold";
}