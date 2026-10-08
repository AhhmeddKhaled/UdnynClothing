import ar from "./ar";
import en from "./en";

const translations = {
  ar,
  en,
};

export function getSavedLanguage() {
  return (
    localStorage.getItem("language") || "ar"
  );
}

export function saveLanguage(language) {
  localStorage.setItem("language", language);
}

export function getTranslations(language) {
  return translations[language] || ar;
}

export function applyLanguage(language) {
  const direction =
    language === "ar" ? "rtl" : "ltr";

  document.documentElement.lang = language;
  document.documentElement.dir = direction;
}

export { translations };