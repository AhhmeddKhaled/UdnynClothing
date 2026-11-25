import styles from "./ToolBar.module.css";
import { HiOutlineLanguage } from "react-icons/hi2";
import { useLanguage } from "../../context/LanguageContext";

export default function Language({classes}) {
    const { toggleLanguage, language, t } = useLanguage();
    return (
         <span className={`${styles.toolBarActionsLang} ${classes}`}>
                    <HiOutlineLanguage
                      size={24}
                      onClick={toggleLanguage}
                      title={language === "ar" ? "English" : "العربية"}
                    />
                  </span>
    )
}