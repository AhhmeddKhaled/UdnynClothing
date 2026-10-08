import "./AvailableStock.css";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const PAGE_SIZE = 40;

export default function AvailableStock() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [manufacturer, setManufacturer] =
    useState("");
  const [category, setCategory] =
    useState("");
  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const headers = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/api/availableStock`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(
          `فشل تحميل المنتجات - HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      const productList =
        Array.isArray(data)
          ? data
          : Array.isArray(
                data?.products
              )
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
        "Load available stock error:",
        err
      );

      console.error(
        "AVAILABLE STOCK API:",
        `${API_URL}/api/availableStock`
      );

      setError(
        "تعذر تحميل المنتجات المتاحة حاليًا"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(
      "Available Stock API_URL:",
      API_URL
    );

    console.log(
      "Available Stock API:",
      `${API_URL}/api/availableStock`
    );

    loadProducts();
  }, []);

  const manufacturers = useMemo(() => {
    return [
      ...new Set(
        products
          .filter(
            (product) =>
              Number(product.qty) > 0 &&
              product.manufacturer
          )
          .map((product) =>
            String(
              product.manufacturer
            ).trim()
          )
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b, "ar")
    );
  }, [products]);

  const categories = useMemo(() => {
    return [
      ...new Set(
        products
          .filter(
            (product) =>
              Number(product.qty) > 0 &&
              product.category
          )
          .map((product) =>
            String(
              product.category
            ).trim()
          )
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b, "ar")
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return products.filter(
      (product) => {
        if (Number(product.qty) <= 0) {
          return false;
        }

        if (
          manufacturer &&
          String(
            product.manufacturer || ""
          ).trim() !== manufacturer
        ) {
          return false;
        }

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

        const itemId = String(
          product.itemId || ""
        ).toLowerCase();

        const barcode = String(
          product.barcode || ""
        ).toLowerCase();

        const productManufacturer =
          String(
            product.manufacturer || ""
          ).toLowerCase();

        const productCategory =
          String(
            product.category || ""
          ).toLowerCase();

        return (
          name.includes(searchValue) ||
          itemId.includes(searchValue) ||
          barcode.includes(searchValue) ||
          productManufacturer.includes(
            searchValue
          ) ||
          productCategory.includes(
            searchValue
          )
        );
      }
    );
  }, [
    products,
    search,
    manufacturer,
    category,
  ]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    search,
    manufacturer,
    category,
  ]);

  const visibleProducts =
    filteredProducts.slice(
      0,
      visibleCount
    );

  const formatPrice = (value) => {
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
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }

    const value =
      String(imagePath).trim();

    if (!value) {
      return null;
    }

    if (
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      return value;
    }

    const normalizedPath =
      value.startsWith("/")
        ? value
        : `/${value}`;

    const baseUrl =
      API_URL.replace(/\/+$/, "");

    return `${baseUrl}${normalizedPath}`;
  };

  if (loading) {
    return (
      <main
        className="available-stock-page"
        dir="rtl"
      >
        <div className="state available-stock-loading">
          <span
            className="available-stock-spinner"
            aria-hidden="true"
          />

          <span>
            جاري تحميل المنتجات...
          </span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        className="available-stock-page"
        dir="rtl"
      >
        <div className="state">
          <b>{error}</b>

          <button
            onClick={loadProducts}
            className="btn btn-primary"
          >
            إعادة المحاولة
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="available-stock-page"
      dir="rtl"
    >
      <header className="available-stock-header">
        <div>
          <h1 className="ds-page-title">
            البضاعة المتاحة
          </h1>

          <p className="ds-page-sub">
            عرض المنتجات والكميات والأسعار
            المتاحة
          </p>
        </div>
      </header>

      <section className="available-stock-tools card">
        <label className="field stock-search">
          <span>بحث</span>

          <input
            type="search"
            placeholder="اسم الصنف أو رقم الصنف أو الباركود..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </label>

        <label className="field">
          <span>المصنع</span>

          <select
            value={manufacturer}
            onChange={(event) =>
              setManufacturer(
                event.target.value
              )
            }
          >
            <option value="">
              كل المصانع
            </option>

            {manufacturers.map(
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

        <label className="field">
          <span>التصنيف</span>

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
          >
            <option value="">
              كل التصنيفات
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

        <div className="stock-actions">
          <button
            onClick={loadProducts}
            className="btn btn-secondary"
          >
            تحديث
          </button>

          {(search ||
            manufacturer ||
            category) && (
            <button
              className="btn btn-text"
              onClick={() => {
                setSearch("");
                setManufacturer("");
                setCategory("");
              }}
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </section>

      <div className="available-stock-count">
        عدد المنتجات المتاحة:{" "}
        <strong>
          {filteredProducts.length}
        </strong>
      </div>

      <section className="available-stock-grid">
        {visibleProducts.map(
          (product) => {
            const imageUrl =
              getImageUrl(
                product.imagePath
              );

            return (
              <article
                className="stock-product-card"
                key={
                  product._id ||
                  product.itemId
                }
              >
                <div className="stock-product-image">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={
                        product.name ||
                        `Product ${product.itemId}`
                      }
                      loading="lazy"
                      onLoad={() => {
                        console.log(
                          "IMAGE LOADED:",
                          imageUrl
                        );
                      }}
                      onError={(event) => {
                        console.error(
                          "IMAGE FAILED:",
                          imageUrl
                        );

                        console.error(
                          "IMAGE PATH:",
                          product.imagePath
                        );

                        console.error(
                          "IMAGE SIZE:",
                          event.currentTarget
                            .naturalWidth,
                          event.currentTarget
                            .naturalHeight
                        );
                      }}
                    />
                  ) : (
                    <div className="stock-no-image">
                      لا توجد صورة
                    </div>
                  )}

                  <span className="stock-item-id badge badge-neutral">
                    #{product.itemId}
                  </span>
                </div>

                <div className="stock-product-info">
                  <div className="stock-product-title">
                    <h2>
                      {product.name}
                    </h2>

                    {product.manufacturer && (
                      <span>
                        {
                          product.manufacturer
                        }
                      </span>
                    )}
                  </div>

                  <div className="stock-prices">
                    <div className="stock-price">
                      <span>
                        سعر الجملة
                      </span>

                      <strong>
                        {formatPrice(
                          product.wholesalePrice
                        )}
                        <small>
                          {" "}
                          ج.م
                        </small>
                      </strong>
                    </div>

                    <div className="stock-price">
                      <span>
                        سعر القطاعي
                      </span>

                      <strong>
                        {formatPrice(
                          product.retailPrice
                        )}
                        <small>
                          {" "}
                          ج.م
                        </small>
                      </strong>
                    </div>

                    <div className="stock-price stock-offer">
                      <span>
                        سعر العرض
                      </span>

                      <strong>
                        {formatPrice(
                          product.offerPrice
                        )}
                        <small>
                          {" "}
                          ج.م
                        </small>
                      </strong>
                    </div>
                  </div>

                  <div className="stock-quantity">
                    <span>
                      الكمية المتاحة
                    </span>

                    <strong className="num">
                      {product.qty}
                    </strong>
                  </div>
                </div>
              </article>
            );
          }
        )}
      </section>

      {visibleProducts.length ===
        0 && (
        <div className="state">
          <b>
            {search ||
            manufacturer ||
            category
              ? "لا توجد منتجات مطابقة للفلاتر."
              : "لا توجد منتجات متاحة حاليًا."}
          </b>
        </div>
      )}

      {visibleCount <
        filteredProducts.length && (
        <div className="available-stock-more">
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