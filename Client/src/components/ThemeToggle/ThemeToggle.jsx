import { useEffect, useState } from "react";
import "./ThemeToggle.css";

function getInitialTheme() {
  const savedTheme =
    localStorage.getItem("theme");

  if (savedTheme) {
    return savedTheme;
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    getInitialTheme
  );

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme;

    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) =>
      current === "dark"
        ? "light"
        : "dark"
    );
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={
        theme === "dark"
          ? "تفعيل الوضع الفاتح"
          : "تفعيل الوضع الداكن"
      }
      title={
        theme === "dark"
          ? "Light mode"
          : "Dark mode"
      }
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}