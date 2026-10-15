
import React from "react";
import "./AvailableStock.css";

import LoadingSpinner from "../../Components/LoadingSpinner/LoadingSpinner";
import { useAvailableStockLogic } from "../../UI_Logic/AvailableStockLogic.jsx";
import ContentHeader from "../../Components/ContentHeader/ContentHeader";
// import Tost from "../../Components/Tost/Tost";

export default function AvailableStock() {
  const {
    filteredProducts,
    categories,
    manufacturers,

    loading,
    error,
    importing,
    imageUploadingFor,

    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    manufacturerFilter,
    setManufacturerFilter,

    canManageImages,
    canImport,

    fileInputRefs,
    fetchProducts,
    getImageUrl,
    openImagePicker,
    handleImageUpload,
    handleImport,
    clearFilters,

    successMessage
  } = useAvailableStockLogic();

  function renderImageControls(product, view) {
    const productId = String(product.itemId);
    const isUploading = imageUploadingFor === productId;
    const hasImage = Boolean(product.imagePath || product.image);

    return (
      <div
        className={`available-stock-image-actions available-stock-image-actions--${view}`}
      >
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
            ? "Uploading..."
            : hasImage
              ? "Change Image"
              : "Add Image"}
        </button>
      </div>
    );
  }

  function renderProductImage(product) {
    const imageUrl = getImageUrl(
      product.imagePath || product.image
    );

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
          <span>No Image</span>
        )}
      </div>
    );
  }

  function renderProductDetails(product) {
    const details = [
      ["Quantity", product.qty ?? 0],
      ["Purchase Price", product.purchasePrice ?? 0],
      ["Wholesale Price", product.wholesalePrice ?? 0],
      ["Retail Price", product.retailPrice ?? 0],
      ["Offer Price", product.offerPrice ?? 0],
      ["Category", product.category || "-"],
      ["Manufacturer", product.manufacturer || "-"],
    ];

    return details.map(([label, value]) => (
      <div className="available-stock-card__field" key={label}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    ));
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="page available-stock-page" dir="ltr">

      {/* {successMessage && <Tost status="success" description={successMessage}/>} */}

      {/* Page Header */}
      <section className="ds-page-head">

        <ContentHeader title="Available Stock" subTitle="Manage your products and available inventory" />

       
      </section>

      {/* Error State */}
      {error && (
        <section className="available-stock-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchProducts}
          >
            Try Again
          </button>
        </section>
      )}

      {/* Search and Filters */}
      <section className="available-stock-toolbar">
        <div className="available-stock-filters">
          <div className="field-group">
            <label className="field-label" htmlFor="stock-search">
              Search
            </label>

            <input
              id="stock-search"
              className="field"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product ID, name, or manufacturer..."
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="stock-category">
              Category
            </label>

            <select
              id="stock-category"
              className="field"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="stock-manufacturer">
              Manufacturer
            </label>

            <select
              id="stock-manufacturer"
              className="field"
              value={manufacturerFilter}
              onChange={(event) =>
                setManufacturerFilter(event.target.value)
              }
            >
              <option value="">All Manufacturers</option>

              {manufacturers.map((manufacturer) => (
                <option key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </option>
              ))}
            </select>
          </div>

          <div className="available-stock-filter-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
              disabled={
                !search && !categoryFilter && !manufacturerFilter
              }
            >
              Clear Filters
            </button>
          </div>

          {canImport && (
            <div className="field-group available-stock-import">
              <label className="field-label" htmlFor="stock-import">
                Import Products
              </label>

              <label
                className={`btn btn-primary ${
                  importing ? "is-disabled" : ""
                }`}
                htmlFor="stock-import"
              >
                {importing ? "Importing..." : "Import Excel"}

                <input
                  id="stock-import"
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

      {/* Desktop Table */}
      <section className="card available-stock-table-section">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Purchase Price</th>
                <th>Wholesale Price</th>
                <th>Retail Price</th>
                <th>Offer Price</th>
                <th>Category</th>
                <th>Manufacturer</th>
                {canManageImages && <th>Image Actions</th>}
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={canManageImages ? 11 : 10}>
                    <div className="state">
                      {error
                        ? "Products could not be loaded."
                        : "No products found."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.itemId}>
                    <td>{renderProductImage(product)}</td>

                    <td>
                      <strong>{product.itemId ?? "-"}</strong>
                    </td>

                    <td>{product.name || "-"}</td>
                    <td>{product.qty ?? 0}</td>
                    <td>{product.purchasePrice ?? 0}</td>
                    <td>{product.wholesalePrice ?? 0}</td>
                    <td>{product.retailPrice ?? 0}</td>
                    <td>{product.offerPrice ?? 0}</td>
                    <td>{product.category || "-"}</td>
                    <td>{product.manufacturer || "-"}</td>

                    {canManageImages && (
                      <td>
                        {renderImageControls(product, "desktop")}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Responsive Product Cards */}
      <section
        className="available-stock-cards"
        aria-label="Available products"
      >
        {filteredProducts.length === 0 ? (
          <div className="state">
            {error
              ? "Products could not be loaded."
              : "No products found."}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <article
              className="available-stock-card"
              key={`mobile-${product.itemId}`}
            >
              <div className="available-stock-card__header">
                {renderProductImage(product)}

                <div className="available-stock-card__identity">
                  <h2>{product.name || "Unnamed Product"}</h2>

                  <p>
                    Product ID:{" "}
                    <strong>{product.itemId ?? "-"}</strong>
                  </p>

                  <p>
                    Quantity:{" "}
                    <strong>{product.qty ?? 0}</strong>
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
