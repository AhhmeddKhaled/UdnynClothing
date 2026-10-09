import { useState } from "react";
import { registerUser, saveAuth } from "../../services/api.js";
import "./Register.css";

export default function Register({
  onRegister,
  onNavigate,
  language = "ar",
  t,
}) {
  const isArabic = language === "ar";

  const text = t?.auth || {};

  const labels = {
    title: text.registerTitle || (isArabic ? "إنشاء حساب جديد" : "Create Account"),
    subtitle:
      text.registerSubtitle ||
      (isArabic
        ? "انضم إلى UDNYN واستمتع بتجربة تسوق مميزة."
        : "Join UDNYN and enjoy a great shopping experience."),
    name: text.name || (isArabic ? "الاسم بالكامل" : "Full name"),
    email: text.email || (isArabic ? "البريد الإلكتروني" : "Email address"),
    password: text.password || (isArabic ? "كلمة المرور" : "Password"),
    confirmPassword:
      text.confirmPassword ||
      (isArabic ? "تأكيد كلمة المرور" : "Confirm password"),
    namePlaceholder:
      text.namePlaceholder || (isArabic ? "اكتب اسمك" : "Enter your name"),
    emailPlaceholder:
      text.emailPlaceholder || (isArabic ? "example@email.com" : "example@email.com"),
    passwordPlaceholder:
      text.passwordPlaceholder ||
      (isArabic ? "أدخل كلمة المرور" : "Enter your password"),
    confirmPlaceholder:
      text.confirmPasswordPlaceholder ||
      (isArabic ? "أعد كتابة كلمة المرور" : "Re-enter your password"),
    submit: text.registerButton || (isArabic ? "إنشاء حساب" : "Create account"),
    loading: text.loading || (isArabic ? "جاري إنشاء الحساب..." : "Creating account..."),
    haveAccount:
      text.haveAccount || (isArabic ? "عندك حساب بالفعل؟" : "Already have an account?"),
    login: text.login || (isArabic ? "تسجيل الدخول" : "Log in"),
    required: isArabic ? "الحقل ده مطلوب." : "This field is required.",
    nameInvalid: isArabic
      ? "اكتب اسمك، ويكون حرفين على الأقل."
      : "Enter a name with at least 2 characters.",
    emailInvalid: isArabic
      ? "اكتب إيميل صحيح، مثل example@email.com."
      : "Enter a valid email, e.g. example@email.com.",
    passwordHint: isArabic
      ? "استخدم 8 أحرف على الأقل، مع حروف وأرقام."
      : "Use at least 8 characters, including letters and numbers.",
    passwordInvalid: isArabic
      ? "كلمة المرور لازم تحتوي على 8 أحرف على الأقل، وحروف وأرقام."
      : "Password must have at least 8 characters, letters, and numbers.",
    confirmHint: isArabic
      ? "اكتب نفس كلمة المرور مرة تانية."
      : "Enter the same password again.",
    passwordMismatch: isArabic
      ? "كلمتا المرور مش متطابقتين."
      : "Passwords do not match.",
    valid: isArabic ? "تمام، البيانات صحيحة." : "Looks good!",
    showPassword: isArabic ? "إظهار كلمة المرور" : "Show password",
    hidePassword: isArabic ? "إخفاء كلمة المرور" : "Hide password",
    serverError: isArabic
      ? "حصل خطأ أثناء إنشاء الحساب. حاول تاني."
      : "Could not create your account. Please try again.",
    incompleteResponse: isArabic
      ? "السيرفر لم يُرجع بيانات الحساب كاملة."
      : "The server did not return complete account information.",
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  const nameValid = trimmedName.length >= 2;

  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

  // 8 أحرف على الأقل، وتحتوي على حرف واحد ورقم واحد على الأقل.
  const passwordValid =
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password);

  const confirmValid =
    confirmPassword.length > 0 &&
    confirmPassword === password;

  const fields = {
    name: {
      value: name,
      valid: nameValid,
      message:
        name.length === 0
          ? labels.required
          : nameValid
            ? labels.valid
            : labels.nameInvalid,
    },
    email: {
      value: email,
      valid: emailValid,
      message:
        email.length === 0
          ? labels.required
          : emailValid
            ? labels.valid
            : labels.emailInvalid,
    },
    password: {
      value: password,
      valid: passwordValid,
      message:
        password.length === 0
          ? labels.required
          : passwordValid
            ? labels.valid
            : labels.passwordInvalid,
    },
    confirmPassword: {
      value: confirmPassword,
      valid: confirmValid,
      message:
        confirmPassword.length === 0
          ? labels.required
          : confirmValid
            ? labels.valid
            : labels.passwordMismatch,
    },
  };

  function getFieldStatus(fieldName) {
    const field = fields[fieldName];

    if (!touched[fieldName] && !submitted) {
      return "pristine";
    }

    if (fieldName === "confirmPassword" && !confirmPassword) {
      return "invalid";
    }

    return field.valid ? "valid" : "invalid";
  }

  function handleBlur(fieldName) {
    setTouched((previous) => ({
      ...previous,
      [fieldName]: true,
    }));
  }

  function handleChange(fieldName, setter, value) {
    setter(value);
    setError("");

    setTouched((previous) => ({
      ...previous,
      [fieldName]: true,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitted(true);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    setError("");

    if (!nameValid || !emailValid || !passwordValid || !confirmValid) {
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      if (!data?.token || !data?.user) {
        throw new Error(labels.incompleteResponse);
      }

      saveAuth(data);
      onRegister(data.user);
    } catch (err) {
      setError(err.message || labels.serverError);
    } finally {
      setLoading(false);
    }
  }

  function renderFeedback(fieldName) {
    const status = getFieldStatus(fieldName);
    const field = fields[fieldName];

    let message = field.message;

    if (fieldName === "password" && !password) {
      message = labels.passwordHint;
    }

    if (fieldName === "confirmPassword" && !confirmPassword) {
      message = labels.confirmHint;
    }

    return (
      <span
        className={`register-feedback register-feedback--${status}`}
        aria-live="polite"
      >
        {status === "valid" ? "✓ " : status === "invalid" ? "⚠ " : ""}
        {message}
      </span>
    );
  }

  return (
    <main
      className="register-page"
      dir={isArabic ? "rtl" : "ltr"}
      lang={language}
    >
      <section className="register-card">
        <div className="register-heading">
          <h1>{labels.title}</h1>
          <p>{labels.subtitle}</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {/* الاسم */}
          <label className="register-field">
            <span>{labels.name}</span>

            <input
              className={`register-input register-input--${getFieldStatus("name")}`}
              type="text"
              value={name}
              onChange={(event) =>
                handleChange("name", setName, event.target.value)
              }
              onBlur={() => handleBlur("name")}
              placeholder={labels.namePlaceholder}
              autoComplete="name"
              disabled={loading}
              required
              aria-invalid={
                getFieldStatus("name") === "invalid" ? "true" : "false"
              }
            />

            {renderFeedback("name")}
          </label>

          {/* البريد الإلكتروني */}
          <label className="register-field">
            <span>{labels.email}</span>

            <input
              className={`register-input register-input--${getFieldStatus("email")}`}
              type="email"
              value={email}
              onChange={(event) =>
                handleChange("email", setEmail, event.target.value)
              }
              onBlur={() => handleBlur("email")}
              placeholder={labels.emailPlaceholder}
              autoComplete="email"
              inputMode="email"
              dir="ltr"
              disabled={loading}
              required
              aria-invalid={
                getFieldStatus("email") === "invalid" ? "true" : "false"
              }
            />

            {renderFeedback("email")}
          </label>

          {/* كلمة المرور */}
          <label className="register-field">
            <span>{labels.password}</span>

            <div
              className={`password-input-wrap register-input--${getFieldStatus("password")}`}
            >
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) =>
                  handleChange("password", setPassword, event.target.value)
                }
                onBlur={() => handleBlur("password")}
                placeholder={labels.passwordPlaceholder}
                autoComplete="new-password"
                minLength={8}
                disabled={loading}
                required
                aria-invalid={
                  getFieldStatus("password") === "invalid" ? "true" : "false"
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={
                  showPassword ? labels.hidePassword : labels.showPassword
                }
                title={
                  showPassword ? labels.hidePassword : labels.showPassword
                }
                disabled={loading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {renderFeedback("password")}
          </label>

          {/* تأكيد كلمة المرور */}
          <label className="register-field">
            <span>{labels.confirmPassword}</span>

            <div
              className={`password-input-wrap register-input--${getFieldStatus("confirmPassword")}`}
            >
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) =>
                  handleChange(
                    "confirmPassword",
                    setConfirmPassword,
                    event.target.value
                  )
                }
                onBlur={() => handleBlur("confirmPassword")}
                placeholder={labels.confirmPlaceholder}
                autoComplete="new-password"
                disabled={loading}
                required
                aria-invalid={
                  getFieldStatus("confirmPassword") === "invalid"
                    ? "true"
                    : "false"
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword
                    ? labels.hidePassword
                    : labels.showPassword
                }
                title={
                  showConfirmPassword
                    ? labels.hidePassword
                    : labels.showPassword
                }
                disabled={loading}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {renderFeedback("confirmPassword")}
          </label>

          {error && (
            <p className="register-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? labels.loading : labels.submit}
          </button>

          <p className="login-register-text">
            {labels.haveAccount}{" "}
            <button
              type="button"
              onClick={() => onNavigate("login")}
              disabled={loading}
            >
              {labels.login}
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}