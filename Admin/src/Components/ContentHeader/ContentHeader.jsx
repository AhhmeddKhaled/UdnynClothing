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
        <div className="header-user-info">
          <span className="header-user-name">
            {user?.name || "User"}
          </span>

          <span className="header-user-role">
            {user?.role || "Admin"}
          </span>

          {sessionTime && (
            <span className="header-user-time">
              Signed in at {sessionTime}
            </span>
          )}
        </div>

        <div className="header-avatar">
          {user?.image ? (
            <img
              src={user.image}
              alt={user?.name || "User"}
            />
          ) : (
            <span>
              {(user?.name?.charAt(0) || "U").toUpperCase()}
            </span>
          )}
        </div>

        {action && (
          <div className="header-action">{action}</div>
        )}
      </div>
    </header>
  );
}