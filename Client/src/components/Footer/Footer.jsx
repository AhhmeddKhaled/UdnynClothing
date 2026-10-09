import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaTelegram,
} from "react-icons/fa6";
import "./Footer.css";

const footerLinks = [
  { key: "home", page: "home" },
  { key: "catalog", page: "catalog" },
  { key: "offers", page: "offers" },
  { key: "categories", page: "categories" },
  { key: "favorites", page: "favorites" },
];

const learningLinks = [
  { key: "styling", page: "styling" },
  { key: "colors", page: "colors" },
  { key: "trends", page: "trends" },
];

const serviceLinks = [
  { key: "contact", page: "contact" },
  { key: "faq", page: "faq" },
  { key: "shipping", page: "shipping" },
];

const socialPlatforms = [
  {
    key: "facebook",
    label: "Facebook",
    Icon: FaFacebookF,
  },
  {
    key: "instagram",
    label: "Instagram",
    Icon: FaInstagram,
  },
  {
    key: "tiktok",
    label: "TikTok",
    Icon: FaTiktok,
  },
  {
    key: "telegram",
    label: "Telegram",
    Icon: FaTelegram,
  },
];

export default function Footer({ language, t, onNavigate, socialLinks = {} }) {
  const isArabic = language === "ar";
  const footer = t.footer;

  function navigateTo(page) {
    if (
      page === "styling" ||
      page === "colors" ||
      page === "trends" ||
      page === "contact" ||
      page === "faq" ||
      page === "shipping"
    ) {
      return;
    }

    onNavigate?.(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderSocialLinks(location) {
    return socialPlatforms.map(({ key, label, Icon }) => {
      const url = socialLinks[key];

      if (!url) {
        return null;
      }

      return (
        <a
          key={key}
          className={
            location === "bottom"
              ? "udnyn-footer__bottom-icon"
              : "udnyn-footer__social-link"
          }
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
        >
          <Icon aria-hidden="true" />
        </a>
      );
    });
  }

  return (
    <footer className="udnyn-footer" dir={isArabic ? "rtl" : "ltr"}>
      <div className="udnyn-footer__container">
        <div className="udnyn-footer__intro">
          <div className="udnyn-footer__intro-copy">
            <button
              type="button"
              className="udnyn-footer__brand"
              onClick={() => navigateTo("home")}
              aria-label={footer.brand}
            >
              {footer.brand}
            </button>

            <p className="udnyn-footer__tagline">{footer.tagline}</p>
          </div>

          <button
            type="button"
            className="udnyn-footer__catalog-button"
            onClick={() => navigateTo("catalog")}
          >
            {isArabic ? "تصفّحي الكتالوج" : "Browse Catalog"}
            <span aria-hidden="true">{isArabic ? "←" : "→"}</span>
          </button>
        </div>
        <div className="udnyn-footer__divider" />

        <div className="udnyn-footer__grid">
          <nav className="udnyn-footer__column" aria-label={footer.quickLinks}>
            <h2 className="udnyn-footer__heading">{footer.quickLinks}</h2>

            <ul className="udnyn-footer__list">
              {footerLinks.map(({ key, page }) => (
                <li key={key}>
                  <button
                    type="button"
                    className="udnyn-footer__link"
                    onClick={() => navigateTo(page)}
                  >
                    {t.nav[key]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <section className="udnyn-footer__column">
            <h2 className="udnyn-footer__heading">{footer.learnTitle}</h2>

            <ul className="udnyn-footer__list">
              {learningLinks.map(({ key, page }) => (
                <li key={key}>
                  <button
                    type="button"
                    className="udnyn-footer__link"
                    onClick={() => navigateTo(page)}
                  >
                    {footer.learning?.[key] ?? key}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="udnyn-footer__column">
            <h2 className="udnyn-footer__heading">{footer.socialTitle}</h2>

            <p className="udnyn-footer__column-description">
              {footer.socialDescription}
            </p>

            <div className="udnyn-footer__social-list">
              {renderSocialLinks("main")}
            </div>
          </section>

          <section className="udnyn-footer__column">
            <h2 className="udnyn-footer__heading">{footer.serviceTitle}</h2>

            <ul className="udnyn-footer__list">
              {serviceLinks.map(({ key, page }) => (
                <li key={key}>
                  <button
                    type="button"
                    className="udnyn-footer__link"
                    onClick={() => navigateTo(page)}
                  >
                    {footer.service?.[key] ?? key}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="udnyn-footer__bottom">
          <div className="udnyn-footer__bottom-actions">
            <div className="udnyn-footer__bottom-socials">
              {renderSocialLinks("bottom")}
            </div>

            <button
              type="button"
              className="udnyn-footer__back-top"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
            >
              {footer.backToTop}
              <span aria-hidden="true">↑</span>
            </button>
          </div>

          <p className="udnyn-footer__copyright">
            {footer.copyright.replace(
              "{year}",
              String(new Date().getFullYear()),
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
