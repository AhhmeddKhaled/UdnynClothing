import { useState } from "react";
import { loginUser, saveAuth } from "../../services/api.js";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("من فضلك أدخل البريد الإلكتروني وكلمة المرور");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(
        email.trim(),
        password
      );

      saveAuth(data);

      onLogin(data.user);
    } catch (error) {
      setError(
        error.message || "حدث خطأ أثناء تسجيل الدخول"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page" dir="rtl">
      <section className="login-card card">
        <header className="login-header">
          <div className="ds-display">أدنين</div>

          <p className="ds-page-sub">
            تسجيل الدخول إلى لوحة التحكم
          </p>
        </header>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div
              className="login-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <label className="field">
            <span>البريد الإلكتروني</span>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="example@email.com"
              autoComplete="email"
              disabled={loading}
              required
            />
          </label>

          <label className="field">
            <span>كلمة المرور</span>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="أدخل كلمة المرور"
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;