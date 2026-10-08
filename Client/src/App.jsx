import { useEffect, useState } from "react";

import Navbar from "./components/Navbar/Navbar";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";

import Home from "./pages/Home/Home";
import Catalog from "./pages/Catalog/Catalog";
import AvailableStock from "./pages/AvailableStock/AvailableStock";
import Login from "./pages/Login/Login";

import {
  getCurrentUser,
  logoutUser,
} from "./services/api";

import {
  getSavedLanguage,
  getTranslations,
  applyLanguage,
  saveLanguage,
} from "./i18n/i18n";

import {
  LoadingProvider,
  useLoading,
} from "./context/LoadingContext";

function AppContent() {
  const [user, setUser] = useState(() =>
    getCurrentUser()
  );

  const [language, setLanguage] = useState(() =>
    getSavedLanguage()
  );

  const [page, setPage] = useState("home");

  const { isLoading } = useLoading();

  const t = getTranslations(language);

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setPage("home");
  }

  function handleLogout() {
    logoutUser();
    setUser(null);
    setPage("home");
  }

  function handleLanguageChange(nextLanguage) {
    saveLanguage(nextLanguage);
    setLanguage(nextLanguage);
  }

  function renderPage() {
    switch (page) {
      case "catalog":
        return (
          <Catalog
            user={user}
            onNavigate={setPage}
          />
        );

      case "availableStock":
        if (
          !["moderator", "admin", "owner"].includes(
            user?.role
          )
        ) {
          return (
            <Home
              t={t}
              onNavigate={setPage}
            />
          );
        }

        return (
          <AvailableStock
            user={user}
          />
        );

      case "offers":
        return (
          <Home
            t={t}
            onNavigate={setPage}
          />
        );

      case "categories":
        return (
          <Home
            t={t}
            onNavigate={setPage}
          />
        );

      case "favorites":
        return (
          <Home
            t={t}
            onNavigate={setPage}
          />
        );

      case "home":
      default:
        return (
          <Home
            t={t}
            onNavigate={setPage}
          />
        );
    }
  }

  if (!user) {
    return (
      <>
        {isLoading && <LoadingSpinner />}

        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      {isLoading && <LoadingSpinner />}

      <Navbar
        user={user}
        language={language}
        t={t}
        onNavigate={setPage}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
      />

      {renderPage()}
    </>
  );
}

export default function App() {
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
}