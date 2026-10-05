import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/products", label: "Products" },
  { path: "/orders", label: "Orders", soon: true },
  { path: "/users", label: "Users" },
];

export default function Sidebar({ user, onLogout, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout?.();
    navigate("/login");
  };

  return (
    <>
      <div className="sb-topbar">
        <button className="sb-burger" onClick={() => setOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
        <span className="sb-topbar-title">Udnyn</span>
        <button className="sb-theme-btn" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {open && <div className="sb-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sb-aside ${open ? "sb-open" : ""}`}>
        <div className="sb-brand">
          <div>
            <h1>Udnyn</h1>
            <span>Admin panel</span>
          </div>
          <button className="sb-theme-btn" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <nav className="sb-nav">
          {NAV_ITEMS.map((item) =>
            item.soon ? (
              <span key={item.path} className="sb-item sb-soon">
                <span>{item.label}</span>
                <em>Soon</em>
              </span>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sb-item ${isActive ? "sb-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="sb-user">
          <div className="sb-user-info">
            <b>{user?.name}</b>
            <span>{roleLabel(user?.role)}</span>
          </div>
          <button className="sb-logout" onClick={handleLogout}>Log out</button>
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </svg>
  );
}