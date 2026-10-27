
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import styles from "./Sidebar.module.css";

import { useTheme } from "../../context/ThemeContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

import { useSidebarLogic } from "../../UI_Logic/SidebarLogic.jsx";
import { useOrdersLogic } from "../../UI_Logic/OrdersLogic.jsx";

import {
  getLoginTime,
  getUser,
} from "../../services/UsersServices.js";

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
    labelKey: "dashboard",
    icon: <RxDashboard size={20} />,
  },
  {
    path: "/availableStock",
    labelKey: "availableStock",
    icon: <PiStorefrontThin size={20} />,
  },
  {
    path: "/products",
    labelKey: "products",
    icon: <LiaProductHunt size={20} />,
  },
  {
    path: "/catalog",
    labelKey: "catalog",
    icon: <GrCatalog size={20} />,
  },
  {
    path: "/users",
    labelKey: "users",
    icon: <HiOutlineUsers size={20} />,
  },
];

export default function Sidebar({ user, onLogout }) {
  const { orders } = useOrdersLogic();
  const { theme, toggleTheme } = useTheme();
  const { toggleLanguage, language, t } = useLanguage();

  const location = useLocation();

  const {
    open,
    handleNavigation,
    handleLogout,
    handleSettings,
    handleOpenMenu,
    handleCloseMenu,
  } = useSidebarLogic(onLogout);

  const currentUser = getUser();

  const role = String(
    currentUser?.role || user?.role || ""
  ).toLowerCase();

  const isAdmin = role === "admin";
  const isOrdersRoute = location.pathname.startsWith("/orders");

  const [ordersExpanded, setOrdersExpanded] =
    useState(isOrdersRoute);

  useEffect(() => {
    if (isOrdersRoute) {
      setOrdersExpanded(true);
    }
  }, [isOrdersRoute]);

  const loginTime = getLoginTime();

  const formattedLoginTime = loginTime
    ? loginTime.toLocaleTimeString(
        language === "ar" ? "ar-EG" : "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    : null;

  const toggleOrders = () => {
    setOrdersExpanded((previous) => !previous);
  };

  const handleRestrictedNavigation = (event) => {
    if (!isAdmin) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    handleNavigation();
  };

  const getNavClassName = (isActive, disabled) =>
    [
      styles.sbItem,
      isActive ? styles.sbActive : "",
      disabled ? styles.sbItemDisabled : "",
    ]
      .filter(Boolean)
      .join(" ");

  const getSubItemClassName = (isActive, disabled = false) =>
    [
      styles.sbSubitem,
      isActive ? styles.sbSubitemActive : "",
      disabled ? styles.sbSubitemDisabled : "",
    ]
      .filter(Boolean)
      .join(" ");

  const themeLabel =
    theme === "dark"
      ? t("sidebar", "switchToLightMode")
      : t("sidebar", "switchToDarkMode");

  const directionClass =
    language === "ar" ? styles.rtl : styles.ltr;

  return (
    <>
      {/* Mobile Topbar */}
      <header className={styles.sbTopbar}>
        <button
          type="button"
          className={styles.sbBurger}
          onClick={open ? handleCloseMenu : handleOpenMenu}
          aria-label={
            open
              ? t("sidebar", "closeMenu")
              : t("sidebar", "openMenu")
          }
          aria-expanded={open}
          aria-controls="admin-sidebar"
        >
          <span />
          <span />
          <span />
        </button>

        <span className={styles.sbTopbarTitle}>Udnyn</span>

        <button
          type="button"
          className={styles.sbThemeBtn}
          onClick={toggleTheme}
          aria-label={themeLabel}
        >
          {theme === "dark" ? <CiLight /> : <MdDarkMode />}
        </button>
      </header>

      {/* Mobile Overlay */}
      <button
        type="button"
        className={[
          styles.sbOverlay,
          open ? styles.sbOverlayOpen : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleCloseMenu}
        aria-label={t("sidebar", "closeNavigation")}
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
      />

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={[
          styles.sbAside,
          open ? styles.sbOpen : "",
          directionClass,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={t("sidebar", "mainNavigation")}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        {/* Brand */}
        <div className={styles.sbBrand}>
          <div>
            <h1>Udnyn</h1>
            <span>{t("sidebar", "adminPanel")}</span>
          </div>

          <button
            type="button"
            className={styles.sbThemeBtn}
            onClick={toggleTheme}
            aria-label={themeLabel}
          >
            {theme === "dark" ? <CiLight /> : <MdDarkMode />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.sbNav}>
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                getNavClassName(isActive, !isAdmin)
              }
              onClick={handleRestrictedNavigation}
              aria-disabled={!isAdmin}
              tabIndex={isAdmin ? 0 : -1}
            >
              <span className={styles.icon}>
                {item.icon}
              </span>

              <span className={styles.label}>
                {t("sidebar", item.labelKey)}
              </span>
            </NavLink>
          ))}

          {/* Orders Dropdown */}
          <div
            className={[
              styles.sbOrdersGroup,
              isOrdersRoute
                ? styles.sbOrdersGroupActive
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <button
              type="button"
              className={[
                styles.sbItem,
                styles.sbOrdersToggle,
                isOrdersRoute ? styles.sbActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={toggleOrders}
              aria-expanded={ordersExpanded}
              aria-controls="sb-orders-submenu"
            >
              <span className={styles.icon}>
                <GoGoal size={20} />
              </span>

              <span className={styles.label}>
                {t("sidebar", "orders")}
              </span>

              <span className={styles.ordersNote}>
                {orders.length}
              </span>

              <HiOutlineChevronDown
                className={[
                  styles.sbOrdersChevron,
                  ordersExpanded
                    ? styles.sbChevronOpen
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                size={16}
              />
            </button>

            {ordersExpanded && (
              <div
                id="sb-orders-submenu"
                className={styles.sbSubmenu}
              >
                {/* All Orders */}
                <NavLink
                  to="/orders"
                  end
                  className={({ isActive }) =>
                    getSubItemClassName(isActive, !isAdmin)
                  }
                  onClick={handleRestrictedNavigation}
                  aria-disabled={!isAdmin}
                  tabIndex={isAdmin ? 0 : -1}
                >
                  <HiOutlineClipboardList size={18} />
                  <span>
                    {t("sidebar", "allOrders")}
                  </span>
                </NavLink>

                {/* Add Order */}
                <NavLink
                  to="/orders/new"
                  className={({ isActive }) =>
                    getSubItemClassName(isActive)
                  }
                  onClick={handleNavigation}
                >
                  <HiOutlinePlus size={18} />
                  <span>
                    {t("sidebar", "addOrder")}
                  </span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Users */}
          {NAV_ITEMS.slice(4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                getNavClassName(isActive, !isAdmin)
              }
              onClick={handleRestrictedNavigation}
              aria-disabled={!isAdmin}
              tabIndex={isAdmin ? 0 : -1}
            >
              <span className={styles.icon}>
                {item.icon}
              </span>

              <span className={styles.label}>
                {t("sidebar", item.labelKey)}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Area */}
        <div className={styles.sbBottom}>
          {/* Current User */}
          <div className={styles.sbUser}>
            <div className={styles.sbUserAvatar}>
              {(user?.name?.charAt(0) || "U").toUpperCase()}
            </div>

            <div className={styles.sbUserInfo}>
              <div className={styles.sbUserMain}>
                <b>
                  {user?.name || t("sidebar", "user")}
                </b>

                <span className={styles.sbUserRole}>
                  {role
                    ? t("sidebar", role) || role
                    : t("sidebar", "user")}
                </span>
              </div>

              <span className={styles.sbSessionTime}>
                {formattedLoginTime
                  ? `${t("sidebar", "loggedInAt")} ${formattedLoginTime}`
                  : t("sidebar", "loginTimeUnavailable")}
              </span>
            </div>
          </div>

          {/* Language Switch */}
          <button
            type="button"
            className={styles.sbBottomItem}
            onClick={toggleLanguage}
            aria-label={t("sidebar", "switchLanguage")}
          >
            <span>
              {language === "ar" ? "English" : "العربية"}
            </span>
          </button>

          {/* Settings */}
          <button
            type="button"
            className={styles.sbBottomItem}
            onClick={() => {
              handleCloseMenu();
              handleSettings();
            }}
          >
            <CiSettings size={20} />
            <span>{t("sidebar", "settings")}</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            className={[
              styles.sbBottomItem,
              styles.sbLogout,
            ].join(" ")}
            onClick={handleLogout}
          >
            <RiLogoutBoxRLine />
            <span>{t("sidebar", "logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
