import { useNavigate } from "react-router-dom";
import { useState } from "react";

import styles from "./Login.module.css";

// IMPORT UI COMPONENTS
import useLoginLogic  from "../../UI_Logic/LoginLogic.jsx";

// IMPORT LOGIN SERVICES
import { useLanguage } from "../../context/LanguageContext";

import {
  Form,
  FieldInputGroup,
} from "../../Components/Form/Form";

export default function Login() {

  const { t, language } = useLanguage();

  const logic = useLoginLogic();

  const {
    handleSubmit,
    email,
    setEmail,
    password,
    setPassword,
    valid,
    loading
  } = logic;
  return (
    <div className={styles.loginWrap} dir={language === "ar" ? "rtl" : "ltr"}>
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
      </Form>
    </div>
  );
}
