import "./Catalog.css";

import { useEffect, useMemo, useState } from "react";

import { getToken } from "../../services/api";

import { useLoading } from "../../context/LoadingContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const PAGE_SIZE = 24;

export default function Catalog({
  user,
  onNavigate,
}) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    startLoading,
    stopLoading,
  } = useLoading();

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      startLoading();

      const token = getToken();

      const url = `${API_URL}/api/catalog`;

      console.log("📦 Catalog request:", {
        url,
        hasToken: Boolean(token),
      });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      const responseText =
        await response.text();

      console.log(
        "📦 Catalog response:",
        {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        }
      );

      let data = null;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `فشل تحميل المنتجات (${response.status})`
        );
      }

      const productList = Array.isArray(
        data
      )
        ? data
        : Array.isArray(data?.products)
          ? data.products
          : null;

      if (!productList) {
        throw new Error(
          "السيرفر أرسل بيانات غير صحيحة"
        );
      }

      setProducts(productList);
    } catch (err) {
      console.error(
        "Catalog load error:",
        err
      );

      setError(
        err.message ||
          "تعذر تحميل المنتجات حاليًا"
      );
    } finally {
      setLoading(false);
      stopLoading();
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) =>
            String(
              product.category || ""
            ).trim()
          )
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b, "ar")
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      if (
        category &&
        String(
          product.category || ""
        ).trim() !== category
      ) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      const name = String(
        product.name || ""
      ).toLowerCase();

      const description = String(
        product.description || ""
      ).toLowerCase();

      const manufacturer = String(
        product.manufacturer || ""
      ).toLowerCase();

      return (
        name.includes(searchValue) ||
        description.includes(searchValue) ||
        manufacturer.includes(searchValue)
      );
    });
  }, [
    products,
    search,
    category,
  ]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, category]);

  const visibleProducts =
    filteredProducts.slice(
      0,
      visibleCount
    );

  function formatPrice(value) {
    const price = Number(value);

    if (!Number.isFinite(price)) {
      return "—";
    }

    return new Intl.NumberFormat(
      "ar-EG",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    ).format(price);
  }

  if (loading) {
    return (
      <main
        className="catalog-page"
        dir="rtl"
      />
    );
  }

  if (error) {
    return (
      <main
        className="catalog-page"
        dir="rtl"
      >
        <div className="state">
          <b>{error}</b>

          <button
            className="btn btn-primary"
            onClick={loadProducts}
          >
            إعادة المحاولة
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="catalog-page"
      dir="rtl"
    >
      <header className="catalog-header">
        <div>
          <h1 className="ds-page-title">
            الكتالوج
          </h1>

          <p className="ds-page-sub">
            اكتشف تشكيلتنا واختار المنتجات
            المناسبة لك
          </p>
        </div>

        <span className="badge badge-neutral">
          {filteredProducts.length} منتج
        </span>
      </header>

      <section className="catalog-tools card">
        <label className="field catalog-search">
          <span>بحث</span>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="ابحث باسم المنتج أو الشركة المصنعة..."
          />
        </label>

        <label className="field">
          <span>القسم</span>

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
          >
            <option value="">
              كل الأقسام
            </option>

            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>
        </label>

        <button
          className="btn btn-secondary"
          onClick={loadProducts}
        >
          تحديث
        </button>

        {(search || category) && (
          <button
            className="btn btn-text"
            onClick={() => {
              setSearch("");
              setCategory("");
            }}
          >
            مسح الفلاتر
          </button>
        )}
      </section>

      <div className="catalog-count">
        عدد المنتجات:{" "}
        <strong>
          {filteredProducts.length}
        </strong>
      </div>

      <section className="catalog-grid">
        {visibleProducts.map(
          (product) => (
            <article
              className="catalog-product-card"
              key={
                product._id ||
                product.name
              }
            >
              <div className="catalog-product-image">
                {product.imagePath ? (
                  <img
                    src={`${API_URL}${product.imagePath}`}
                    alt={product.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="catalog-no-image">
                    لا توجد صورة
                  </div>
                )}

                <button
                  type="button"
                  className="catalog-favorite"
                  aria-label="إضافة للمفضلة"
                >
                  ♡
                </button>
              </div>

              <div className="catalog-product-info">
                <div className="catalog-product-meta">
                  {product.category && (
                    <span>
                      {product.category}
                    </span>
                  )}

                  {product.manufacturer && (
                    <span>
                      {product.manufacturer}
                    </span>
                  )}
                </div>

                <h2>
                  {product.name}
                </h2>

                {product.description && (
                  <p className="catalog-product-description">
                    {product.description}
                  </p>
                )}

                <div className="catalog-product-price">
                  <strong>
                    {formatPrice(
                      product.price
                    )}
                  </strong>

                  <span>ج.م</span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary catalog-product-button"
                >
                  عرض المنتج
                </button>
              </div>
            </article>
          )
        )}
      </section>

      {visibleProducts.length === 0 && (
        <div className="state">
          <b>
            {search || category
              ? "لا توجد منتجات مطابقة."
              : "لا توجد منتجات متاحة حاليًا."}
          </b>
        </div>
      )}

      {visibleCount <
        filteredProducts.length && (
        <div className="catalog-more">
          <button
            className="btn btn-secondary"
            onClick={() =>
              setVisibleCount(
                (count) =>
                  count + PAGE_SIZE
              )
            }
          >
            عرض المزيد
          </button>
        </div>
      )}
    </main>
  );
}