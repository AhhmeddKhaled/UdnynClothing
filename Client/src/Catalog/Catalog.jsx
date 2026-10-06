import React, { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://udnyn.com";

const PAGE_SIZE = 40;

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [category, setCategory] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/availableStock`
      );

      if (!response.ok) {
        throw new Error("فشل تحميل المنتجات");
      }

      const data = await response.json();

      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
          ? data.products
          : null;

      if (!productList) {
        throw new Error("السيرفر أرسل بيانات غير صحيحة");
      }

      setProducts(productList);
    } catch (err) {
      console.error("Load products error:", err);
      setError("تعذر تحميل المنتجات حاليًا");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
            String(product.manufacturer).trim()
          )
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "ar"));
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
            String(product.category).trim()
          )
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "ar"));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      if (Number(product.qty) <= 0) {
        return false;
      }

      if (
        manufacturer &&
        String(product.manufacturer || "").trim() !==
          manufacturer
      ) {
        return false;
      }

      if (
        category &&
        String(product.category || "").trim() !== category
      ) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      const name = String(product.name || "").toLowerCase();
      const itemId = String(product.itemId || "").toLowerCase();
      const barcode = String(product.barcode || "").toLowerCase();
      const productManufacturer = String(
        product.manufacturer || ""
      ).toLowerCase();
      const productCategory = String(
        product.category || ""
      ).toLowerCase();

      return (
        name.includes(searchValue) ||
        itemId.includes(searchValue) ||
        barcode.includes(searchValue) ||
        productManufacturer.includes(searchValue) ||
        productCategory.includes(searchValue)
      );
    });
  }, [
    products,
    search,
    manufacturer,
    category,
  ]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, manufacturer, category]);

  const visibleProducts = filteredProducts.slice(
    0,
    visibleCount
  );

  if (loading) {
    return (
      <div className="products-loading">
        جاري تحميل المنتجات...
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-error">
        <p>{error}</p>

        <button
          onClick={loadProducts}
          className="retry-btn"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="wrap">
      <h1>المنتجات المتاحة</h1>

      <div className="tools">
        <input
          type="search"
          placeholder="ابحث باسم الصنف أو رقم الصنف أو الباركود..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={manufacturer}
          onChange={(event) =>
            setManufacturer(event.target.value)
          }
        >
          <option value="">كل المصانع</option>

          {manufacturers.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
        >
          <option value="">كل التصنيفات</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button onClick={loadProducts}>
          تحديث
        </button>

        {(search || manufacturer || category) && (
          <button
            className="clear-btn"
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

      <div className="count">
        عدد المنتجات المتاحة:{" "}
        <strong>{filteredProducts.length}</strong>
      </div>

      <div className="grid">
        {visibleProducts.map((product) => (
          <div
            className="card"
            key={product._id || product.itemId}
          >
            <div className="pic">
              {product.imagePath ? (
                <img
                  src={`${API_URL}${product.imagePath}`}
                  alt={product.name}
                  loading="lazy"
                />
              ) : (
                <div className="no-image">
                  لا توجد صورة
                </div>
              )}

              <span className="chip">
                #{product.itemId}
              </span>
            </div>

            <div className="info">
              <div className="name">
                {product.name}
              </div>

              <div className="qty">
                <span>العدد المتاح</span>
                <b>{product.qty}</b>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleProducts.length === 0 && (
        <div className="no-results">
          {search || manufacturer || category
            ? "لا توجد منتجات مطابقة للفلاتر."
            : "لا توجد منتجات متاحة حاليًا."}
        </div>
      )}

      {visibleCount < filteredProducts.length && (
        <div className="morewrap">
          <button
            onClick={() =>
              setVisibleCount(
                (count) => count + PAGE_SIZE
              )
            }
          >
            عرض المزيد
          </button>
        </div>
      )}
    </div>
  );
}