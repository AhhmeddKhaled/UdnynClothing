import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./AvailableStock.css";

import { authFetch } from "../Login/auth.js";

import { useLoading } from "../../context/LoadingContext/LoadingContext.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function AvailableStock() {
  const {
    startLoading,
    stopLoading,
  } = useLoading();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("");
  const [manufacturerFilter, setManufacturerFilter] =
    useState("");

  const [importing, setImporting] =
    useState(false);

  const [imageUploadingFor, setImageUploadingFor] =
    useState(null);

  const fileInputRefs = useRef({});

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const canManageImages = [
    "admin",
    "owner",
  ].includes(currentUser?.role);

  const canImport = [
    "admin",
    "owner",
  ].includes(currentUser?.role);

  async function fetchProducts() {
    setLoading(true);
    startLoading();

    try {
      const response = await authFetch(
        "/api/availableStock"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "فشل تحميل البضاعة المتاحة"
        );
      }

      setProducts(
        Array.isArray(data)
          ? data
          : data.products || []
      );
    } catch (error) {
      console.error(
        "Available Stock fetch error:",
        error
      );

      setProducts([]);

      alert(
        error.message ||
          "فشل تحميل البضاعة المتاحة"
      );
    } finally {
      setLoading(false);
      stopLoading();
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      String(a).localeCompare(
        String(b),
        "ar"
      )
    );
  }, [products]);

  const manufacturers = useMemo(() => {
    return [
      ...new Set(
        products
          .map(
            (product) =>
              product.manufacturer
          )
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      String(a).localeCompare(
        String(b),
        "ar"
      )
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        String(product.itemId || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(product.name || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(product.manufacturer || "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        !categoryFilter ||
        product.category === categoryFilter;

      const matchesManufacturer =
        !manufacturerFilter ||
        product.manufacturer ===
          manufacturerFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesManufacturer
      );
    });
  }, [
    products,
    search,
    categoryFilter,
    manufacturerFilter,
  ]);

  function getImageUrl(imagePath) {
    if (!imagePath) {
      return null;
    }

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    return `${API_URL}${imagePath}`;
  }

  function openImagePicker(itemId) {
    const input =
      fileInputRefs.current[itemId];

    if (input) {
      input.click();
    }
  }

  async function handleImageUpload(
    event,
    product
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      ![
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      alert(
        "من فضلك اختر صورة بصيغة JPG أو PNG أو WEBP"
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "حجم الصورة يجب ألا يتجاوز 5 ميجابايت"
      );
      return;
    }

    setImageUploadingFor(product.itemId);
    startLoading();

    try {
      const formData = new FormData();

      formData.append("image", file);

      const response = await authFetch(
        `/api/availableStock/${product.itemId}/image`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "فشل رفع الصورة"
        );
      }

      const newImagePath =
        data.imagePath ||
        data.product?.imagePath;

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.itemId === product.itemId
            ? {
                ...item,
                imagePath:
                  newImagePath ||
                  item.imagePath,
              }
            : item
        )
      );

      alert("تم حفظ صورة المنتج بنجاح");
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      alert(
        error.message ||
          "حدث خطأ أثناء رفع الصورة"
      );
    } finally {
      setImageUploadingFor(null);
      stopLoading();
    }
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setImporting(true);
    startLoading();

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await authFetch(
        "/api/availableStock/import",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "فشل استيراد ملف المنتجات"
        );
      }

      await fetchProducts();

      alert(
        data.message ||
          "تم استيراد المنتجات بنجاح"
      );
    } catch (error) {
      console.error(
        "Excel import error:",
        error
      );

      alert(
        error.message ||
          "حدث خطأ أثناء استيراد الملف"
      );
    } finally {
      setImporting(false);
      stopLoading();
    }
  }

  return (
    <main
      className="page available-stock-page"
      dir="rtl"
    >
      <section className="ds-page-head">
        <div>
          <h1 className="ds-page-title">
            البضاعة المتاحة
          </h1>

          <p className="ds-page-sub">
            إدارة المنتجات والكميات المتاحة
          </p>
        </div>
      </section>

      <section className="card available-stock-toolbar">
        <div className="available-stock-filters">
          <div className="field-group">
            <label className="field-label">
              البحث
            </label>

            <input
              className="field"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="رقم المنتج أو الاسم..."
            />
          </div>

          <div className="field-group">
            <label className="field-label">
              التصنيف
            </label>

            <select
              className="field"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
            >
              <option value="">
                كل التصنيفات
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">
              المصنع
            </label>

            <select
              className="field"
              value={manufacturerFilter}
              onChange={(event) =>
                setManufacturerFilter(
                  event.target.value
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
                    {manufacturer}
                  </option>
                )
              )}
            </select>
          </div>

          {canImport && (
            <div className="field-group">
              <label className="field-label">
                استيراد المنتجات
              </label>

              <label
                className="btn btn-primary"
                style={{
                  cursor: importing
                    ? "not-allowed"
                    : "pointer",
                  opacity: importing
                    ? 0.6
                    : 1,
                }}
              >
                {importing
                  ? "جاري الاستيراد..."
                  : "استيراد Excel"}

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

      <section className="card">
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

                {canManageImages && (
                  <th>إدارة الصورة</th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? null : filteredProducts.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={
                      canManageImages
                        ? 11
                        : 10
                    }
                  >
                    <div className="state">
                      لا توجد منتجات
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(
                  (product) => {
                    const imageUrl =
                      getImageUrl(
                        product.imagePath
                      );

                    const isUploading =
                      imageUploadingFor ===
                      product.itemId;

                    return (
                      <tr
                        key={
                          product.itemId
                        }
                      >
                        <td>
                          <div className="available-stock-image">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={
                                  product.name ||
                                  `Product ${product.itemId}`
                                }
                              />
                            ) : (
                              <span>
                                لا توجد صورة
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <strong>
                            {
                              product.itemId
                            }
                          </strong>
                        </td>

                        <td>
                          {product.name ||
                            "-"}
                        </td>

                        <td>
                          {product.qty ?? 0}
                        </td>

                        <td>
                          {product.purchasePrice ??
                            0}
                        </td>

                        <td>
                          {product.wholesalePrice ??
                            0}
                        </td>

                        <td>
                          {product.retailPrice ??
                            0}
                        </td>

                        <td>
                          {product.offerPrice ??
                            0}
                        </td>

                        <td>
                          {product.category ||
                            "-"}
                        </td>

                        <td>
                          {product.manufacturer ||
                            "-"}
                        </td>

                        {canManageImages && (
                          <td>
                            <input
                              ref={(element) => {
                                fileInputRefs.current[
                                  product.itemId
                                ] =
                                  element;
                              }}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              hidden
                              onChange={(
                                event
                              ) =>
                                handleImageUpload(
                                  event,
                                  product
                                )
                              }
                            />

                            <button
                              type="button"
                              className="btn btn-secondary"
                              disabled={
                                isUploading
                              }
                              onClick={() =>
                                openImagePicker(
                                  product.itemId
                                )
                              }
                            >
                              {isUploading
                                ? "جاري الرفع..."
                                : product.imagePath
                                ? "تغيير الصورة"
                                : "إضافة صورة"}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}