
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./AvailableStock.css";
import { authFetch } from "../Login/auth.js";
import { useLoading } from "../../context/LoadingContext/LoadingContext.jsx";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function AvailableStock() {
  const { startLoading, stopLoading } = useLoading();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState("");
  const [importing, setImporting] = useState(false);
  const [imageUploadingFor, setImageUploadingFor] = useState(null);

  const fileInputRefs = useRef({});

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const canManageImages = ["admin", "owner"].includes(currentUser?.role);
  const canImport = ["admin", "owner"].includes(currentUser?.role);

  async function fetchProducts() {
    setLoading(true);
    startLoading();

    try {
      const response = await authFetch("/api/availableStock");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل تحميل البضاعة المتاحة");
      }

      setProducts(
        Array.isArray(data)
          ? data
          : Array.isArray(data.products)
            ? data.products
            : []
      );
    } catch (error) {
      console.error("Available Stock fetch error:", error);
      setProducts([]);
      alert(error.message || "فشل تحميل البضاعة المتاحة");
    } finally {
      setLoading(false);
      stopLoading();
    }
  }

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(
    () =>
      [
        ...new Set(
          products.map((product) => product.category).filter(Boolean)
        ),
      ].sort((a, b) => String(a).localeCompare(String(b), "ar")),
    [products]
  );

  const manufacturers = useMemo(
    () =>
      [
        ...new Set(
          products.map((product) => product.manufacturer).filter(Boolean)
        ),
      ].sort((a, b) => String(a).localeCompare(String(b), "ar")),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        String(product.itemId ?? "").toLowerCase().includes(normalizedSearch) ||
        String(product.name ?? "").toLowerCase().includes(normalizedSearch) ||
        String(product.manufacturer ?? "").toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        !categoryFilter || product.category === categoryFilter;

      const matchesManufacturer =
        !manufacturerFilter || product.manufacturer === manufacturerFilter;

      return matchesSearch && matchesCategory && matchesManufacturer;
    });
  }, [products, search, categoryFilter, manufacturerFilter]);

  function getImageUrl(imagePath) {
    if (!imagePath || typeof imagePath !== "string") return null;

    const path = imagePath.trim();

    if (/^https?:\/\//i.test(path)) return path;

    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  function openImagePicker(itemId, view) {
    fileInputRefs.current[`${String(itemId)}-${view}`]?.click();
  }

  async function handleImageUpload(event, product) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      alert("من فضلك اختر صورة بصيغة JPG أو PNG أو WEBP");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("حجم الصورة يجب ألا يتجاوز 5 ميجابايت");
      return;
    }

    if (product.itemId == null || product.itemId === "") {
      alert("رقم المنتج غير موجود");
      return;
    }

    const productId = String(product.itemId);

    setImageUploadingFor(productId);
    startLoading();

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await authFetch(
        `/api/availableStock/${encodeURIComponent(productId)}/image`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "فشل رفع الصورة");
      }

      const newImagePath =
        data.imagePath ??
        data.product?.imagePath ??
        data.product?.image ??
        data.image;

      if (!newImagePath) {
        throw new Error(
          "السيرفر لم يرجع مسار الصورة المحفوظة. راجع Route رفع الصور."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          String(item.itemId) === productId
            ? { ...item, imagePath: newImagePath }
            : item
        )
      );

      alert("تم حفظ صورة المنتج بنجاح");
    } catch (error) {
      console.error("Image upload error:", error);
      alert(error.message || "حدث خطأ أثناء رفع الصورة");
    } finally {
      setImageUploadingFor(null);
      stopLoading();
    }
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setImporting(true);
    startLoading();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await authFetch("/api/availableStock/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "فشل استيراد ملف المنتجات");
      }

      await fetchProducts();
      alert(data.message || "تم استيراد المنتجات بنجاح");
    } catch (error) {
      console.error("Excel import error:", error);
      alert(error.message || "حدث خطأ أثناء استيراد الملف");
    } finally {
      setImporting(false);
      stopLoading();
    }
  }

  function renderImageControls(product, view) {
    const productId = String(product.itemId);
    const isUploading = imageUploadingFor === productId;
    const hasImage = Boolean(product.imagePath ?? product.image);

    return (
      <div className={`available-stock-image-actions available-stock-image-actions--${view}`}>
        <input
          ref={(element) => {
            fileInputRefs.current[`${productId}-${view}`] = element;
          }}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          disabled={isUploading}
          onChange={(event) => handleImageUpload(event, product)}
        />

        <button
          type="button"
          className="btn btn-secondary available-stock-image-button"
          disabled={isUploading}
          onClick={() => openImagePicker(product.itemId, view)}
        >
          {isUploading
            ? "جاري الرفع..."
            : hasImage
              ? "تغيير الصورة"
              : "إضافة صورة"}
        </button>
      </div>
    );
  }

  function renderProductImage(product) {
    const imageUrl = getImageUrl(product.imagePath ?? product.image);

    return (
      <div className="available-stock-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name || `Product ${product.itemId}`}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />
        ) : (
          <span>لا توجد صورة</span>
        )}
      </div>
    );
  }

  function renderProductDetails(product) {
    return (
      <>
        <div className="available-stock-card__field">
          <span>الكمية</span>
          <strong>{product.qty ?? 0}</strong>
        </div>
        <div className="available-stock-card__field">
          <span>سعر الشراء</span>
          <strong>{product.purchasePrice ?? 0}</strong>
        </div>
        <div className="available-stock-card__field">
          <span>سعر الجملة</span>
          <strong>{product.wholesalePrice ?? 0}</strong>
        </div>
        <div className="available-stock-card__field">
          <span>سعر التجزئة</span>
          <strong>{product.retailPrice ?? 0}</strong>
        </div>
        <div className="available-stock-card__field">
          <span>سعر العرض</span>
          <strong>{product.offerPrice ?? 0}</strong>
        </div>
        <div className="available-stock-card__field">
          <span>التصنيف</span>
          <strong>{product.category || "-"}</strong>
        </div>
        <div className="available-stock-card__field">
          <span>الشركة المصنعة</span>
          <strong>{product.manufacturer || "-"}</strong>
        </div>
      </>
    );
  }

  return (
    <main className="page available-stock-page" dir="rtl">
      <section className="ds-page-head">
        <div>
          <h1 className="ds-page-title">البضاعة المتاحة</h1>
          <p className="ds-page-sub">إدارة المنتجات والكميات المتاحة</p>
        </div>
      </section>

      <section className="card available-stock-toolbar">
        <div className="available-stock-filters">
          <div className="field-group">
            <label className="field-label" htmlFor="stock-search">
              البحث
            </label>
            <input
              id="stock-search"
              className="field"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="رقم المنتج أو الاسم..."
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="stock-category">
              التصنيف
            </label>
            <select
              id="stock-category"
              className="field"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="">كل التصنيفات</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="stock-manufacturer">
              المصنع
            </label>
            <select
              id="stock-manufacturer"
              className="field"
              value={manufacturerFilter}
              onChange={(event) => setManufacturerFilter(event.target.value)}
            >
              <option value="">كل المصانع</option>
              {manufacturers.map((manufacturer) => (
                <option key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </option>
              ))}
            </select>
          </div>

          {canImport && (
            <div className="field-group">
              <label className="field-label">استيراد المنتجات</label>
              <label
                className="btn btn-primary"
                style={{
                  cursor: importing ? "not-allowed" : "pointer",
                  opacity: importing ? 0.6 : 1,
                }}
              >
                {importing ? "جاري الاستيراد..." : "استيراد Excel"}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  disabled={importing}
                  hidden
                />
              </label>
            </div>
          )}
        </div>
      </section>

      <section className="card available-stock-table-section">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>الصورة</th>
                <th>رقم المنتج</th>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>سعر الشراء</th>
                <th>سعر الجملة</th>
                <th>سعر التجزئة</th>
                <th>سعر العرض</th>
                <th>التصنيف</th>
                <th>الشركة المصنعة</th>
                {canManageImages && <th>إدارة الصورة</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={canManageImages ? 11 : 10}>
                    <div className="state">جاري تحميل المنتجات...</div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={canManageImages ? 11 : 10}>
                    <div className="state">لا توجد منتجات</div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.itemId}>
                    <td>{renderProductImage(product)}</td>
                    <td><strong>{product.itemId}</strong></td>
                    <td>{product.name || "-"}</td>
                    <td>{product.qty ?? 0}</td>
                    <td>{product.purchasePrice ?? 0}</td>
                    <td>{product.wholesalePrice ?? 0}</td>
                    <td>{product.retailPrice ?? 0}</td>
                    <td>{product.offerPrice ?? 0}</td>
                    <td>{product.category || "-"}</td>
                    <td>{product.manufacturer || "-"}</td>
                    {canManageImages && (
                      <td>{renderImageControls(product, "desktop")}</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="available-stock-cards" aria-label="المنتجات">
        {loading ? (
          <div className="state">جاري تحميل المنتجات...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="state">لا توجد منتجات</div>
        ) : (
          filteredProducts.map((product) => (
            <article
              className="available-stock-card"
              key={`mobile-${product.itemId}`}
            >
              <div className="available-stock-card__header">
                {renderProductImage(product)}
                <div className="available-stock-card__identity">
                  <h2>{product.name || "منتج بدون اسم"}</h2>
                  <p>
                    رقم المنتج: <strong>{product.itemId}</strong>
                  </p>
                  <p>
                    الكمية: <strong>{product.qty ?? 0}</strong>
                  </p>
                </div>
              </div>

              <div className="available-stock-card__details">
                {renderProductDetails(product)}
              </div>

              {canManageImages && (
                <div className="available-stock-card__actions">
                  {renderImageControls(product, "mobile")}
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  );
}