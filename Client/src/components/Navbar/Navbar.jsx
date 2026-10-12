import { useState } from "react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import "./Navbar.css";

export default function Navbar({
  user,
  language,
  t,
  onNavigate,
  onLanguageChange,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const canViewAvailableStock = [
    "moderator",
    "admin",
    "owner",
  ].includes(user?.role);

  const navigateTo = (page) => {
    setMenuOpen(false);
    onNavigate(page);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button
          type="button"
          className="navbar-logo"
          onClick={() => navigateTo("home")}
        >
          {language === "ar" ? "يدنين" : "UDNYN"}
        </button>

        <button
          type="button"
          className="navbar-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={
            menuOpen
              ? language === "ar"
                ? "إغلاق القائمة"
                : "Close menu"
              : language === "ar"
                ? "فتح القائمة"
                : "Open menu"
          }
          aria-expanded={menuOpen}
          aria-controls="navbar-menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav
          id="navbar-menu"
          className={`navbar-links ${menuOpen ? "is-open" : ""}`}
        >
          <button
            type="button"
            onClick={() => navigateTo("home")}
          >
            {t.nav.home}
          </button>

          <button
            type="button"
            onClick={() => navigateTo("catalog")}
          >
            {t.nav.catalog}
          </button>

          <button
            type="button"
            onClick={() => navigateTo("offers")}
          >
            {t.nav.offers}
          </button>

          <button
            type="button"
            onClick={() => navigateTo("categories")}
          >
            {t.nav.categories}
          </button>

          {canViewAvailableStock && (
            <button
              type="button"
              onClick={() => navigateTo("availableStock")}
            >
              {t.nav.availableStock}
            </button>
          )}

          <div className="navbar-actions">
            <button
              className="navbar-icon"
              type="button"
              onClick={() => navigateTo("favorites")}
              title={t.nav.favorites}
              aria-label={t.nav.favorites}
            >
              ♡
            </button>

            <button
              className="navbar-language"
              type="button"
              onClick={() =>
                onLanguageChange(language === "ar" ? "en" : "ar")
              }
            >
              {language === "ar" ? "EN" : "AR"}
            </button>

            <div className="navbar-theme">
              <ThemeToggle />
            </div>

            {!user ? (
              <>
                <button
                  className="navbar-login"
                  type="button"
                  onClick={() => navigateTo("login")}
                >
                  {t.nav.login}
                </button>

                <button
                  className="navbar-register"
                  type="button"
                  onClick={() => navigateTo("register")}
                >
                  {language === "ar" ? "إنشاء حساب" : "Register"}
                </button>
              </>
            ) : (
              <button
                className="navbar-logout"
                type="button"
                onClick={handleLogout}
              >
                {t.nav.logout}
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}