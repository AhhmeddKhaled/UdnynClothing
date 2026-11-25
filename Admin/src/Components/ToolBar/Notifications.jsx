import styles from "./ToolBar.module.css";
import { IoMdNotificationsOutline } from "react-icons/io";

export default function Notifications({classes}) {
    return (
        <span className={`${styles.toolBarActionsNot} ${classes}`}>
            <IoMdNotificationsOutline size={24} />
        </span>
    )
}