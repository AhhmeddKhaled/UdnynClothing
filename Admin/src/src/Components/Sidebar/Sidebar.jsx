import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const NAV_ITEMS = [
  { path: "/dashboard", label: "لوحة المتابعة" },
  { path: "/products", label: "المنتجات" },
  { path: "/orders", label: "الطلبات", soon: true },
  { path: "/users", label: "المستخدمون", soon: true },
];

export default function Sidebar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout?.();
    navigate("/login");
  };

  return (
    <>
      <div className="sb-topbar">
        <button className="sb-burger" onClick={() => setOpen(true)} aria-label="فتح القائمة">
          <span /><span /><span />
        </button>
        <span className="sb-topbar-title">أدنين</span>
      </div>

      {open && <div className="sb-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sb-aside ${open ? "sb-open" : ""}`} dir="rtl">
        <div className="sb-brand">
          <h1>أدنين</h1>
          <span>لوحة التحكم</span>
        </div>

        <nav className="sb-nav">
          {NAV_ITEMS.map((item) =>
            item.soon ? (
              <span key={item.path} className="sb-item sb-soon">
                <span>{item.label}</span>
                <em>قريبًا</em>
              </span>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sb-item ${isActive ? "sb-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="sb-user">
          <div className="sb-user-info">
            <b>{user?.name}</b>
            <span>{roleLabel(user?.role)}</span>
          </div>
          <button className="sb-logout" onClick={handleLogout}>خروج</button>
        </div>
      </aside>
    </>
  );
}

function roleLabel(role) {
  const map = {
    owner: "مالك",
    admin: "أدمن",
    moderator: "مشرف",
    editor: "محرر",
    customer: "عميل",
  };
  return map[role] || role || "";
}