
import { useState } from "react";
import "./Tabs.css";

export default function Tabs({ tabs }) {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <ul className="tabs">
            {tabs.map((tab, i) => (
                <li
                    className={`tab ${activeTab === i ? "isActive" : ""}`}
                    onClick={() => setActiveTab(i)}
                    key={i}
                >
                    {tab}
                </li>
            ))}
        </ul>
    );
}
