import { useEffect, useState } from "react";
import { getToken } from "../../../services/api";
import { useLoading } from "../../../context/LoadingContext";
import { getImageUrl } from "../Catalog";
import ar from "../../../i18n/ar.js";
import en from "../../../i18n/en.js";
import "./ProductDetails.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export default function ProductDetails({
  productId,
  onNavigate,
  onAddToCart,
}) {
  const [language, setLanguage] = useState("ar");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { startLoading, stopLoading } = useLoading();

  const t = language === "ar" ? ar : en;
  const isArabic = language === "ar";
  const text = t.productDetails;

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError("");
      startLoading();

      try {
        const token = getToken();

        const response = await fetch(`${API_URL}/api/catalog`, {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        });

        if (!response.ok) {
          throw new Error("FETCH_FAILED");
        }

        const data = await response.json();

        const products = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
            ? data.products
            : [];

        const selectedProduct = products.find(
          (item) => String(item._id) === String(productId)
        );

        if (!selectedProduct) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        if (!cancelled) {
          setProduct(selectedProduct);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message === "PRODUCT_NOT_FOUND"
              ? text.notFound
              : text.error
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          stopLoading();
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
      stopLoading();
    };
  }, [productId, startLoading, stopLoading]);

  const handleAddToCart = () => {
    if (!product) return;

    if (typeof onAddToCart === "function") {
      onAddToCart(product);
      return;
    }

    if (typeof onNavigate === "function") {
      onNavigate("cart");
    }
  };

  const formatPrice = (price) => {
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      return price ?? "";
    }

    return new Intl.NumberFormat(
      isArabic ? "ar-EG" : "en-EG",
      {
        maximumFractionDigits: 2,
      }
    ).format(numericPrice);
  };

  if (loading) {
    return (
      <main
        className="product-details-page"
        lang={language}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="product-details-state">
          {text.loading}
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main
        className="product-details-page"
        lang={language}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="product-details-toolbar">
          <button
            type="button"
            className="product-details-back"
            onClick={() => onNavigate?.("catalog")}
          >
            {text.back}
          </button>

          <button
            type="button"
            className="product-language-toggle"
            onClick={() =>
              setLanguage((current) =>
                current === "ar" ? "en" : "ar"
              )
            }
          >
            {isArabic ? "English" : "العربية"}
          </button>
        </div>

        <div className="product-details-state" role="alert">
          {error || text.notFound}
        </div>
      </main>
    );
  }

  const imagePath =
    product.imagePath ||
    product.imageUrl ||
    product.image ||
    "";

  const imageUrl = getImageUrl(imagePath);

  const category = product.category || "";

  const description =
    product.description ||
    (isArabic ? "لا يوجد وصف لهذا المنتج حاليًا." : "No description is available for this product.");

  return (
    <main
      className="product-details-page"
      lang={language}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="product-details-toolbar">
        <button
          type="button"
          className="product-details-back"
          onClick={() => onNavigate?.("catalog")}
        >
          <span aria-hidden="true">
            {isArabic ? "→" : "←"}
          </span>{" "}
          {text.back}
        </button>

        <button
          type="button"
          className="product-language-toggle"
          onClick={() =>
            setLanguage((current) =>
              current === "ar" ? "en" : "ar"
            )
          }
          aria-label={
            isArabic ? "Switch to English" : "التبديل إلى العربية"
          }
        >
          {isArabic ? "English" : "العربية"}
        </button>
      </div>

      <section className="product-details-card">
        <div className="product-details-image">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name || text.description}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="product-details-no-image">
              {isArabic
                ? "لا توجد صورة متاحة"
                : "No image available"}
            </div>
          )}
        </div>

        <div className="product-details-info">
          {category && (
            <span className="product-details-badge">
              {category}
            </span>
          )}

          <h1>{product.name}</h1>

          <div className="product-details-price">
            <strong>
              {formatPrice(product.price)}
            </strong>
            <span>{t.common.currency}</span>
          </div>

          <div className="product-details-description">
            <h2>{text.description}</h2>
            <p>{description}</p>
          </div>

          <button
            type="button"
            className="product-add-to-cart"
            onClick={handleAddToCart}
          >
            {text.addToCart}
          </button>
        </div>
      </section>

      <section
        className="product-benefits"
        aria-label={
          isArabic ? "مميزات التسوق" : "Shopping benefits"
        }
      >
        <article className="product-benefit">
          <div className="product-benefit-icon" aria-hidden="true">
            ✓
          </div>

          <div>
            <h3>{text.premiumQuality}</h3>
            <p>{text.premiumQualityText}</p>
          </div>
        </article>

        <article className="product-benefit">
          <div className="product-benefit-icon" aria-hidden="true">
            ↻
          </div>

          <div>
            <h3>{text.exchange}</h3>
            <p>{text.exchangeText}</p>
          </div>
        </article>

        <article className="product-benefit">
          <div className="product-benefit-icon" aria-hidden="true">
            ♡
          </div>

          <div>
            <h3>{text.easyShopping}</h3>
            <p>{text.easyShoppingText}</p>
          </div>
        </article>
      </section>
    </main>
  );
}