
import { useEffect } from "react";
import './Offers.css';

export default function Offers({ user, onNavigate }) {
  useEffect(() => {
    if (!user) {
      onNavigate("register");
    }
  }, [user, onNavigate]);

  if (!user) {
    return null;
  }

  return (
    <main className="offers-page" dir="rtl">
      <header className="offers-header">
        <h1>عروض مميزة</h1>
        <p>
          اكتشف عروضنا واختياراتنا المميزة واستمتع بتجربة تسوق مختلفة.
        </p>
      </header>

      <section className="offers-register-card">
        <h2>عروض UDNYN</h2>
        <p>سيتم عرض العروض هنا.</p>
      </section>
    </main>
  );
}