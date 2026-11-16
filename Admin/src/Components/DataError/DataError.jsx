import styles from "./DataError.module.css";
import { useLanguage } from "../../context/LanguageContext";

export default function DataError() {
    const { language, t } = useLanguage();
    
    return (
        <div
            dir={language === "ar" ? "rtl" : "ltr"}
            className={styles.dataErrorDiv}
        >
            <img src="svg/dashboard.svg" />

            <strong className={styles.try}>
                No data available; please try again.
            </strong>

        </div>
    )
}