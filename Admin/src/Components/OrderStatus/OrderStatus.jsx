import styles from "./orderStatus.module.css";

import { MdArrowDropDown } from "react-icons/md";

export default function OrderStatus({ status, change = false, onClose }) {
  return (
    <span
      className={`${styles.orderStatus} ${styles.orderStatus + status} ${status} ${styles.change ? styles.change : ""}`}
      onClick={onClose}
    >
      {status}
      {change && <MdArrowDropDown size={16} />}
    </span>
  );
}
