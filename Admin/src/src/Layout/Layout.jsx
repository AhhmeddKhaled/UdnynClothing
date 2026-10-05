import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import { getUser, logout } from "../pages/Login/auth.js";
import "./Layout.css";

export default function Layout() {
  const [user] = useState(getUser());
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="lo-shell">
      <Sidebar />
      <main className="lo-content">
        <Outlet />
      </main>
    </div>
  );
}