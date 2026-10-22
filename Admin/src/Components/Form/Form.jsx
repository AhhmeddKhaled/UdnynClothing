import styles from "./Form.module.css";

import { IoIosSearch } from "react-icons/io";

export function Form({ children, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      {children}
    </form>
  );
}

export function FieldInputGroup({ label = {}, inputOptions = {}, note = "" }) {
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
          id={inputOptions.id}
          placeholder={inputOptions.placeholder}
          type={inputOptions.type || "text"}
          value={inputOptions.value ?? ""}
          required={inputOptions.required}
          disabled={inputOptions.disabled}
          readOnly={inputOptions.readOnly}
          minLength={inputOptions.minLength}
          maxLength={inputOptions.maxLength}
          onChange={inputOptions.onChange}
        />

        {inputOptions.type === "search" ? (
          <span className={styles.iconSearch}>
            <IoIosSearch size={24} />
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
