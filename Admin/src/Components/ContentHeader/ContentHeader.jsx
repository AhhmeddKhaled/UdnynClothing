import "./ContentHeader.css";

export default function ContentHeader({
  title,
  subTitle,
  user,
  sessionTime,
  action,
}) {
  return (
    <header className="header">
      <div className="header-text">
        <h2>{title}</h2>
        <p>{subTitle}</p>
      </div>

      <div className="header-right">
        {action && (
          <div className="header-action">{action}</div>
        )}
      </div>
    </header>
  );
}