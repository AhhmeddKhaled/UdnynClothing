
import { useState } from "react";
import { loginUser, saveAuth } from "../../services/api.js";
import "./Login.css";

export default function Login({ onLogin, onNavigate, language = "ar", t }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isArabic = language === "ar";

  const text = t?.auth || {
    loginTitle: isArabic ? "تسجيل الدخول" : "Log in",
    loginSubtitle: isArabic
      ? "أهلاً بيك تاني في UDNYN"
      : "Welcome back to UDNYN",
    email: isArabic ? "البريد الإلكتروني" : "Email address",
    password: isArabic ? "كلمة المرور" : "Password",
    emailPlaceholder: "example@email.com",
    passwordPlaceholder: isArabic
      ? "أدخل كلمة المرور"
      : "Enter your password",
    loginButton: isArabic ? "تسجيل الدخول" : "Log in",
    loading: isArabic ? "جاري تسجيل الدخول..." : "Logging in...",
    required: isArabic
      ? "من فضلك أدخل البريد الإلكتروني وكلمة المرور"
      : "Please enter your email and password",
    genericError: isArabic
      ? "حدث خطأ أثناء تسجيل الدخول"
      : "An error occurred while logging in",
    noAccount: isArabic
      ? "ليس لديك حساب؟"
      : "Don't have an account?",
    register: isArabic ? "أنشئ حسابًا" : "Create an account",
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError(text.required);
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(email.trim(), password);

      saveAuth(data);
      onLogin(data.user);
    } catch (err) {
      setError(err.message || text.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page" dir={isArabic ? "rtl" : "ltr"} lang={language}>
      <section className="login-card">
        <header className="login-header">
          <div className="login-logo">UDNYN</div>
          <h1>{text.loginTitle}</h1>
          <p>{text.loginSubtitle}</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <label className="login-field">
            <span>{text.email}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={text.emailPlaceholder}
              autoComplete="email"
              dir="ltr"
              disabled={loading}
              required
            />
          </label>

          <label className="login-field">
            <span>{text.password}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={text.passwordPlaceholder}
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </label>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? text.loading : text.loginButton}
          </button>

          {onNavigate && (
            <p className="login-register-text">
              {text.noAccount}{" "}
              <button
                type="button"
                onClick={() => onNavigate("register")}
                disabled={loading}
              >
                {text.register}
              </button>
            </p>
          )}
        </form>
      </section>
    </main>
  );
}