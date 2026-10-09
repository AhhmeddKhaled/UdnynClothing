import { NavLink } from "react-router-dom";
import "./Sidebar.css";

import { useTheme } from "../../context/ThemeContext.jsx";
import { useSidebarLogic } from "../../UI_Logic/SidebarLogic.jsx";

import { RxDashboard } from "react-icons/rx";
import { PiStorefrontThin } from "react-icons/pi";
import { LiaProductHunt } from "react-icons/lia";
import { GrCatalog } from "react-icons/gr";
import { GoGoal } from "react-icons/go";
import { HiOutlineUsers } from "react-icons/hi2";

import { MdDarkMode } from "react-icons/md";
import { CiLight, CiSettings } from "react-icons/ci";
import { RiLogoutBoxRLine } from "react-icons/ri";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: <RxDashboard size={20}/> },
  {
    path: "/availableStock",
    label: "Available Stock",
    icon: <PiStorefrontThin size={20}/>,
  },
  { path: "/products", label: "Products", icon: <LiaProductHunt size={20}/> },
  { path: "/catalog", label: "Catalog", icon: <GrCatalog size={20}/> },
  { path: "/orders", label: "Orders", icon: <GoGoal size={20}/> },
  { path: "/users", label: "Users", icon: <HiOutlineUsers size={20}/> },
];

export default function Sidebar({ user, onLogout }) {
  const { theme, toggleTheme } = useTheme();

  const {
    open,
    sessionTime,
    handleNavigation,
    handleLogout,
    handleSettings,
    handleOpenMenu,
    handleCloseMenu,
  } = useSidebarLogic(onLogout);

  return (
    <>
      {/* Mobile Topbar */}
      <div className="sb-topbar">
        <button
          type="button"
          className="sb-burger"
          onClick={handleOpenMenu}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="admin-sidebar"
        >
          <span />
          <span />
          <span />
        </button>

        <span className="sb-topbar-title">Udnyn</span>

        <button
          type="button"
          className="sb-theme-btn"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? <CiLight /> : <MdDarkMode />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="sb-overlay"
          onClick={handleCloseMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={`sb-aside ${open ? "sb-open" : ""}`}
        aria-label="Main navigation"
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
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? <CiLight /> : <MdDarkMode />}
          </button>
        </div>

        {/* Navigation */}
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
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `sb-item ${isActive ? "sb-active" : ""}`
                }
                onClick={handleNavigation}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </NavLink>
            ),
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
                  {user?.role || "Admin"}
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
            <CiSettings />
            <span>Settings</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            className="sb-bottom-item sb-logout"
            onClick={handleLogout}
          >
            <RiLogoutBoxRLine />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}