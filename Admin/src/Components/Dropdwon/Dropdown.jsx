import { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./Dropdown.module.css";

import { MdKeyboardArrowDown } from "react-icons/md";
import { MdKeyboardArrowUp } from "react-icons/md";

export default function Dropdown({ label, options, onSelect, icon = null }) {
  const [open, setOpen] = useState(false);

  const handleOptionSelect = (option) => {
    onSelect(option);
  };

  return (
    <div className={` ${styles.dropdown } ${open ? styles.open : ""}`}>
      <button className={styles.dropdownButton} onClick={() => setOpen(!open)}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {label}

        <span className={styles.arrowIcon}>
          {open ? (
            <MdKeyboardArrowUp size={20} />
          ) : (
            <MdKeyboardArrowDown size={20} />
          )}
        </span>
      </button>

      <div className={styles.dropdownMenu}>
        <ul>
          {options.map((option) => (
            <li key={option} className={styles.dropdownMenuItem}>
              <NavLink
                to={option === "All Orders" ? "/orders" : "/orders/new"}
                onClick={() => handleOptionSelect(option)}
                className={styles.dropdownMenuLink}
              >
                {option}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      </div>
  );
}
