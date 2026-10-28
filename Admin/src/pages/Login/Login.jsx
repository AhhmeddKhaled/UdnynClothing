import { useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Login.css";

// IMPORT UI COMPONENTS
import { login, HomeRedirect } from "../../services/UsersServices.js";

// IMPORT LOGIN SERVICES
import { useLanguage } from "../../context/LanguageContext";

import {
  Form,
  FieldInputGroup,
  FieldSelectGroup,
} from "../../Components/Form/Form";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { t, language } = useLanguage();

  const handleSubmit = async (e) => {
    console.log("Email:", JSON.stringify(email));
    console.log("Password length:", password.length);

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
    <div className="login-wrap" dir={language === "ar" ? "rtl" : "ltr"}>
      <Form onSubmit={handleSubmit}>
        <h1>{t("login", "title")}</h1>

        <FieldInputGroup
          label={{
            name: t("login", "email"),
            id: "email",
          }}
          inputOptions={{
            id: "email",
            type: "email",
            value: email,
            required: true,
            minLength: 5,
            maxLength: 30,
            onChange: (e) => setEmail(e.target.value),
            focus: true,
          }}
        />

        <FieldInputGroup
          label={{
            name: t("login", "password"),
            id: "password",
          }}
          inputOptions={{
            id: "password",
            type: "password",
            value: password,
            required: true,
            minLength: 8,
            maxLength: 16,
            onChange: (e) => setPassword(e.target.value),
          }}
        />

        <FieldInputGroup
          inputOptions={{
            id: "submit",
            type: "submit",
            value: loading ? t("login", "loading") : t("login", "submit"),
            disabled: loading,
          }}
        />

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
      </Form>
    </div>
  );
}
