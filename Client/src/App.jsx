import { useEffect, useState } from "react";

import FloatingSocial from "./components/FloatingSocial/FloatingSocial";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";

import Home from "./pages/Home/Home";
import Catalog from "./pages/Catalog/Catalog";
import ProductDetails from "./pages/Catalog/ProductDetails/ProductDetails";
import AvailableStock from "./pages/AvailableStock/AvailableStock";
import Login from "./pages/Login/Login";

import { getCurrentUser, logoutUser } from "./services/api";

import {
  getSavedLanguage,
  getTranslations,
  applyLanguage,
  saveLanguage,
} from "./i18n/i18n";

import { LoadingProvider, useLoading } from "./context/LoadingContext";

function AppContent() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [language, setLanguage] = useState(() => getSavedLanguage());
  const [page, setPage] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState(null);

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
    setSelectedProductId(null);
    setPage("home");
  }

  function handleLanguageChange(nextLanguage) {
    saveLanguage(nextLanguage);
    setLanguage(nextLanguage);
  }

  function handleSelectProduct(product) {
    if (!product?._id) {
      console.error("المنتج لا يحتوي على _id:", product);
      return;
    }

    setSelectedProductId(product._id);
    setPage("productDetails");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNavigate(nextPage) {
    setPage(nextPage);

    if (nextPage === "catalog") {
      setSelectedProductId(null);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderPage() {
    switch (page) {
      case "catalog":
        return (
          <Catalog
            user={user}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        );

      case "productDetails":
        return selectedProductId ? (
          <ProductDetails
            productId={selectedProductId}
            onNavigate={handleNavigate}
          />
        ) : (
          <Home t={t} onNavigate={handleNavigate} />
        );

      case "availableStock":
        if (!["moderator", "admin", "owner"].includes(user?.role)) {
          return <Home t={t} onNavigate={handleNavigate} />;
        }

        return <AvailableStock user={user} />;

      case "offers":
      case "categories":
      case "favorites":
      case "home":
      default:
        return <Home t={t} onNavigate={handleNavigate} />;
    }
  }

  if (!user) {
    return (
      <>
        {isLoading && <LoadingSpinner />}

        <Login onLogin={handleLogin} />

        <FloatingSocial
          whatsappNumber="201XXXXXXXXX"
          telegramUrl="https://t.me/YOUR_CHANNEL"
        />
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
        onNavigate={handleNavigate}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
      />

      {renderPage()}

      <Footer
        language={language}
        t={t}
        onNavigate={handleNavigate}
        socialLinks={{
          facebook: "https://www.facebook.com/udnynstore/",
          instagram: "https://www.instagram.com/udnyn/?hl=ar",
          tiktok: "https://www.tiktok.com/@udnynstore",
          telegram: "https://t.me/youdnina",
        }}
      />

      <FloatingSocial
        whatsappNumber="201091360463"
        telegramUrl="https://t.me/youdnina"
      />
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