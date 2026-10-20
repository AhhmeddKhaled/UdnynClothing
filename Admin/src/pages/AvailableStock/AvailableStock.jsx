import { memo, useCallback, useState } from "react";

import styles from "./AvailableStock.module.css";
import { GoDotFill } from "react-icons/go";

import LoadingSpinner from "../../Components/LoadingSpinner/LoadingSpinner";
import { useAvailableStockLogic } from "../../UI_Logic/AvailableStockLogic.jsx";
import ContentHeader from "../../Components/ContentHeader/ContentHeader.jsx";
import ViewImage from "../../Components/ViewImage/ViewImage";

import {
  Form,
  FieldInputGroup,
  FieldSelectGroup,
} from "../../Components/Form/Form";

import Button from "../../Components/Button/Button";

// =====================================
// Product Image
// =====================================

const ProductImage = memo(function ProductImage({
  product,
  getImageUrl,
  onOpenImage,
}) {
  const imageUrl = getImageUrl(product.imagePath || product.image);

  return (
    <div className={styles.availableStockImage}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={product.name || `Product ${product.itemId}`}
          loading="lazy"
          onClick={() => onOpenImage(product)}
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
        />
      ) : (
        <span>No Image</span>
      )}
    </div>
  );
});

// =====================================
// Product Actions
// =====================================

const ProductActions = memo(function ProductActions({
  product,
  view,
  imageUploadingFor,
  fileInputRefs,
  openImagePicker,
  handleImageUpload,
}) {
  const productId = String(product.itemId);
  const isUploading = imageUploadingFor === productId;

  return (
    <div className={styles.tableActions}>
      <Button
        variant="change"
        onClick={() => openImagePicker(product.itemId, view)}
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
      </Button>

      <Button variant="edit" />
      <Button variant="delete" />
    </div>
  );
});

// =====================================
// Memoized Product Table Row
// =====================================

const ProductRow = memo(function ProductRow({
  product,
  selected,
  onSelectProduct,
  getImageUrl,
  onOpenImage,
  canManageImages,
  imageUploadingFor,
  fileInputRefs,
  openImagePicker,
  handleImageUpload,
}) {
  return (
    <tr>
      <td className={styles.productSelect}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) =>
            onSelectProduct(product.itemId, event.target.checked)
          }
        />
      </td>

      <td>
        <strong>{product.itemId ?? "-"}</strong>
      </td>

      <td className={styles.productImage}>
        <ProductImage
          product={product}
          getImageUrl={getImageUrl}
          onOpenImage={onOpenImage}
        />
      </td>

      <td>{product.name || "-"}</td>

      <td className={styles.productStatus}>
        <span className={product.active ? styles.active : styles.Inactive}>
          <span className={styles.productStatusDot}>
            <GoDotFill />
          </span>

          {product.active ? "active" : "Inactive"}
        </span>
      </td>

      <td className={styles.qtyStatus}>
        <span className={product.qty <= 0 ? styles.OutOfStock : ""}>
          {product.qty <= 0 ? (
            <span className={styles.productStatusDot}>
              <GoDotFill />
            </span>
          ) : (
            ""
          )}

          {product.qty <= 0 ? "Out of stock" : product.qty}
        </span>
      </td>

      <td>{product.purchasePrice ?? 0}</td>
      <td>{product.wholesalePrice ?? 0}</td>
      <td>{product.retailPrice ?? 0}</td>

      {canManageImages && (
        <td className={styles.tableActions}>
          <ProductActions
            product={product}
            view="desktop"
            imageUploadingFor={imageUploadingFor}
            fileInputRefs={fileInputRefs}
            openImagePicker={openImagePicker}
            handleImageUpload={handleImageUpload}
          />
        </td>
      )}
    </tr>
  );
});

// =====================================
// Main Page
// =====================================

export default function AvailableStock() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

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
  } = useAvailableStockLogic();

  // =====================================
  // Stable Callbacks
  // =====================================

  const handleSelectAll = useCallback(
    (event) => {
      const visibleIds = filteredProducts.map((product) =>
        String(product.itemId),
      );

      if (event.target.checked) {
        setSelectedProducts((previous) => [
          ...new Set([...previous, ...visibleIds]),
        ]);
      } else {
        const visibleSet = new Set(visibleIds);

        setSelectedProducts((previous) =>
          previous.filter((id) => !visibleSet.has(id)),
        );
      }
    },
    [filteredProducts],
  );

  const handleSelectProduct = useCallback((productId, checked) => {
    const id = String(productId);

    setSelectedProducts((previous) =>
      checked
        ? previous.includes(id)
          ? previous
          : [...previous, id]
        : previous.filter((selectedId) => selectedId !== id),
    );
  }, []);
  const handleOpenImage = useCallback((product) => {
    setSelectedImage(product.imagePath || product.image || null);
  }, []);

  const handleCloseImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // =====================================
  // Mobile Product Details
  // =====================================

  const renderProductDetails = (product) => {
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
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const allVisibleSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((product) =>
      selectedProducts.includes(String(product.itemId)),
    );

  return (
    <section className={styles.availableStockPage}>
      {/* Page Header */}

      <section>
        <ContentHeader
          title="Available Stock"
          subTitle="Manage your products and available inventory"
          action={
            canImport && (
              <Button variant="primary" radius="radius-md">
                <label
                  className={importing ? "is-disabled" : ""}
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
            )
          }
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
                <th className={styles.productSelect}>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={handleSelectAll}
                  />
                </th>

                <th>ID</th>
                <th className={styles.productImage}>Image</th>
                <th>Product Name</th>
                <th>Status</th>
                <th>Quantity</th>
                <th>Purchase Pr</th>
                <th>Wholesale Pr</th>
                <th>Retail Pr</th>

                {canManageImages && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={canManageImages ? 10 : 9}>
                    <div className={styles.state}>
                      {error
                        ? "Products could not be loaded."
                        : "No products found."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <ProductRow
                    key={product.itemId}
                    product={product}
                    selected={selectedProducts.includes(String(product.itemId))}
                    onSelectProduct={handleSelectProduct}
                    getImageUrl={getImageUrl}
                    onOpenImage={handleOpenImage}
                    canManageImages={canManageImages}
                    imageUploadingFor={imageUploadingFor}
                    fileInputRefs={fileInputRefs}
                    openImagePicker={openImagePicker}
                    handleImageUpload={handleImageUpload}
                  />
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
                <ProductImage
                  product={product}
                  getImageUrl={getImageUrl}
                  onOpenImage={handleOpenImage}
                />

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
                  <ProductActions
                    product={product}
                    view="mobile"
                    imageUploadingFor={imageUploadingFor}
                    fileInputRefs={fileInputRefs}
                    openImagePicker={openImagePicker}
                    handleImageUpload={handleImageUpload}
                  />
                </div>
              )}
            </article>
          ))
        )}
      </section>

      {/* Single Image Viewer */}

      <ViewImage
        imageSrc={selectedImage}
        openImage={Boolean(selectedImage)}
        onClose={handleCloseImage}
      />
    </section>
  );
}
