import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  getUser,
  logout,
  getLoginTime,
  authFetch,
} from "../services/UsersServices.js";

// Import icons 
import { RxUpdate } from "react-icons/rx";

import { useTheme } from "../context/ThemeContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useDashboardLogic } from "../UI_Logic/DashboardLogic";

// Import Components
import Sidebar from "../Components/Sidebar/Sidebar.jsx";
import Button from "../Components/Button/Button";
import ToolBar from "../Components/ToolBar/ToolBar";

import styles from "./Layout.module.css";

export default function Layout() {
  const { language} = useLanguage();

  const { syncedAt, load, loading } =
    useDashboardLogic(authFetch);

  const [user] = useState(getUser());
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={styles.loShell} dir={language === "ar" ? "rtl" : "ltr"}>
      <Sidebar
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main 
      className={`
        ${styles.loContent}
        ${language === "ar" ? styles.rtl : styles.ltr}
        `} 
      dir={language === "ar" ? "rtl" : "ltr"}

      
      >
        <ToolBar />

        <Outlet
          context={{
            theme,
            user,
            syncedAt,
            load,
            loading,
          }}
        />

        <footer className={styles.footer}>
          <span className="lginTime">
            {getLoginTime()
              ? `Logged in at ${getLoginTime().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Login time unavailable"}
          </span>

          <Button load={load} loading={loading}>
            Refresh
            <RxUpdate />
          </Button>
        </footer>
      </main>
    </div>
  );
}
