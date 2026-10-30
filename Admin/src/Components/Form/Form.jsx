import { useState } from "react";

import styles from "./Form.module.css";

import { IoIosSearch } from "react-icons/io";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

import { formValidition } from "../../services/LoginServices.js";

export function Form({ children, onSubmit, width = "fit" }) {
  return (
    <form
      onSubmit={onSubmit}
      className={`${styles.form}
      ${width}
      `}
    >
      {children}
    </form>
  );
}

export function FieldInputGroup({ label = {}, inputOptions = {}, note = "" }) {
  const [showPassword, setShowPassword] = useState(false);
  const [valid, setValid] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [focus, setFocus] = useState(false);

  const handleChange = (value) => {
    const result = formValidition(inputOptions.type, value);

    if (!result) return;

    setValid(result.emailValid ?? result.passwordValid ?? false);
    setStatusMessage(result.statusMessage);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.fieldInputGroup}>
      <div className={styles.fieldInputGroupTop}>
        {Object.keys(label).length > 0 && (
          <label htmlFor={inputOptions.id}>{label.name}</label>
        )}

        {note && <span>{note}</span>}
      </div>

      <div className={styles.fieldInputGroupDown}>
        <input
          className={` ${styles.input} ${inputOptions.type} ${(inputOptions.value?.length ?? 0) === 0 ? styles.notFocus : styles.focus}`}
          id={inputOptions.id}
          placeholder={inputOptions.placeholder}
          type={
            inputOptions.type === "password" && showPassword
              ? "text"
              : inputOptions.type
          }
          value={inputOptions.value ?? ""}
          required={inputOptions.required || false}
          disabled={inputOptions.disabled || false}
          readOnly={inputOptions.readOnly || false}
          minLength={inputOptions.minLength || 2}
          maxLength={inputOptions.maxLength || 100}
          onChange={(e) => {
            inputOptions.onChange?.(e);
            handleChange(e.target.value);
          }}
          autoFocus={inputOptions.focus || false}
        />

        {statusMessage && (
          <span
            className={`${styles.statusMessage} ${valid ? styles.valid : styles.inValid}`}
          >
            {statusMessage}
          </span>
        )}
        {inputOptions.type === "search" ? (
          <span className={styles.iconSearch}>
            <IoIosSearch size={24} />
          </span>
        ) : (
          ""
        )}

        {inputOptions.type === "password" ? (
          <span className={styles.iconPassword}>
            {showPassword ? (
              <FaRegEye size={24} onClick={() => handleShowPassword()} />
            ) : (
              <FaRegEyeSlash size={24} onClick={() => handleShowPassword()} />
            )}
          </span>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export function FieldSelectGroup({ label = {}, selectOptions = {} }) {
  return (
    <div className={styles.fieldSelectGroup}>
      <div className={styles.fieldSelectGroupTop}>
        <label htmlFor={selectOptions.id}>{label.name}</label>
      </div>

      <div className={styles.fieldSelectGroupDown}>
        <select
          id={selectOptions.id}
          value={selectOptions.value}
          onChange={selectOptions.onChange}
        >
          {selectOptions.selectList.map((option, i) => (
            <option value={option} key={i}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
