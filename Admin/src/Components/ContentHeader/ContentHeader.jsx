import styles from "./ContentHeader.module.css";

export default function ContentHeader({
  title,
  subTitle,
  user,
  sessionTime,
  action,
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerText}>
        <h2>{title}</h2>
        <p>{subTitle}</p>
      </div>

      <div className={styles.headerRight}>
        {action && (
          <div className={styles.headerAction}>{action}</div>
        )}
      </div>
    </header>
  );
}