import { useState } from "react";
import "./Tabs.css";

export default function Tabs({ tabs, setValue }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <ul className="tabs">
      {tabs.map((tab, i) => (
        <input
          className={`tab ${activeTab === i ? "isActive" : ""}`}
          onClick={() => {
            (setActiveTab(i), setValue(tab.toLowerCase()));
          }}
          key={i}
          placeholder={tab}
          readOnly
          value={tab.toLowerCase()}
        />
      ))}
    </ul>
  );
}
