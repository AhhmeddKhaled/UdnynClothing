import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar/Sidebar.jsx";
import { getUser, logout } from "../pages/Login/auth.js";
import "./Layout.css";

const THEME_KEY = "udnyn_admin_theme";

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function Layout() {
  const [user] = useState(getUser());
  const [theme, setTheme] = useState(getInitialTheme);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="lo-shell" data-theme={theme}>
      <Sidebar user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
      <main className="lo-content">
        <Outlet context={{ theme }} />
      </main>
    </div>
  );
}