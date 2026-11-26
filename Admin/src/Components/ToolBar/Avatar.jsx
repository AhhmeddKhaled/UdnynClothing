import styles from "./ToolBar.module.css";

export default function Avatar({classes}) {
    return (
         <div className={`${styles.toolBarUserInfoAvatar} ${classes}`}>
          <img src="/img/userAvatar.jpg" alt="User Avatar" />
        </div>
    )
}