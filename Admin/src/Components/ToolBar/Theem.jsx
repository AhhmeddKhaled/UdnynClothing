import styles from "./ToolBar.module.css";
import { LuSunMoon } from "react-icons/lu";
import { IoMoonSharp } from "react-icons/io5";
import { useState } from "react";

export default function Theem({ classes }) {
    const [theem, setTheem] = useState("ligth");

    
    return (
        <span className={` ${styles.theem} ${classes}`}>
            <IoMoonSharp size={24} className={styles.active} />

            <LuSunMoon size={24} />
        </span>

    )
}