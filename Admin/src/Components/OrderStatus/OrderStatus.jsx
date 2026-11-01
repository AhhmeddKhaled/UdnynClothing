import styles from "./orderStatus.module.css";

import { GoDotFill } from "react-icons/go";

import { MdArrowDropDown } from "react-icons/md";

export default function OrderStatus({ status, change = false, onClose = null }) {
  return (
    <span
      className={`${styles.orderStatus} ${styles.orderStatus + status} ${status} ${change ? styles.change : ""}`}
      onClick={onClose}
    >

      <span className={`${styles.statusIcon} ${status}`}>
        <GoDotFill size={16} />
      </span>
      {status}
      {change && <MdArrowDropDown size={16} />}
    </span>
  );
}
