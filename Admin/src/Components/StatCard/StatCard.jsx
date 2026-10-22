import "./StatCard.css";
import { GoArrowUpRight } from "react-icons/go";
import { GoArrowDownLeft } from "react-icons/go";


export default function StatCard({
  title,
  value,
  description,
  icon,
  status,
  rate,
  rateStatus = true
}) 
{

  return (
    <article className={`card card-${status}`}>
      <div className="top-card">
        <span className={`card-icon card-icon-${status}`}>{icon}</span>
        <span className={`card-title`}>{title}</span>
        <span className={`card-rate`}>{rate} {rateStatus ? <GoArrowUpRight size={28} className="icon"/> : <GoArrowDownLeft size={24} className="icon"/>}</span>
      </div>

      <h3 className="card-value">{value}</h3>

      <p className="card-description">{description}</p>
    </article>
  );
  
}