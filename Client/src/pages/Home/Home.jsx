import "./Home.css";

export default function Home({ t, onNavigate }) {
  const categories = [
    {
      key: "men",
      icon: "⌁",
    },
    {
      key: "women",
      icon: "✦",
    },
    {
      key: "kids",
      icon: "◇",
    },
    {
      key: "accessories",
      icon: "◌",
    },
  ];

  const reviews = [t.reviews.first, t.reviews.second, t.reviews.third];

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">{t.home.brand}</span>

          <h1 className="home-hero-title">{t.home.heroTitle}</h1>

          <p className="home-hero-text">{t.home.heroText}</p>

          <button
            className="btn btn-primary"
            onClick={() => onNavigate("catalog")}
          >
            {t.home.shopNow}
          </button>
        </div>

        <div className="home-hero-visual">
          <div className="home-hero-image-wrap">
            <img
              src="/images/hero-fashion.png"
              alt={t.home.brand}
              className="home-hero-image"
            />
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <h2>{t.home.categoriesTitle}</h2>

            <p>{t.home.categoriesText}</p>
          </div>
        </div>

        <div className="home-categories">
          {categories.map((category) => (
            <button
              key={category.key}
              className="home-category-card"
              onClick={() => onNavigate("catalog")}
            >
              <span className="home-category-icon">{category.icon}</span>

              <strong>{t.categories[category.key]}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <h2>{t.home.offersTitle}</h2>

            <p>{t.home.offersText}</p>
          </div>

          <button className="btn btn-text" onClick={() => onNavigate("offers")}>
            {t.common.viewAll}
          </button>
        </div>

        <div className="home-placeholder-grid">
          <div className="home-product-placeholder" />
          <div className="home-product-placeholder" />
          <div className="home-product-placeholder" />
          <div className="home-product-placeholder" />
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <h2>{t.home.featuredTitle}</h2>

            <p>{t.home.featuredText}</p>
          </div>
        </div>

        <div className="home-placeholder-grid">
          <div className="home-product-placeholder" />
          <div className="home-product-placeholder" />
          <div className="home-product-placeholder" />
          <div className="home-product-placeholder" />
        </div>
      </section>

      <section className="home-section home-reviews">
        <div className="home-section-heading">
          <div>
            <h2>{t.home.reviewsTitle}</h2>

            <p>{t.home.reviewsText}</p>
          </div>
        </div>

        <div className="home-reviews-grid">
          {reviews.map((review, index) => (
            <article className="home-review-card" key={index}>
              <div className="home-review-stars">★★★★★</div>

              <p>"{review.text}"</p>

              <strong>{review.name}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div>
          <h2>{t.home.ctaTitle}</h2>

          <p>{t.home.ctaText}</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => onNavigate("catalog")}
        >
          {t.home.ctaButton}
        </button>
      </section>
    </main>
  );
}
