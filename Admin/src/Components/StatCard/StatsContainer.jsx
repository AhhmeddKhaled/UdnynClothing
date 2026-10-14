import "./StatCard.css";

export default function StatsContainer({children}) {

    return (
        <section className="stats-container">
            {children}
        </section>
    )
}