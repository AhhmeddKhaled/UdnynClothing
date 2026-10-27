
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login, HomeRedirect } from "../../services/UsersServices.js";
import { useLanguage } from "../../context/LanguageContext";

import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate(HomeRedirect(), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-wrap"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>{t("login", "title")}</h1>

        <p className="login-sub">
          {t("login", "subtitle")}
        </p>

        <label>
          {t("login", "email")}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label>
          {t("login", "password")}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading
            ? t("login", "loading")
            : t("login", "submit")}
        </button>
      </form>
    </div>
  );
}
