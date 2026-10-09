import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar/Sidebar.jsx";
import { getUser, logout, getLoginTime , authFetch } from "../pages/Login/auth.js";
import { useTheme } from "../context/ThemeContext.jsx";
import { useDashboardLogic } from "../UI_Logic/DashboardLogic";

import "./Layout.css";

export default function Layout() {
  const {
    syncedAt,
    load,
    loading,
    missingDataTotal,
  } = useDashboardLogic(authFetch);

  const [user] = useState(getUser());
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="lo-shell">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="lo-content">
        <Outlet
          context={{
            theme,
            user,
            syncedAt,
            load,
            loading,
            missingDataTotal,
          }}
        />

<footer className="footer">
  <span>
    {getLoginTime()
      ? `Logged in at ${getLoginTime().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : "Login time unavailable"}
  </span>

  <button
    type="button"
    className="dash-btn dash-btn-primary"
    onClick={load}
    disabled={loading}
  >
    {loading ? "Refreshing..." : "Refresh data"}
  </button>

  <span className="footer-checks">
    Data checks: {missingDataTotal ?? 0}
  </span>
</footer>
      </main>
    </div>
  );
}