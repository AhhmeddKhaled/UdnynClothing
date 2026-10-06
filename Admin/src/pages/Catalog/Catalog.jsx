import "./Catalog.css";

import { useEffect, useRef, useState } from "react";

import { authFetch } from "../Login/auth.js";

const API_URL = import.meta.env.VITE_API_URL;

function getImageUrl(imagePath) {
  if (!imagePath) {
    return "";
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return `${API_URL}${imagePath}`;
}

export default function Catalog() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // ======================================================
  // Load Catalog
  // ======================================================

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      console.log("Catalog: fetching...");

      const response = await fetch(`${API_URL}/api/catalog`);

      console.log(
        "Catalog response:",
        response.status,
        response.statusText
      );

      const data = await response.json();

      console.log("Catalog data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load catalog");
      }

      if (!Array.isArray(data.products)) {
        throw new Error("Unexpected catalog data");
      }

      setProducts(data.products);
    } catch (error) {
      console.error("Catalog loading error:", error);

      setError(error.message || "Failed to load catalog");
    } finally {
      console.log("Catalog: loading finished");

      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // ======================================================
  // Image Select
  // ======================================================

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("الصورة لازم تكون JPG أو PNG أو WEBP");

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("حجم الصورة لازم يكون أقل من 5MB");

      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  // ======================================================
  // Reset Form
  // ======================================================

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setManufacturer("");
    setIsFeatured(false);
    setSortOrder("0");

    setImageFile(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // ======================================================
  // Close Form
  // ======================================================

  function closeForm() {
    if (saving) {
      return;
    }

    resetForm();
    setError("");
    setShowForm(false);
  }

  // ======================================================
  // Create Product
  // ======================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ----------------------------------------
    // Validation
    // ----------------------------------------

    if (!name.trim()) {
      setError("اسم المنتج مطلوب");
      return;
    }

    if (!category.trim()) {
      setError("التصنيف مطلوب");
      return;
    }

    if (price === "" || price === null || price === undefined) {
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

    // ----------------------------------------
    // FormData
    // ----------------------------------------

    const formData = new FormData();

    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", String(numericPrice));
    formData.append("category", category.trim());
    formData.append("manufacturer", manufacturer.trim());
    formData.append("isFeatured", String(isFeatured));
    formData.append("sortOrder", String(Number(sortOrder) || 0));
    formData.append("image", imageFile);

    // ----------------------------------------
    // Send Request
    // ----------------------------------------

    try {
      setSaving(true);

      const response = await authFetch("/api/catalog", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create product");
      }

      setSuccess("تم إضافة المنتج بنجاح");

      if (data.product) {
        setProducts((current) => [data.product, ...current]);
      } else {
        await loadProducts();
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Create catalog product error:", error);

      setError(error.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  }

  // ======================================================
  // Delete Product
  // ======================================================

  async function handleDelete(productId) {
    const confirmed = window.confirm("هل أنت متأكد إنك عايز تحذف المنتج؟");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await authFetch(`/api/catalog/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product");
      }

      setProducts((current) =>
        current.filter((product) => product._id !== productId)
      );

      setSuccess("تم حذف المنتج بنجاح");
    } catch (error) {
      console.error("Delete catalog product error:", error);

      setError(error.message || "Failed to delete product");
    }
  }

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="catalog">
        <div className="catalog-state">Loading catalog...</div>
      </div>
    );
  }

  // ======================================================
  // Render
  // ======================================================

  return (
    <div className="catalog">
      {/* ==================================================
          Header
      ================================================== */}

      <div className="catalog-header">
        <div className="catalog-header-content">
          <h1>Catalog</h1>

          <p>Manage products displayed in your store</p>
        </div>

        <button
          type="button"
          className="catalog-add-button"
          onClick={() => {
            setError("");
            setSuccess("");

            setShowForm((current) => !current);
          }}
        >
          {showForm ? "Close" : "+ Add Product"}
        </button>
      </div>

      {/* ==================================================
          Messages
      ================================================== */}

      {error && (
        <div className="catalog-message catalog-message-error">
          {error}
        </div>
      )}

      {success && (
        <div className="catalog-message catalog-message-success">
          {success}
        </div>
      )}

      {/* ==================================================
          Add Product
      ================================================== */}

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
              {/* Name */}

              <div className="catalog-field">
                <label htmlFor="catalog-name">Product name</label>

                <input
                  id="catalog-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Product name"
                />
              </div>

              {/* Price */}

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
                />
              </div>

              {/* Category */}

              <div className="catalog-field">
                <label htmlFor="catalog-category">Category</label>

                <input
                  id="catalog-category"
                  type="text"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="Category"
                />
              </div>

              {/* Manufacturer */}

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

              {/* Sort Order */}

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

              {/* Featured */}

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

            {/* Description */}

            <div className="catalog-field">
              <label htmlFor="catalog-description">
                Description
              </label>

              <textarea
                id="catalog-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Product description"
                rows={4}
              />
            </div>

            {/* Image */}

            <div className="catalog-field">
              <label>Product image</label>

              <div className="catalog-image-upload">
                {imagePreview ? (
                  <div className="catalog-image-preview">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                    />

                    <button
                      type="button"
                      className="catalog-image-remove"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");

                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="catalog-image"
                    className="catalog-image-picker"
                  >
                    <span>Choose product image</span>

                    <small>
                      JPG, PNG or WEBP — max 5MB
                    </small>
                  </label>
                )}

                <input
                  ref={fileInputRef}
                  id="catalog-image"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
              </div>
            </div>

            {/* Submit */}

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

      {/* ==================================================
          Products
      ================================================== */}

      <section className="catalog-card">
        <div className="catalog-card-header">
          <div>
            <h2>Products</h2>

            <p>
              {products.length.toLocaleString("en-US")} products in
              catalog
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="catalog-empty">
            No catalog products found.
          </div>
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
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="catalog-product-image">
                        {product.imagePath ? (
                          <img
                            src={getImageUrl(product.imagePath)}
                            alt={product.name}
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
                      {Number(product.price || 0).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
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
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}