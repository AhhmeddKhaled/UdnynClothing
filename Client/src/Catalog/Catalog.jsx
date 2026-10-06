import React, { useEffect, useMemo, useState } from "react";
import "./Catalog.css";

// ======================================================
// رابط السيرفر على Back4App
// ======================================================

const API_URL = import.meta.env.VITE_API_URL;

const PAGE_SIZE = 40;

export default function Products() {
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedManufacturer, setSelectedManufacturer] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // جلب المنتجات
  // ==========================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/availableStock`);

      if (!response.ok) {
        throw new Error("فشل تحميل المنتجات");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("السيرفر أرسل بيانات غير صحيحة");
      }

      setProducts(data);
    } catch (err) {
      console.error("Load products error:", err);

      setError("تعذر تحميل المنتجات حاليًا");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // تحميل المنتجات عند فتح الصفحة
  // ==========================================

  useEffect(() => {
    loadProducts();
  }, []);

  // ==========================================
  // قائمة المصانع
  // ==========================================

  const manufacturers = useMemo(() => {
    return [
      ...new Set(
        products
          .filter((product) => Number(product.qty) > 0 && product.manufacturer)
          .map((product) => String(product.manufacturer).trim())
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b, "ar"));
  }, [products]);

  // ==========================================
  // قائمة التصنيفات
  // ==========================================

  const categories = useMemo(() => {
    return [
      ...new Set(
        products
          .filter((product) => Number(product.qty) > 0 && product.category)
          .map((product) => String(product.category).trim())
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b, "ar"));
  }, [products]);

  // ==========================================
  // فلترة المنتجات
  // ==========================================

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();

    return products.filter((product) => {
      // إخفاء المنتجات التي كميتها صفر أو سالبة
      if (Number(product.qty) <= 0) {
        return false;
      }

      // فلتر المصنع
      if (
        selectedManufacturer &&
        String(product.manufacturer || "").trim() !== selectedManufacturer
      ) {
        return false;
      }

      // فلتر التصنيف
      if (
        selectedCategory &&
        String(product.category || "").trim() !== selectedCategory
      ) {
        return false;
      }

      // البحث
      if (!value) {
        return true;
      }

      const name = String(product.name || "").toLowerCase();

      const itemId = String(product.itemId || "").toLowerCase();

      const barcode = String(product.barcode || "").toLowerCase();

      const manufacturer = String(product.manufacturer || "").toLowerCase();

      const category = String(product.category || "").toLowerCase();

      return (
        name.includes(value) ||
        itemId.includes(value) ||
        barcode.includes(value) ||
        manufacturer.includes(value) ||
        category.includes(value)
      );
    });
  }, [products, search, selectedManufacturer, selectedCategory]);

  // ==========================================
  // المنتجات الظاهرة
  // ==========================================

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  // ==========================================
  // عند تغيير الفلاتر نرجع لأول المنتجات
  // ==========================================

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, selectedManufacturer, selectedCategory]);

  // ==========================================
  // مسح كل الفلاتر
  // ==========================================

  const clearFilters = () => {
    setSearch("");
    setSelectedManufacturer("");
    setSelectedCategory("");
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return <div className="products-loading">جاري تحميل المنتجات...</div>;
  }

  // ==========================================
  // Error
  // ==========================================

  if (error) {
    return (
      <div className="products-error">
        <p>{error}</p>

        <button onClick={loadProducts} className="retry-btn">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // ==========================================
  // الصفحة
  // ==========================================

  return (
    <div className="wrap">
      <h1>المنتجات المتاحة</h1>

      {/* ================================
          أدوات البحث والفلترة
      ================================= */}

      <div className="tools">
        {/* البحث */}

        <input
          type="search"
          placeholder="ابحث باسم الصنف أو رقم الصنف أو الباركود..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* المصنع */}

        <select
          value={selectedManufacturer}
          onChange={(e) => setSelectedManufacturer(e.target.value)}
        >
          <option value="">كل المصانع</option>

          {manufacturers.map((manufacturer) => (
            <option key={manufacturer} value={manufacturer}>
              {manufacturer}
            </option>
          ))}
        </select>

        {/* التصنيف */}

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">كل التصنيفات</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* تحديث */}

        <button onClick={loadProducts}>تحديث</button>

        {/* مسح الفلاتر */}

        {(search || selectedManufacturer || selectedCategory) && (
          <button className="clear-btn" onClick={clearFilters}>
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* ================================
          العدد
      ================================= */}

      <div className="count">
        عدد المنتجات المتاحة: <strong>{filteredProducts.length}</strong>
      </div>

      {/* ================================
          Grid
      ================================= */}

      <div className="grid">
        {visibleProducts.map((product) => (
          <div className="card" key={product.itemId}>
            {/* الصورة */}

            <div className="pic">
              {product.imagePath ? (
                <img
                  src={`${API_URL}${product.imagePath}`}
                  alt={product.name}
                  loading="lazy"
                />
              ) : (
                <div className="no-image">لا توجد صورة</div>
              )}

              <span className="chip">#{product.itemId}</span>
            </div>

            {/* البيانات */}

            <div className="info">
              <div className="name">{product.name}</div>

              <div className="qty">
                <span>العدد المتاح</span>

                <b>{product.qty}</b>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* لا توجد نتائج */}

      {visibleProducts.length === 0 && (
        <div className="no-results">
          {search || selectedManufacturer || selectedCategory
            ? "لا توجد منتجات مطابقة للفلاتر."
            : "لا توجد منتجات متاحة حاليًا."}
        </div>
      )}

      {/* عرض المزيد */}

      {visibleCount < filteredProducts.length && (
        <div className="morewrap">
          <button onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}>
            عرض المزيد
          </button>
        </div>
      )}
    </div>
  );
}
