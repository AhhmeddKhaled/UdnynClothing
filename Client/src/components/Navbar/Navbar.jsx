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
  const canViewAvailableStock = ["moderator", "admin", "owner"].includes(
    user?.role,
  );

  return (
    <header className="navbar">
      <div className="navbar-inner">
      <button
  className="navbar-logo"
  onClick={() => onNavigate("home")}
>
  {language === "ar" ? "يدنين" : "UDNYN"}
</button>
        <nav className="navbar-links">
          <button onClick={() => onNavigate("home")}>{t.nav.home}</button>

          <button onClick={() => onNavigate("catalog")}>{t.nav.catalog}</button>

          <button onClick={() => onNavigate("offers")}>{t.nav.offers}</button>

          <button onClick={() => onNavigate("categories")}>
            {t.nav.categories}
          </button>

          {canViewAvailableStock && (
            <button onClick={() => onNavigate("availableStock")}>
              {t.nav.availableStock}
            </button>
          )}
        </nav>

        <div className="navbar-actions">
          <button
            className="navbar-icon"
            type="button"
            onClick={() => onNavigate("favorites")}
            title={t.nav.favorites}
            aria-label={t.nav.favorites}
          >
            ♡
          </button>

          <button
            className="navbar-language"
            type="button"
            onClick={() => onLanguageChange(language === "ar" ? "en" : "ar")}
          >
            {language === "ar" ? "EN" : "AR"}
          </button>

          <ThemeToggle />

          {user && (
            <button className="navbar-logout" type="button" onClick={onLogout}>
              {t.nav.logout}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
