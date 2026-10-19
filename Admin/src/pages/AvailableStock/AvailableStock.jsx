import React from "react";
import styles from "./AvailableStock.module.css";

import LoadingSpinner from "../../Components/LoadingSpinner/LoadingSpinner";
import { useAvailableStockLogic } from "../../UI_Logic/AvailableStockLogic.jsx";

import ContentHeader from "../../Components/ContentHeader/ContentHeader.jsx";
import {
  Form,
  FieldInputGroup,
  FieldSelectGroup,
} from "../../Components/Form/Form";
import Button from "../../Components/Button/Button";

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

    successMessage,
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
    const imageUrl = getImageUrl(product.imagePath || product.image);

    return (
      <div className={styles.availableStockImage}>
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
    <section className={styles.availableStockPage}>
      {/* {successMessage && <Tost status="success" description={successMessage}/>} */}

      {/* Page Header */}
      <section>
        <ContentHeader
          title="Available Stock"
          subTitle="Manage your products and available inventory"
          action={canImport && (
          <Button
          variant="primary"
          radius="radius-md"
          >
            <label
              className={`${importing ? "is-disabled" : ""}`}
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
          </Button>
        )}
        />
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
      <section className={styles.availableStockToolbar}>
        <Form>
          <FieldInputGroup
            label={{
              id: "stock-search",
              name: "Search",
            }}
            inputOptions={{
              id: "stock-search",
              type: "search",
              value: search,
              readOnly: false,
              onChange: (event) => setSearch(event.target.value),
              placeholder: "Search by product ID, name, or manufacturer...",
            }}
          />

          <FieldSelectGroup
            label={{
              name: "category",
            }}
            selectOptions={{
              id: "stock-category",
              selectList: categories,
              value: categoryFilter,
              onChange: (event) => setCategoryFilter(event.target.value),
            }}
          />

          <FieldSelectGroup
            label={{
              name: "manufacturer",
            }}
            selectOptions={{
              id: "stock-manufacturer",
              selectList: manufacturers,
              value: manufacturerFilter,
              onChange: (event) => setManufacturerFilter(event.target.value),
            }}
          />

          <div>
            <Button
              type="button"
              variant="text"
              onClick={clearFilters}
              disabled={!search && !categoryFilter && !manufacturerFilter}
              radius="radius-md"
            >
              Clear Filters
            </Button>
          </div>
        </Form>
      </section>

      {/* Desktop Table */}
      <section className={styles.availableStockTableSection}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>ID</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Purchase Pr</th>
                <th>Wholesale Pr</th>
                <th>Retail Pr</th>
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

                    {canManageImages && (
                      <td>
                        <Button
                        variant="text"
                        >
                        {renderImageControls(product, "desktop")}
                        </Button>
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
        className={styles.availableStockCards}
        aria-label="Available products"
      >
        {filteredProducts.length === 0 ? (
          <div className={styles.state}>
            {error ? "Products could not be loaded." : "No products found."}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <article
              className={styles.availableStockCard}
              key={`mobile-${product.itemId}`}
            >
              <div className={styles.availableStockCardHeader}>
                {renderProductImage(product)}

                <div className={styles.availableStockCardIdentit}>
                  <h2>{product.name || "Unnamed Product"}</h2>

                  <p>
                    Product ID: <strong>{product.itemId ?? "-"}</strong>
                  </p>

                  <p>
                    Quantity: <strong>{product.qty ?? 0}</strong>
                  </p>
                </div>
              </div>

              <div className={styles.availableStockCardDetails}>
                {renderProductDetails(product)}
              </div>

              {canManageImages && (
                <div className={styles.availableStockCardActions}>
                  {renderImageControls(product, "mobile")}
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </section>
  );
}
