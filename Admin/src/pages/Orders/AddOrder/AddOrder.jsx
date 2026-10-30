import styles from "./AddOrder.module.css";
import "./RealImagePicker.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineArrowLeft,
  HiOutlineCamera,
  HiOutlineClipboard,
} from "react-icons/hi";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/orders`;

// Import Services
import {
  parseCustomerMessage,
  normalizePhone,
  normalizeDigits,
  isValidPhone,
} from "./parseCustomerMessage.js";
import { findGovernorateOption, getShippingFeeFor } from "./governorates.js";
import { useOrdersLogic } from "../../../UI_Logic/OrdersLogic.jsx";
import {
  PriceTypesList,
} from "../../../services/OrdersServices.js";
import RealImagePicker from "./RealImagePicker.jsx";
import BarcodeScanner from "./BarcodeScanner.jsx";

// Import Components
import ContentHeader from "../../../Components/ContentHeader/ContentHeader.jsx";
import Button from "../../../Components/Button/Button";
import Tabs from "../../../Components/Tabs/Tabs.jsx";
import { Form } from "../../../Components/Form/Form";

const CODE_FIELDS = ["barcode", "sku", "code", "itemId"];

// Build the product image URL.
function getProductImageUrl(imagePath) {
  if (!imagePath) return "";

  const path = String(imagePath).trim();

  if (/^(https?:\/\/|data:|blob:)/i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

// Display the catalog image independently of the actual order photo.
function ProductImage({ imagePath, name, itemId }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getProductImageUrl(imagePath);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (!imageUrl || imageFailed) {
    return (
      <span
        className={
          styles["ao-product-image"] + " " + styles["ao-product-image-empty"]
        }
      >
        No image
      </span>
    );
  }

  return (
    <img
      className={styles["ao-product-image"]}
      src={imageUrl}
      alt={name || `Item ${itemId}`}
      loading="lazy"
      onError={() => setImageFailed(true)}
    />
  );
}

// Success and error notifications.
function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = (message, type = "success") => {
    clearTimeout(timer.current);

    setToast({
      message,
      type,
      id: Date.now(),
    });

    timer.current = setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  return { toast, showToast };
}

export default function AddOrder() {
  const logic = useOrdersLogic();
  const navigate = useNavigate();

  const {
    products = [],
    productsLoading,
    productsError,
    governorates = [],
    addingOrder,
    form,
    updateFormField,
    formError,
    filteredProducts = [],
    estimatedSubtotal,
    validShippingCost,
    estimatedTotal,
    handleAddItem,
    changeItemQuantity,
    removeItem,
    setItemRealImage,
    submitNewOrder,
    formatMoney,
    getProductPrice,
    getStockForProduct,

    setUnitPrice,
    unit
  } = logic;

  const [showProductResults, setShowProductResults] = useState(false);
  const [rawMessage, setRawMessage] = useState("");
  const [autofill, setAutofill] = useState({});
  const [parseInfo, setParseInfo] = useState(null);
  const [shippingOverridden, setShippingOverridden] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [pendingScan, setPendingScan] = useState(null);

  const pasteRef = useRef(null);
  const { toast, showToast } = useToast();

  const canEditShipping = logic.canEditShipping ?? logic.isAdmin ?? true;

  const getFee = (governorate) =>
    logic.getShippingFee?.(governorate) ?? getShippingFeeFor(governorate);

  const defaultFee = form.governorate ? getFee(form.governorate) : null;

  // -------------------------------------------------
  // Helpers
  // -------------------------------------------------

  const clearMark = (field) =>
    setAutofill((prev) =>
      prev[field] ? { ...prev, [field]: undefined } : prev,
    );

  const userEdit = (field, value) => {
    updateFormField(field, value);
    clearMark(field);
  };

  const applyGovernorate = (governorate) => {
    updateFormField("governorate", governorate);
    setShippingOverridden(false);

    const fee = governorate ? getFee(governorate) : null;

    if (fee !== null && fee !== undefined) {
      updateFormField("shippingCost", String(fee));
    }
  };

  const fieldClass = (field) =>
    [
      styles["orders-form-field"],
      autofill[field] === "review" ? styles["ao-needs-review"] : "",
      autofill[field] === "auto" ? styles["ao-autofilled"] : "",
    ]
      .filter(Boolean)
      .join(" ");

  const badge = (field) =>
    autofill[field] === "auto" ? (
      <em className={styles["ao-badge"] + " " + styles["ao-badge-auto"]}>
        Extracted
      </em>
    ) : autofill[field] === "review" ? (
      <em className={styles["ao-badge"] + " " + styles["ao-badge-review"]}>
        Check
      </em>
    ) : null;

  // -------------------------------------------------
  // Smart paste and customer information extraction
  // -------------------------------------------------

  const runExtraction = (text) => {
    const raw = String(text ?? rawMessage).trim();

    if (!raw) return;

    const r = parseCustomerMessage(raw);
    const marks = {};
    const missing = [];

    const fill = (field, value, label) => {
      if (value) {
        updateFormField(field, value);
        marks[field] = "auto";
      } else if (!String(form[field] ?? "").trim()) {
        marks[field] = "review";
        missing.push(label);
      }
    };

    fill("customerName", r.name, "name");
    fill("customerPhone", r.phones[0], "phone");
    fill("shippingAddress", r.address, "address");

    const option = findGovernorateOption(r.govIndex, governorates);

    if (option) {
      applyGovernorate(option);
      marks.governorate = "auto";
    } else if (!form.governorate) {
      marks.governorate = "review";
      missing.push("governorate");
    }

    const noteParts = [];

    if (r.notes) {
      noteParts.push(r.notes);
    }

    if (r.phones[1]) {
      noteParts.push(`Second phone: ${r.phones[1]}`);
    }

    if (noteParts.length) {
      updateFormField("customerNote", noteParts.join(" | "));
      marks.customerNote = "auto";
    }

    const multipleNames = r.warnings.includes("multiple-names");

    if (multipleNames) {
      marks.customerName = "review";
    }

    setAutofill(marks);

    setParseInfo({
      statedTotal: r.statedTotal,
      hints: r.hints,
      missing,
      multipleNames,
    });

    if (missing.length || multipleNames) {
      showToast("Extracted. Please check the highlighted fields.", "warning");
    } else {
      showToast("Details extracted. Review them before saving.");
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();

      setRawMessage(text);
      runExtraction(text);
    } catch {
      pasteRef.current?.focus();

      showToast("Long-press the box and paste the message.", "warning");
    }
  };

  // -------------------------------------------------
  // Barcode scanning
  // -------------------------------------------------

  const handleScannedCode = (rawCode) => {
    const code = normalizeDigits(String(rawCode)).trim();

    if (!code) {
      return {
        ok: false,
        message: "Empty code",
      };
    }

    const lower = code.toLowerCase();

    const product = products.find((p) =>
      CODE_FIELDS.some(
        (field) =>
          p[field] != null && String(p[field]).trim().toLowerCase() === lower,
      ),
    );

    if (!product) {
      return {
        ok: false,
        notFound: true,
        message: `Code ${code} is not registered`,
      };
    }

    const name = product.name || `Item ${product.itemId}`;
    const stock = getStockForProduct(product);

    const existing = form.items.find(
      (item) => String(item.itemId) === String(product.itemId),
    );

    if (existing) {
      const next = Number(existing.quantity) + 1;
      const max = Number(existing.availableStock ?? stock);

      if (next > max) {
        return {
          ok: false,
          message: `${name}: only ${max} in stock`,
        };
      }

      changeItemQuantity(existing.itemId, String(next));

      return {
        ok: true,
        message: `${name} × ${next}`,
      };
    }

    if (stock < 1) {
      return {
        ok: false,
        message: `${name} is out of stock`,
      };
    }

    updateFormField("productId", String(product.itemId));
    updateFormField("quantity", "1");
    setPendingScan(String(product.itemId));

    return {
      ok: true,
      message: `Added: ${name}`,
    };
  };

  useEffect(() => {
    if (!pendingScan) return;

    if (form.productId === pendingScan && String(form.quantity) === "1") {
      handleAddItem?.({ preventDefault() {} });
      updateFormField("productSearch", "");
      setPendingScan(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingScan, form.productId, form.quantity]);

  // -------------------------------------------------
  // Reset form
  // -------------------------------------------------

  const resetPage = () => {
    if (typeof logic.resetForm === "function") {
      logic.resetForm();
    } else {
      [
        "customerName",
        "customerPhone",
        "governorate",
        "shippingAddress",
        "shippingCost",
        "customerNote",
        "productSearch",
        "productId",
      ].forEach((field) => {
        updateFormField(field, "");
      });

      updateFormField("quantity", "1");

      form.items.forEach((item) => {
        removeItem(item.itemId);
      });
    }

    setRawMessage("");
    setAutofill({});
    setParseInfo(null);
    setShippingOverridden(false);
    setPendingScan(null);
    setShowProductResults(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    pasteRef.current?.focus();
  };

  // -------------------------------------------------
  // Submit order
  // -------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fail = (id, message) => {
      showToast(message, "error");
      document.getElementById(id)?.focus();
    };

    if (!form.customerName?.trim()) {
      return fail("ao-name", "Please enter the customer's name.");
    }

    if (!isValidPhone(form.customerPhone)) {
      return fail("ao-phone", "Phone must be 11 digits and start with 01.");
    }

    if (!form.items?.length) {
      return fail(
        "add-order-product-search",
        "Please add at least one product.",
      );
    }

    if (!form.governorate) {
      return fail("ao-governorate", "Please select a governorate.");
    }

    if (!form.shippingAddress?.trim()) {
      return fail("ao-address", "Please enter the shipping address.");
    }

    if (
      form.shippingCost === "" ||
      !Number.isFinite(Number(form.shippingCost)) ||
      Number(form.shippingCost) < 0
    ) {
      return fail("ao-shipping", "Please enter a valid shipping cost.");
    }

    const invalidItem = form.items.some(
      (item) =>
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        Number(item.quantity) > Number(item.availableStock),
    );

    if (invalidItem) {
      showToast(
        "Please check product quantities and available stock.",
        "error",
      );

      return;
    }

    const ok = await submitNewOrder(event);

    if (ok === false) return;

    showToast("Order added successfully ✓");
    resetPage();
  };

  const phoneInvalid =
    Boolean(form.customerPhone) && !isValidPhone(form.customerPhone);

  const totalDiff =
    parseInfo?.statedTotal != null && form.items.length > 0
      ? parseInfo.statedTotal - Number(estimatedTotal)
      : null;

  // -------------------------------------------------
  // Render
  // -------------------------------------------------

  return (
    <section className={styles["add-order-page"]}>
      <ContentHeader
        title="Add New Order"
        subTitle="Paste the customer's message, check the details, and add products."
        action={
          <Button variant="text" onClick={() => navigate("/orders")}>
            <HiOutlineArrowLeft />
            Back to Orders
          </Button>
        }
      />

      <Tabs tabs={PriceTypesList} setValue={setUnitPrice} />

      <Form
        className={styles["add-order-form"]}
        onSubmit={handleSubmit}
        width="full"
      >
        <div className={styles["orders-modal-content"]}>
          {/* 1. Customer message */}

          <h3 className={styles["orders-detail-section-title"]}>
            Customer Message
          </h3>

          <div className={styles["ao-paste"]}>
            <textarea
              ref={pasteRef}
              rows="4"
              value={rawMessage}
              onChange={(event) => setRawMessage(event.target.value)}
              onPaste={(event) => {
                event.preventDefault();

                const text = event.clipboardData.getData("text");

                setRawMessage(text);
                runExtraction(text);
              }}
              disabled={addingOrder}
              aria-label="Customer message"
              placeholder="Paste the customer's message here. Name, phone, governorate and address are filled in automatically."
            />

            <div className={styles["ao-paste-actions"]}>
              <button
                type="button"
                className={styles["orders-details-button"]}
                onClick={pasteFromClipboard}
                disabled={addingOrder}
              >
                <HiOutlineClipboard aria-hidden="true" />
                Paste
              </button>

              <button
                type="button"
                className={styles["orders-details-button"]}
                onClick={() => runExtraction()}
                disabled={addingOrder || !rawMessage.trim()}
              >
                Extract details
              </button>
            </div>

            {parseInfo && (
              <div className={styles["ao-paste-notes"]}>
                {parseInfo.missing.length > 0 ? (
                  <p
                    className={
                      styles["ao-paste-note"] + " " + styles["is-warning"]
                    }
                  >
                    Couldn't find: {parseInfo.missing.join(", ")}. Please fill
                    in the highlighted fields.
                  </p>
                ) : (
                  <p
                    className={styles["ao-paste-note"] + " " + styles["is-ok"]}
                  >
                    Details extracted. Please review them before saving.
                  </p>
                )}

                {parseInfo.multipleNames && (
                  <p
                    className={
                      styles["ao-paste-note"] + " " + styles["is-warning"]
                    }
                  >
                    The message contains more than one name. Check who the
                    customer is.
                  </p>
                )}

                {parseInfo.hints.length > 0 && (
                  <div className={styles["ao-hints"]}>
                    <span>Mentioned in the message:</span>

                    {parseInfo.hints.map((hint) => (
                      <em key={hint}>{hint}</em>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Customer details */}

          <h3 className={styles["orders-detail-section-title"]}>
            Customer Details
          </h3>

          <div className={styles["orders-form-grid"]}>
            <label className={fieldClass("customerName")}>
              <span>Customer Name * {badge("customerName")}</span>
              <input
                id="ao-name"
                type="text"
                value={form.customerName}
                onChange={(event) =>
                  userEdit("customerName", event.target.value)
                }
                maxLength={120}
                autoComplete="name"
                required
                disabled={addingOrder}
                placeholder="Enter customer's full name"
              />
            </label>

            <label className={fieldClass("customerPhone")}>
              <span>Phone Number * {badge("customerPhone")}</span>

              <input
                id="ao-phone"
                type="tel"
                inputMode="tel"
                value={form.customerPhone}
                onChange={(event) =>
                  userEdit("customerPhone", normalizePhone(event.target.value))
                }
                maxLength={30}
                autoComplete="tel"
                required
                disabled={addingOrder}
                placeholder="01xxxxxxxxx"
                aria-invalid={phoneInvalid}
              />

              {phoneInvalid && (
                <small className={styles["ao-field-msg"]}>
                  Phone must be 11 digits and start with 01.
                </small>
              )}
            </label>
          </div>

          {/* 3. Products */}

          <h3 className={styles["orders-detail-section-title"]}>Products</h3>

          {productsLoading ? (
            <p>Loading products...</p>
          ) : productsError ? (
            <p role="alert">{productsError}</p>
          ) : products.length === 0 ? (
            <p>No products are currently available.</p>
          ) : (
            <>
              <div className={styles["orders-form-grid"]}>
                <div
                  className={
                    styles["orders-form-field"] +
                    " " +
                    styles["orders-product-picker"]
                  }
                >
                  <label htmlFor="add-order-product-search">
                    Search or Scan Products *
                  </label>

                  <div className={styles["orders-product-search"]}>
                    <HiOutlineSearch aria-hidden="true" />

                    <input
                      id="add-order-product-search"
                      type="search"
                      value={form.productSearch || ""}
                      onChange={(event) => {
                        updateFormField("productSearch", event.target.value);

                        updateFormField("productId", "");
                        setShowProductResults(true);
                      }}
                      onFocus={() => setShowProductResults(true)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;

                        event.preventDefault();

                        const code = event.currentTarget.value.trim();

                        if (!code) return;

                        const result = handleScannedCode(code);

                        if (
                          result.notFound &&
                          !/^[A-Za-z0-9._-]{4,}$/.test(code)
                        ) {
                          return;
                        }

                        showToast(
                          result.message,
                          result.ok ? "success" : "error",
                        );

                        if (result.ok) {
                          updateFormField("productSearch", "");
                          setShowProductResults(false);
                        }
                      }}
                      autoComplete="off"
                      placeholder="Search by name or ID, or scan a barcode..."
                      disabled={addingOrder}
                    />

                    <button
                      type="button"
                      className={styles["ao-scan-btn"]}
                      onClick={() => setShowScanner(true)}
                      disabled={addingOrder}
                      aria-label="Scan barcode with camera"
                    >
                      <HiOutlineCamera aria-hidden="true" />
                    </button>
                  </div>

                  {showProductResults && (
                    <div className={styles["orders-product-results"]}>
                      {filteredProducts.length > 0 ? (
                        
                        filteredProducts.map((product,i) => {
                          const stock = getStockForProduct(product);

                          return (
                            <button
                              type="button"
                              key={product.itemId}
                              className={styles["orders-product-result"]}
                              disabled={addingOrder || stock < 1}
                              onClick={() => {
                                updateFormField(
                                  "productId",
                                  String(product.itemId),
                                );

                                updateFormField(
                                  "productSearch",
                                  product.name || `Item ${product.itemId}`,
                                );

                                setShowProductResults(false);
                              }}
                            >
                              <span className={styles["ao-product-info"]}>
                                <ProductImage
                                  imagePath={product.imagePath}
                                  name={product.name}
                                  itemId={product.itemId}
                                />

                                <span className={styles["ao-product-text"]}>
                                  <strong>
                                    {product.name || `Item ${product.itemId}`}
                                  </strong>

                                  <small>
                                    {formatMoney(getProductPrice(product,"retail"))}
                                  </small>
                                </span>
                              </span>

                              <small className={styles["ao-product-stock"]}>
                                {stock > 0 ? `Stock: ${stock}` : "Out of stock"}
                              </small>
                            </button>
                          );
                        })
                      ) : (
                        <p className={styles["orders-product-search-empty"]}>
                          No matching products found.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <label className={styles["orders-form-field"]}>
                  <span>Quantity *</span>

                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={form.quantity}
                    onChange={(event) =>
                      updateFormField("quantity", event.target.value)
                    }
                    required
                    disabled={addingOrder}
                  />
                </label>
              </div>

              <button
                type="button"
                className={styles["orders-details-button"]}
                onClick={handleAddItem}
                disabled={
                  addingOrder ||
                  !form.productId ||
                  !Number.isInteger(Number(form.quantity)) ||
                  Number(form.quantity) < 1
                }
              >
                <HiOutlinePlus aria-hidden="true" />
                Add Product
              </button>
            </>
          )}

          {/* Selected products and actual product photos */}

          {form.items.length > 0 && (
            <>
              <h3 className={styles["orders-detail-section-title"]}>
                Selected Products ({form.items.length})
              </h3>
              <div className={styles["orders-detail-items"]}>
                {form.items.map((item) => {
                  const qty = Number(item.quantity);
                  const max = Number(item.availableStock);

                  return (
                    <div
                      className={styles["orders-detail-item"]}
                      key={item.itemId}
                    >
                      <div className={styles["ao-selected-product"]}>
                        <ProductImage
                          imagePath={item.imagePath}
                          name={item.name}
                          itemId={item.itemId}
                        />

                        <div className={styles["ao-selected-product-details"]}>
                          <strong>{item.name}</strong>

                          <span>Unit Price: {formatMoney(item.unitPrice)}</span>

                          <div className={styles["ao-stepper"]}>
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              disabled={addingOrder || qty <= 1}
                              onClick={() =>
                                changeItemQuantity(item.itemId, String(qty - 1))
                              }
                            >
                              −
                            </button>

                            <input
                              type="number"
                              inputMode="numeric"
                              aria-label="Quantity"
                              min="1"
                              max={item.availableStock}
                              step="1"
                              value={item.quantity}
                              required
                              disabled={addingOrder}
                              onChange={(event) =>
                                changeItemQuantity(
                                  item.itemId,
                                  event.target.value,
                                )
                              }
                            />

                            <button
                              type="button"
                              aria-label="Increase quantity"
                              disabled={addingOrder || qty >= max}
                              onClick={() =>
                                changeItemQuantity(item.itemId, String(qty + 1))
                              }
                            >
                              +
                            </button>
                          </div>

                          {qty >= max && (
                            <small className={styles["ao-field-msg"]}>
                              Maximum available stock reached ({max}).
                            </small>
                          )}
                        </div>
                      </div>

                      {/* Actual photo is separate from the catalog image. */}
                      <RealImagePicker
                        file={item.realImageFile || null}
                        onChange={(file) => {
                          setItemRealImage(item.itemId, file);
                        }}
                        disabled={addingOrder}
                      />

                      <div className={styles["ao-selected-product-actions"]}>
                        <strong>
                          {formatMoney(Number(item.unitPrice) * qty)}
                        </strong>

                        <button
                          type="button"
                          className={styles["orders-details-button"]}
                          disabled={addingOrder}
                          onClick={() => removeItem(item.itemId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* 4. Delivery details */}

          <h3 className={styles["orders-detail-section-title"]}>
            Delivery Details
          </h3>

          <label className={fieldClass("governorate")}>
            <span>Governorate * {badge("governorate")}</span>

            <select
              id="ao-governorate"
              value={form.governorate}
              onChange={(event) => {
                applyGovernorate(event.target.value);
                clearMark("governorate");
              }}
              required
              disabled={addingOrder}
            >
              <option value="">Select a governorate</option>

              {governorates.map((governorate) => (
                <option key={governorate} value={governorate}>
                  {governorate}
                </option>
              ))}
            </select>
          </label>

          <label className={fieldClass("shippingAddress")}>
            <span>Shipping Address * {badge("shippingAddress")}</span>

            <textarea
              id="ao-address"
              rows="3"
              value={form.shippingAddress}
              onChange={(event) =>
                userEdit("shippingAddress", event.target.value)
              }
              maxLength={1000}
              required
              disabled={addingOrder}
              autoComplete="street-address"
              placeholder="Enter the full delivery address"
            />
          </label>

          <div className={styles["orders-form-field"]}>
            <label htmlFor="ao-shipping">
              Shipping Cost (EGP) *{" "}
              {shippingOverridden && (
                <em
                  className={
                    styles["ao-badge"] + " " + styles["ao-badge-review"]
                  }
                >
                  Manual
                </em>
              )}
            </label>

            <input
              id="ao-shipping"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.shippingCost}
              readOnly={!canEditShipping}
              onChange={(event) => {
                updateFormField("shippingCost", event.target.value);

                setShippingOverridden(true);
              }}
              required
              disabled={addingOrder}
            />

            {!canEditShipping ? (
              <small
                className={styles["ao-field-msg"] + " " + styles["is-muted"]}
              >
                Set automatically from the governorate.
              </small>
            ) : (
              shippingOverridden &&
              defaultFee != null && (
                <button
                  type="button"
                  className={styles["ao-link"]}
                  onClick={() => applyGovernorate(form.governorate)}
                >
                  Reset to default ({formatMoney(defaultFee)})
                </button>
              )
            )}
          </div>

          <label className={fieldClass("customerNote")}>
            <span>Customer Notes (Optional) {badge("customerNote")}</span>

            <textarea
              rows="3"
              value={form.customerNote}
              onChange={(event) => userEdit("customerNote", event.target.value)}
              maxLength={2000}
              disabled={addingOrder}
              placeholder="Enter any additional instructions"
            />
          </label>

          {/* 5. Order summary */}

          <h3 className={styles["orders-detail-section-title"]}>
            Order Summary
          </h3>

          <div className={styles["orders-detail-total"]}>
            <span>Products Subtotal</span>
            <strong>{formatMoney(estimatedSubtotal)}</strong>
          </div>

          <div className={styles["orders-detail-total"]}>
            <span>Shipping</span>
            <strong>{formatMoney(validShippingCost)}</strong>
          </div>

          <div className={styles["orders-detail-total"]}>
            <span>Grand Total</span>
            <strong>{formatMoney(estimatedTotal)}</strong>
          </div>

          {totalDiff !== null &&
            (totalDiff === 0 ? (
              <p className={styles["ao-chip"] + " " + styles["is-ok"]}>
                ✓ Matches the total in the customer's message (
                {formatMoney(parseInfo.statedTotal)})
              </p>
            ) : (
              <p className={styles["ao-chip"] + " " + styles["is-warning"]}>
                ⚠ The message says {formatMoney(parseInfo.statedTotal)} but this
                order is {formatMoney(estimatedTotal)} (difference{" "}
                {formatMoney(Math.abs(totalDiff))}). Check the products and
                shipping.
              </p>
            ))}

          {formError && (
            <p className={styles["orders-form-error"]} role="alert">
              {formError}
            </p>
          )}
        </div>

        <footer
          className={
            styles["orders-modal-footer"] + " " + styles["add-order-bar"]
          }
        >
          <div className={styles["add-order-bar-total"]}>
            <span>Total</span>
            <strong>{formatMoney(estimatedTotal)}</strong>
          </div>

          <Button
            type="button"
            variant="text"
            onClick={() => navigate("/orders")}
            disabled={addingOrder}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              addingOrder ||
              productsLoading ||
              Boolean(productsError) ||
              form.items.length === 0
            }
          >
            {addingOrder ? "Creating Order..." : "Save Order"}
          </Button>
        </footer>
      </Form>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScannedCode}
          onClose={() => setShowScanner(false)}
          summary={`${form.items.length} products · ${formatMoney(
            estimatedTotal,
          )}`}
        />
      )}

      {toast && (
        <div
          key={toast.id}
          className={`${styles["ao-toast"]} ${toast.type === "success" ? styles["ao-toast-success"] : styles["ao-toast-error"]}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </section>
  );
}
