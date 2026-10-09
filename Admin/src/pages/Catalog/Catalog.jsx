
import "./Catalog.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { authFetch } from "../Login/auth.js";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function getImageUrl(imagePath) {
  if (!imagePath || typeof imagePath !== "string") {
    return "";
  }

  const path = imagePath.trim();

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function readResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getErrorMessage(data, fallback) {
  return (
    data?.message ||
    data?.error ||
    fallback
  );
}

function getProductId(product) {
  return String(product?._id ?? product?.id ?? "");
}

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");

  const loadProducts = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    setError("");

    try {
      // Use the same authenticated request helper as create/delete.
      const response = await authFetch("/api/catalog", {
        method: "GET",
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "فشل تحميل منتجات الكتالوج")
        );
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : Array.isArray(data.data)
            ? data.data
            : null;

      if (!list) {
        console.error("Unexpected catalog response:", data);
        throw new Error(
          "استجابة الكتالوج غير متوقعة. راجع شكل البيانات من السيرفر."
        );
      }

      setProducts(list);
      return list;
    } catch (err) {
      console.error("Catalog loading error:", err);
      setError(err.message || "فشل تحميل منتجات الكتالوج");
      throw err;
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadProducts().catch(() => {});
  }, [loadProducts]);

  // Revoke the previous preview URL to avoid leaking browser memory.
  function clearImagePreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setImagePreview("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("الصورة لازم تكون JPG أو PNG أو WEBP");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("حجم الصورة لازم يكون أقل من 5 ميجابايت");
      event.target.value = "";
      return;
    }

    clearImagePreview();

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setImagePreview(previewUrl);
  }

  function removeSelectedImage() {
    clearImagePreview();
    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setManufacturer("");
    setIsFeatured(false);
    setSortOrder("0");
    removeSelectedImage();
  }

  function closeForm() {
    if (saving) {
      return;
    }

    resetForm();
    setError("");
    setShowForm(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedCategory = category.trim();

    if (!trimmedName) {
      setError("اسم المنتج مطلوب");
      return;
    }

    if (!trimmedCategory) {
      setError("التصنيف مطلوب");
      return;
    }

    if (price.trim() === "") {
      setError("السعر مطلوب");
      return;
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("السعر غير صحيح");
      return;
    }

    if (!imageFile) {
      setError("لازم تختار صورة للمنتج");
      return;
    }

    const numericSortOrder = Number(sortOrder);

    if (!Number.isFinite(numericSortOrder)) {
      setError("ترتيب المنتج غير صحيح");
      return;
    }

    const formData = new FormData();

    formData.append("name", trimmedName);
    formData.append("description", description.trim());
    formData.append("price", String(numericPrice));
    formData.append("category", trimmedCategory);
    formData.append("manufacturer", manufacturer.trim());
    formData.append("isFeatured", String(isFeatured));
    formData.append("sortOrder", String(numericSortOrder));
    formData.append("image", imageFile);

    setSaving(true);

    try {
      const response = await authFetch("/api/catalog", {
        method: "POST",
        body: formData,
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "فشل إضافة المنتج")
        );
      }

      // Reload the authoritative list from the server.
      // This avoids depending on whether POST returns data.product.
      try {
        await loadProducts(false);
      } catch (refreshError) {
        // The POST succeeded, so don't report creation as failed
        // just because the follow-up list refresh failed.
        console.error(
          "Product created, but catalog refresh failed:",
          refreshError
        );
      }

      resetForm();
      setShowForm(false);
      setError("");
      setSuccess(data.message || "تم إضافة المنتج بنجاح");
    } catch (err) {
      console.error("Create catalog product error:", err);
      setError(err.message || "فشل إضافة المنتج");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    const productId = getProductId(product);

    if (!productId) {
      setError("رقم المنتج غير موجود، لا يمكن حذفه");
      return;
    }

    if (deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `هل أنت متأكد إنك عايز تحذف المنتج "${product.name || productId}"؟`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(productId);

    try {
      const response = await authFetch(
        `/api/catalog/${encodeURIComponent(productId)}`,
        {
          method: "DELETE",
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "فشل حذف المنتج")
        );
      }

      // Compare IDs as strings to avoid number/string mismatches.
      setProducts((current) =>
        current.filter(
          (item) => getProductId(item) !== productId
        )
      );

      setSuccess(data.message || "تم حذف المنتج بنجاح");
    } catch (err) {
      console.error("Delete catalog product error:", err);
      setError(err.message || "فشل حذف المنتج");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="catalog">
        <div className="catalog-state">Loading catalog...</div>
      </div>
    );
  }

  return (
    <div className="catalog">
      <div className="catalog-header">
        <div className="catalog-header-content">
          <h1>Catalog</h1>
          <p>Manage products displayed in your store</p>
        </div>

        <button
          type="button"
          className="catalog-add-button"
          disabled={saving}
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm((current) => !current);
          }}
        >
          {showForm ? "Close" : "+ Add Product"}
        </button>
      </div>

      {error && (
        <div className="catalog-message catalog-message-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="catalog-message catalog-message-success" role="status">
          {success}
        </div>
      )}

      {showForm && (
        <section className="catalog-card">
          <div className="catalog-card-header">
            <div>
              <h2>Add Product</h2>
              <p>Create a new product for the store catalog</p>
            </div>
          </div>

          <form className="catalog-form" onSubmit={handleSubmit}>
            <div className="catalog-form-grid">
              <div className="catalog-field">
                <label htmlFor="catalog-name">Product name</label>
                <input
                  id="catalog-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Product name"
                  required
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="catalog-price">Price</label>
                <input
                  id="catalog-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="catalog-category">Category</label>
                <input
                  id="catalog-category"
                  type="text"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="Category"
                  required
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="catalog-manufacturer">
                  Manufacturer
                </label>
                <input
                  id="catalog-manufacturer"
                  type="text"
                  value={manufacturer}
                  onChange={(event) => setManufacturer(event.target.value)}
                  placeholder="Manufacturer"
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="catalog-sort">Sort order</label>
                <input
                  id="catalog-sort"
                  type="number"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="catalog-field catalog-field-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(event) =>
                      setIsFeatured(event.target.checked)
                    }
                  />
                  <span>Featured product</span>
                </label>
              </div>
            </div>

            <div className="catalog-field">
              <label htmlFor="catalog-description">Description</label>
              <textarea
                id="catalog-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Product description"
                rows={4}
              />
            </div>

            <div className="catalog-field">
              <label htmlFor="catalog-image">Product image</label>

              <div className="catalog-image-upload">
                {imagePreview && (
                  <div className="catalog-image-preview">
                    <img src={imagePreview} alt="Product preview" />

                    <button
                      type="button"
                      className="catalog-image-remove"
                      onClick={removeSelectedImage}
                    >
                      Remove image
                    </button>
                  </div>
                )}

                <label
                  htmlFor="catalog-image"
                  className="catalog-image-picker"
                >
                  <span>
                    {imagePreview
                      ? "Choose another image"
                      : "Choose product image"}
                  </span>
                  <small>JPG, PNG or WEBP — max 5MB</small>
                </label>

                <input
                  ref={fileInputRef}
                  id="catalog-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
              </div>
            </div>

            <div className="catalog-form-actions">
              <button
                type="submit"
                className="catalog-primary-button"
                disabled={saving}
              >
                {saving ? "Creating..." : "Add Product"}
              </button>

              <button
                type="button"
                className="catalog-secondary-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="catalog-card">
        <div className="catalog-card-header">
          <div>
            <h2>Products</h2>
            <p>
              {products.length.toLocaleString("en-US")} products in catalog
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="catalog-empty">No catalog products found.</div>
        ) : (
          <div className="catalog-table-wrap">
            <table className="catalog-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  <th>Price</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const productId = getProductId(product);
                  const imagePath =
                    product.imagePath ?? product.image ?? "";

                  return (
                    <tr key={productId || product.name}>
                      <td>
                        <div className="catalog-product-image">
                          {imagePath ? (
                            <img
                              src={getImageUrl(imagePath)}
                              alt={product.name || "Product"}
                            />
                          ) : (
                            <span>No image</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="catalog-product-name">
                          {product.name}
                        </div>

                        {product.description && (
                          <div className="catalog-product-description">
                            {product.description}
                          </div>
                        )}
                      </td>

                      <td>{product.category || "—"}</td>
                      <td>{product.manufacturer || "—"}</td>

                      <td>
                        {Number(product.price || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td>
                        {product.isFeatured ? (
                          <span className="catalog-badge catalog-badge-featured">
                            Featured
                          </span>
                        ) : (
                          <span className="catalog-muted">No</span>
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="catalog-delete-button"
                          disabled={
                            deletingId !== null || !productId
                          }
                          onClick={() => handleDelete(product)}
                        >
                          {deletingId === productId
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}