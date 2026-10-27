
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import ar from "../locales/ar.json";
import en from "../locales/en.json";

const translations = { ar, en };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "ar"
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir =
      language === "ar" ? "rtl" : "ltr";

    localStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((current) =>
      current === "ar" ? "en" : "ar"
    );
  };

  const t = (page, key) => {
    return (
      translations[language]?.[page]?.[key] ??
      translations.ar?.[page]?.[key] ??
      key
    );
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
