import React, { useEffect, useMemo, useState } from "react";
import "./Catalog.css";

// ======================================================
// رابط السيرفر
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

      const response = await fetch(
        `${API_URL}/api/availableStock`
      );

      if (!response.ok) {
        throw new Error("فشل تحميل المنتجات");
      }

      const data = await response.json();

      // السيرفر يرجع:
      // {
      //   success: true,
      //   products: [...]
      // }

      const productList = Array.isArray(data)
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
        "Load products error:",
        err
      );

      setError(
        "تعذر تحميل المنتجات حاليًا"
      );
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
    ].sort((a, b) =>
      a.localeCompare(b, "ar")
    );
  }, [products]);

  // ==========================================
  // قائمة التصنيفات
  // ==========================================

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
    ].sort((a, b) =>
      a.localeCompare(b, "ar")
    );
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
        String(
          product.manufacturer || ""
        ).trim() !== selectedManufacturer
      ) {
        return false;
      }

      // فلتر التصنيف
      if (
        selectedCategory &&
        String(
          product.category || ""
        ).trim() !== selectedCategory
      ) {
        return false;
      }

      // البحث
      if (!value) {
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

      const manufacturer = String(
        product.manufacturer || ""
      ).toLowerCase();

      const category = String(
        product.category || ""
      ).toLowerCase();

      return (
        name.includes(value) ||
        itemId.includes(value) ||
        barcode.includes(value) ||
        manufacturer.includes(value) ||
        category.includes(value)
      );
    });
  }, [
    products,
    search,
    selectedManufacturer,
    selectedCategory,
  ]);

  // ==========================================
  // المنتجات الظاهرة
  // ==========================================

  const visibleProducts =
    filteredProducts.slice(
      0,
      visibleCount
    );

  // ==========================================
  // عند تغيير الفلاتر نرجع لأول المنتجات
  // ==========================================

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    search,
    selectedManufacturer,
    selectedCategory,
  ]);

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
    return (
      <div className="products-loading">
        جاري تحميل المنتجات...
      </div>
    );
  }

  // ==========================================
  // Error
  // ==========================================

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
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {/* المصنع */}

        <select
          value={selectedManufacturer}
          onChange={(e) =>
            setSelectedManufacturer(
              e.target.value
            )
          }
        >
          <option value="">
            كل المصانع
          </option>

          {manufacturers.map(
            (manufacturer) => (
              <option
                key={manufacturer}
                value={manufacturer}
              >
                {manufa