import React, { useEffect, useMemo, useState } from "react";
import "./AvailableStock.css";
import { authFetch } from "../Login/auth.js";

const AvailableStock = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showImportForm, setShowImportForm] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // =========================================
  // Filters
  // =========================================

  const [productSearch, setProductSearch] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] =
    useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("");

  // =========================================
  // Fetch Products
  // =========================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authFetch(
        "/api/availableStock"
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Invalid response from server"
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load products"
        );
      }

      setProducts(data.products || []);
    } catch (err) {
      console.error(
        "Fetch products error:",
        err
      );

      setError(
        err.message ||
          "An error occurred while loading products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================
  // Unique Manufacturers
  // =========================================

  const manufacturers = useMemo(() => {
    const values = products
      .map((product) => product.manufacturer)
      .filter(
        (value) =>
          value !== null &&
          value !== undefined
      )
      .map((value) => String(value).trim())
      .filter(Boolean);

    return [...new Set(values)].sort((a, b) =>
      a.localeCompare(b, "ar")
    );
  }, [products]);

  // =========================================
  // Unique Categories
  // =========================================

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category)
      .filter(
        (value) =>
          value !== null &&
          value !== undefined
      )
      .map((value) => String(value).trim())
      .filter(Boolean);

    return [...new Set(values)].sort((a, b) =>
      a.localeCompare(b, "ar")
    );
  }, [products]);

  // =========================================
  // Filter Products
  // =========================================

  const filteredProducts = useMemo(() => {
    const search = productSearch
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const productName = String(
        product.name || ""
      ).toLowerCase();

      const manufacturer = String(
        product.manufacturer || ""
      ).trim();

      const category = String(
        product.category || ""
      ).trim();

      const matchesName =
        !search ||
        productName.includes(search);

      const matchesManufacturer =
        !selectedManufacturer ||
        manufacturer === selectedManufacturer;

      const matchesCategory =
        !selectedCategory ||
        category === selectedCategory;

      return (
        matchesName &&
        matchesManufacturer &&
        matchesCategory
      );
    });
  }, [
    products,
    productSearch,
    selectedManufacturer,
    selectedCategory,
  ]);

  // =========================================
  // Clear Filters
  // =========================================

  const clearFilters = () => {
    setProductSearch("");
    setSelectedManufacturer("");
    setSelectedCategory("");
  };

  const hasFilters =
    productSearch.trim() ||
    selectedManufacturer ||
    selectedCategory;

  // =========================================
  // File Select
  // =========================================

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
    setSuccess("");
  };

  // =========================================
  // Upload Excel
  // =========================================

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setError(
        "Please select an Excel file first"
      );
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("file", file);

      const response = await authFetch(
        "/api/availableStock/import",
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Invalid response from server"
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update products"
        );
      }

      const total = data.total || 0;
      const inserted = data.inserted || 0;
      const updated = data.updated || 0;

      setSuccess(
        `Products updated successfully — Total ${total} — New ${inserted} — Updated ${updated}`
      );

      setFile(null);

      const fileInput =
        document.getElementById(
          "available-stock-file"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      await fetchProducts();

      setShowImportForm(false);
    } catch (err) {
      console.error(
        "Upload error:",
        err
      );

      setError(
        err.message ||
          "An error occurred while uploading the file"
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================================
  // Price Formatter
  // =========================================

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =========================================
  // Render
  // =========================================

  return (
    <div className="available-stock">

      {/* =====================================
          Header
      ====================================== */}

      <div className="available-stock-header">
        <div className="available-stock-title">
          <h1>Available Stock</h1>

          <p>
            View and manage products,
            quantities and prices
          </p>
        </div>

        <button
          type="button"
          className="available-stock-import-button"
          onClick={() => {
            setShowImportForm(
              (prev) => !prev
            );

            setError("");
            setSuccess("");
          }}
        >
          {showImportForm
            ? "Close"
            : "Update Products"}
        </button>
      </div>

      {/* =====================================
          Messages
      ====================================== */}

      {success && (
        <div className="available-stock-success">
          {success}
        </div>
      )}

      {error && (
        <div className="available-stock-error">
          {error}
        </div>
      )}

      {/* =====================================
          Import Panel
      ====================================== */}

      {showImportForm && (
        <div className="available-stock-import-panel">

          <div className="available-stock-import-header">
            <div>
              <h2>Update Products</h2>

              <p>
                Upload an Excel file to update
                inventory data
              </p>
            </div>

            <button
              type="button"
              className="available-stock-close-button"
              onClick={() => {
                setShowImportForm(false);
                setFile(null);
                setError("");
              }}
            >
              Close
            </button>
          </div>

          <form
            className="available-stock-import-form"
            onSubmit={handleUpload}
          >
            <label
              htmlFor="available-stock-file"
              className="available-stock-file-label"
            >
              Choose Excel File
            </label>

            <input
              id="available-stock-file"
              type="file"
              accept=".xlsx,.xls"
              className="available-stock-file-input"
              onChange={handleFileChange}
            />

            {file && (
              <div className="available-stock-selected-file">
                Selected file:
                <strong>
                  {file.name}
                </strong>
              </div>
            )}

            <button
              type="submit"
              className="available-stock-upload-button"
              disabled={
                !file || uploading
              }
            >
              {uploading
                ? "Updating..."
                : "Upload & Update"}
            </button>
          </form>
        </div>
      )}

      {/* =====================================
          Filters
      ====================================== */}

      <div className="available-stock-filters">

        {/* Product Name */}

        <div className="available-stock-filter-field available-stock-search-field">
          <label htmlFor="available-stock-search">
            Product Name
          </label>

          <input
            id="available-stock-search"
            type="text"
            value={productSearch}
            onChange={(event) =>
              setProductSearch(
                event.target.value
              )
            }
            placeholder="Search product name..."
          />
        </div>

        {/* Manufacturer */}

        <div className="available-stock-filter-field">
          <label htmlFor="available-stock-manufacturer">
            Manufacturer
          </label>

          <select
            id="available-stock-manufacturer"
            value={selectedManufacturer}
            onChange={(event) =>
              setSelectedManufacturer(
                event.target.value
              )
            }
          >
            <option value="">
              All Manufacturers
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

        {/* Category */}

        <div className="available-stock-filter-field">
          <label htmlFor="available-stock-category">
            Category
          </label>

          <select
            id="available-stock-category"
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(
                event.target.value
              )
            }
          >
            <option value="">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>
        </div>

        {/* Filter Actions */}

        <div className="available-stock-filter-actions">

          <div className="available-stock-results-count">
            Showing{" "}
            <strong>
              {filteredProducts.length}
            </strong>{" "}
            of{" "}
            <strong>
              {products.length}
            </strong>
          </div>

          <button
            type="button"
            className="available-stock-clear-filters"
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            Clear Filters
          </button>

        </div>
      </div>

      {/* =====================================
          Table
      ====================================== */}

      {loading ? (
        <div className="available-stock-state">
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="available-stock-state">
          {products.length === 0
            ? "No products available"
            : "No products match the current filters"}
        </div>
      ) : (
        <div className="available-stock-table-wrap">

          <table className="available-stock-table">

            <thead>
              <tr>
                <th>Item ID</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Purchase Price</th>
                <th>Wholesale Price</th>
                <th>Retail Price</th>
                <th>Offer Price</th>
                <th>Category</th>
                <th>Manufacturer</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map(
                (product) => (
                  <tr
                    key={product.itemId}
                  >

                    {/* Item ID */}

                    <td>
                      <span className="available-stock-item-id">
                        {product.itemId}
                      </span>
                    </td>

                    {/* Product */}

                    <td>
                      <div className="available-stock-product">

                        <div className="available-stock-image">
                          {product.imagePath ? (
                            <img
                              src={
                                product.imagePath
                              }
                              alt={
                                product.name
                              }
                            />
                          ) : (
                            "No Image"
                          )}
                        </div>

                        <span className="available-stock-product-name">
                          {product.name}
                        </span>

                      </div>
                    </td>

                    {/* Quantity */}

                    <td>
                      <span
                        className={
                          Number(
                            product.qty || 0
                          ) > 0
                            ? "available-stock-qty"
                            : "available-stock-qty available-stock-qty-empty"
                        }
                      >
                        {Number(
                          product.qty || 0
                        ).toLocaleString(
                          "en-US"
                        )}
                      </span>
                    </td>

                    {/* Purchase Price */}

                    <td>
                      <span className="available-stock-price">
                        {formatPrice(
                          product.purchasePrice
                        )}
                      </span>
                    </td>

                    {/* Wholesale Price */}

                    <td>
                      <span className="available-stock-price">
                        {formatPrice(
                          product.wholesalePrice
                        )}
                      </span>
                    </td>

                    {/* Retail Price */}

                    <td>
                      <span className="available-stock-price">
                        {formatPrice(
                          product.retailPrice
                        )}
                      </span>
                    </td>

                    {/* Offer Price */}

                    <td>
                      <span className="available-stock-price">
                        {formatPrice(
                          product.offerPrice
                        )}
                      </span>
                    </td>

                    {/* Category */}

                    <td>
                      {product.category ||
                        "—"}
                    </td>

                    {/* Manufacturer */}

                    <td>
                      {product.manufacturer ||
                        "—"}
                    </td>

                    {/* Status */}

                    <td>
                      <span className="available-stock-status">
                        Active
                      </span>
                    </td>

                  </tr>
                )
              )}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default AvailableStock;