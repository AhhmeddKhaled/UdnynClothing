import './StatCard.css';

export default function StatCard({
  title,
  value,
  description,
  icon,
  iconStyle = "accent",
}) {
  return (
    <article className="dash-card dash-stat">
      <div className={`dash-stat-icon dash-icon-${iconStyle}`}>{icon}</div>

      <div className="dash-label">{title}</div>
      <div className="dash-value">{value}</div>
      <div className="dash-hint">{description}</div>
    </article>
  );
}
