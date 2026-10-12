import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

import { useTheme } from "../../context/ThemeContext.jsx";
import { useSidebarLogic } from "../../UI_Logic/SidebarLogic.jsx";
import { getLoginTime } from "../../pages/Login/auth.js";

import { RxDashboard } from "react-icons/rx";
import { PiStorefrontThin } from "react-icons/pi";
import { LiaProductHunt } from "react-icons/lia";
import { GrCatalog } from "react-icons/gr";
import { GoGoal } from "react-icons/go";
import { HiOutlineUsers } from "react-icons/hi2";
import { MdDarkMode } from "react-icons/md";
import { CiLight, CiSettings } from "react-icons/ci";
import { RiLogoutBoxRLine } from "react-icons/ri";
import {
  HiOutlineChevronDown,
  HiOutlineClipboardList,
  HiOutlinePlus,
} from "react-icons/hi";

const NAV_ITEMS = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <RxDashboard size={20} />,
  },
  {
    path: "/availableStock",
    label: "Available Stock",
    icon: <PiStorefrontThin size={20} />,
  },
  {
    path: "/products",
    label: "Products",
    icon: <LiaProductHunt size={20} />,
  },
  {
    path: "/catalog",
    label: "Catalog",
    icon: <GrCatalog size={20} />,
  },
  {
    path: "/users",
    label: "Users",
    icon: <HiOutlineUsers size={20} />,
  },
];

export default function Sidebar({ user, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const {
    open,
    handleNavigation,
    handleLogout,
    handleSettings,
    handleOpenMenu,
    handleCloseMenu,
  } = useSidebarLogic(onLogout);

  const isOrdersRoute = location.pathname.startsWith("/orders");

  const [ordersExpanded, setOrdersExpanded] = useState(isOrdersRoute);

  useEffect(() => {
    if (isOrdersRoute) {
      setOrdersExpanded(true);
    }
  }, [isOrdersRoute]);

  const loginTime = getLoginTime();

  const formattedLoginTime = loginTime
    ? loginTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const toggleOrders = () => {
    setOrdersExpanded((previous) => !previous);
  };

  return (
    <>
      {/* Mobile Topbar */}
      <header className="sb-topbar">
        <button
          type="button"
          className="sb-burger"
          onClick={open ? handleCloseMenu : handleOpenMenu}
          aria-label={open ? "Close menu" : "Open menu"}
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
            theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {theme === "dark" ? <CiLight /> : <MdDarkMode />}
        </button>
      </header>

      {/* Mobile Overlay */}
      <button
        type="button"
        className={`sb-overlay ${open ? "sb-overlay-open" : ""}`}
        onClick={handleCloseMenu}
        aria-label="Close navigation menu"
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
      />

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
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {theme === "dark" ? <CiLight /> : <MdDarkMode />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sb-nav">
          {NAV_ITEMS.slice(0, 4).map((item) => (
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
          ))}

          {/* Orders Dropdown */}
          <div
            className={`sb-orders-group ${
              isOrdersRoute ? "sb-orders-group-active" : ""
            }`}
          >
            <button
              type="button"
              className={`sb-item sb-orders-toggle ${
                isOrdersRoute ? "sb-active" : ""
              }`}
              onClick={toggleOrders}
              aria-expanded={ordersExpanded}
              aria-controls="sb-orders-submenu"
            >
              <span className="icon">
                <GoGoal size={20} />
              </span>

              <span className="label">Orders</span>

              <HiOutlineChevronDown
                className={`sb-orders-chevron ${
                  ordersExpanded ? "sb-chevron-open" : ""
                }`}
                size={16}
              />
            </button>

            {ordersExpanded && (
              <div
                id="sb-orders-submenu"
                className="sb-submenu"
              >
                <NavLink
                  to="/orders"
                  end
                  className={({ isActive }) =>
                    `sb-subitem ${
                      isActive ? "sb-subitem-active" : ""
                    }`
                  }
                  onClick={handleNavigation}
                >
                  <HiOutlineClipboardList size={18} />
                  <span>All Orders</span>
                </NavLink>

                <NavLink
                  to="/orders/new"
                  className={({ isActive }) =>
                    `sb-subitem ${
                      isActive ? "sb-subitem-active" : ""
                    }`
                  }
                  onClick={handleNavigation}
                >
                  <HiOutlinePlus size={18} />
                  <span>Add Order</span>
                </NavLink>
              </div>
            )}
          </div>

          {NAV_ITEMS.slice(4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sb-item ${isActive ? "sb-active" : ""}`
              }
              onClick={handleNavigation}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </NavLink>
          ))}
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
                {formattedLoginTime
                  ? `Logged in at ${formattedLoginTime}`
                  : "Login time unavailable"}
              </span>
            </div>
          </div>

          {/* Settings */}
          <button
            type="button"
            className="sb-bottom-item"
            onClick={() => {
              handleCloseMenu();
              handleSettings();
            }}
          >
            <CiSettings size={20} />
            <span>Settings</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            className="sb-bottom-item sb-logout"
            onClick={handleLogout}
          >
            <RiLogoutBoxRLine size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}