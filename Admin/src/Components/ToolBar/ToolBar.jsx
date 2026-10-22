import styles from "./ToolBar.module.css";
import { FieldInputGroup } from "../Form/Form";
import { IoMdNotificationsOutline } from "react-icons/io";
import { HiOutlineLanguage } from "react-icons/hi2";
import { IoMoonOutline } from "react-icons/io5";
import { LuSunMoon } from "react-icons/lu";
import { IoMoonSharp } from "react-icons/io5";

export default function ToolBar() {
  return (
    <div className={styles.toolBar}>

      <div className={styles.toolBarSearch}>
        <FieldInputGroup
          inputOptions={{
            type: "search",
            placeholder: "Search for anything",
          }}
        />
      </div>

      <div className={styles.toolBarUser}>

         <div className={styles.toolBarActions}>
        <span className={styles.toolBarActionsMood}>
          <IoMoonSharp size={24} className={styles.active}/>

          <LuSunMoon size={24} />
        </span>

        <span className={styles.toolBarActionsLang}>
          <HiOutlineLanguage size={24} />
        </span>

        <span className={styles.toolBarActionsNot}>
          <IoMdNotificationsOutline size={24} />
        </span>
      </div>
        <div className={styles.toolBarUserInfo}>
          <span className={styles.toolBarUserInfoName}>ahmed khaled</span>

          <span className={styles.toolBarUserInfoEmail}>
            ahmedkhaled229@gmail.com
          </span>
        </div>

        <div className={styles.toolBarUserInfoAvatar}>
          <img src="/img/userAvatar.jpg" alt="User Avatar" />
        </div>
      </div>
    </div>
  );
}
