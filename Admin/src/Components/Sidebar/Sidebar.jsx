import { useEffect, useState } from "react";

import { NavLink, useNavigate } from "react-router-dom";

import "./Sidebar.css";

import { useTheme } from "../../context/ThemeContext.jsx";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/availableStock", label: "Available Stock" },
  { path: "/products", label: "Products" },
  { path: "/catalog", label: "Catalog" },
  { path: "/orders", label: "Orders" },
  { path: "/users", label: "Users" },
];

export default function Sidebar({ user, onLogout }) {
  const { theme, toggleTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date();

    setSessionTime(
      now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  function handleLogout() {
    onLogout?.();
    navigate("/login");
  }

  function handleSettings() {
    setOpen(false);
    navigate("/settings");
  }

  return (
    <>
      {/* Mobile Topbar */}
      <div className="sb-topbar">
        <button
          type="button"
          className="sb-burger"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>

        <span className="sb-topbar-title">
          Udnyn
        </span>

        <button
          type="button"
          className="sb-theme-btn"
          onClick={toggleTheme}
          aria-label={
            theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="sb-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sb-aside ${open ? "sb-open" : ""}`}
      >
        {/* Brand */}
        <div className="sb-brand">
          <div>
            <h1>Udnyn</h1>
            <span>Admin panel</span>
          </div>

          <button
            type="button"
            className="sb-theme-btn"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sb-nav">
          {NAV_ITEMS.map((item) =>
            item.soon ? (
              <span
                key={item.path}
                className="sb-item sb-soon"
              >
                <span>{item.label}</span>
                <em>Soon</em>
              </span>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sb-item ${
                    isActive ? "sb-active" : ""
                  }`
                }
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        {/* Bottom Area */}
        <div className="sb-bottom">
          {/* Current User */}
          <div className="sb-user">
            <div className="sb-user-avatar">
              {(user?.name?.charAt(0) || "U").toUpperCase()}
            </div>

            <div className="sb-user-info">
              <div className="sb-user-main">
                <b>{user?.name || "User"}</b>

                <span className="sb-user-role">
                  {roleLabel(user?.role)}
                </span>
              </div>

              <span className="sb-session-time">
                Signed in at {sessionTime}
              </span>
            </div>
          </div>

          {/* Settings */}
          <button
            type="button"
            className="sb-bottom-item"
            onClick={handleSettings}
          >
            <SettingsIcon />
            <span>Settings</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            className="sb-bottom-item sb-logout"
            onClick={handleLogout}
          >
            <LogoutIcon />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function roleLabel(role) {
  const map = {
    owner: "Owner",
    admin: "Admin",
    moderator: "Moderator",
    editor: "Editor",
    customer: "Customer",
  };

  return map[role] || role || "";
}

function SunIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.5v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6.5v-2.5h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1H15v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </svg>
  );
}