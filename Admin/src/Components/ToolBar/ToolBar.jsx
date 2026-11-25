import styles from "./ToolBar.module.css";
import { FieldInputGroup } from "../Form/Form";

import { useLanguage } from "../../context/LanguageContext";


// Import Ui Components 
import Notifications from "./Notifications.jsx";
import Language from "./Language";
import Theem from "./Theem.jsx";

export default function ToolBar() {
    const { language, t } = useLanguage();

  return (
    <div className={styles.toolBar} dir={language === "ar" ? "rtl" : "ltr"}>
      <div className={styles.toolBarSearch}>
        <FieldInputGroup
          inputOptions={{
            type: "search",
            placeholder: t("toolbar", "search"),
          }}
        />
      </div>

      <div className={styles.toolBarUser}>
        <div className={styles.toolBarActions}>

          <Language classes={styles.lang}/>

          <Notifications classes={styles.notifi}/>

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
