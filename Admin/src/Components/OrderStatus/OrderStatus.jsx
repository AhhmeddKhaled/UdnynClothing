import "./orderStatus.css";

import { MdArrowDropDown } from "react-icons/md";

export default function OrderStatus({ status, change = false }) {
  return (
    <span className={`order-status order-status-${status}`}>
      {status}
      {change && <MdArrowDropDown size={16}/>}
    </span>
  );
}