import { useState } from 'react';

import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "../Components/Sidebar/Sidebar.jsx";

import { getUser, logout } from "../pages/Login/auth.js";

import { useTheme } from "../context/ThemeContext.jsx";

import "./Layout.css";

export default function Layout() {
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
        <Outlet context={{ theme }} />
      </main>
    </div>
  );
}