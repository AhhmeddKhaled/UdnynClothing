import "./Catalog.css";

import { useEffect, useState } from "react";
import { authFetch } from "../Login/auth.js";

export default function Catalog() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    manufacturer: "",
    isFeatured: false,
    sortOrder: 0,
  });

  const [saving, setSaving] = useState(false);

  // ======================================================
  // Get Catalog Products
  // ======================================================

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await authFetch("/api/catalog");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load catalog");
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Catalog error:", error);

      setError(error.message || "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // ======================================================
  // Form Change
  // ======================================================

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // ======================================================
  // Create Product
  // ======================================================

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await authFetch("/api/catalog", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          sortOrder: Number(form.sortOrder),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create product");
      }

      setProducts((prev) => [data.product, ...prev]);

      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        manufacturer: "",
        isFeatured: false,
        sortOrder: 0,
      });

      setShowForm(false);
    } catch (error) {
      console.error("Create catalog product error:", error);

      setError(error.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  }

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="catalog-page">
        <div className="catalog-loading">
          <h1 className="catalog-title">Catalog</h1>

          <p className="catalog-loading-text">Loading products...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // Page
  // ======================================================

  return (
    <div className="catalog-page">
      {/* ==================================================
          Header
      ================================================== */}

      <div className="catalog-header">
        <h1 className="catalog-title">Catalog</h1>

        <button
          type="button"
          className="catalog-add-btn"
          onClick={() => {
            setShowForm((prev) => !prev);
            setError("");
          }}
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {/* ==================================================
          Error
      ================================================== */}

      {error && <div className="catalog-error">{error}</div>}

      {/* ==================================================
          Add Product Form
      ================================================== */}

      {showForm && (
        <form className="catalog-form" onSubmit={handleSubmit}>
          <h2 className="catalog-form-title">Add New Product</h2>

          <div className="catalog-form-group">
            <label htmlFor="product-name">Product Name</label>

            <input
              id="product-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="catalog-form-group">
            <label htmlFor="product-description">Description</label>

            <textarea
              id="product-description"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="catalog-form-group">
            <label htmlFor="product-price">Price</label>

            <input
              id="product-price"
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="catalog-form-group">
            <label htmlFor="product-category">Category</label>

            <input
              id="product-category"
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="catalog-form-group">
            <label htmlFor="product-manufacturer">Manufacturer</label>

            <input
              id="product-manufacturer"
              type="text"
              name="manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
            />
          </div>

          <div className="catalog-form-group">
            <label htmlFor="product-order">Product Order</label>

            <input
              id="product-order"
              type="number"
              name="sortOrder"
              value={form.sortOrder}
              onChange={handleChange}
              min="0"
            />
          </div>

          <label className="catalog-checkbox">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
            />

            <span>Featured Product</span>
          </label>

          <button type="submit" className="catalog-save-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Product"}
          </button>
        </form>
      )}

      {/* ==================================================
          Products
      ================================================== */}

      {products.length === 0 ? (
        <div className="catalog-empty">No products in the catalog yet.</div>
      ) : (
        <div className="catalog-table-wrapper">
          <table className="catalog-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Manufacturer</th>
                <th>Price</th>
                <th>Order</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="catalog-table-product">
                    <span className="catalog-table-product-name">
                      {product.name}
                    </span>

                    {product.description && (
                      <span className="catalog-table-product-description">
                        {product.description}
                      </span>
                    )}
                  </td>

                  <td>{product.category}</td>

                  <td>{product.manufacturer || "—"}</td>

                  <td className="catalog-table-price">{product.price}</td>

                  <td>{product.sortOrder}</td>

                  <td>
                    {product.isFeatured ? (
                      <span className="catalog-featured">Featured</span>
                    ) : (
                      <span className="catalog-status">Standard</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
