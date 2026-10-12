import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineArrowLeft,
} from "react-icons/hi";

import { useOrdersLogic } from "../../../UI_Logic/OrdersLogic.jsx";
import ContentHeader from "../../../Components/ContentHeader/ContentHeader.jsx";
import Button from "../../../Components/Button/Button";

import "./AddOrder.css";

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
    submitNewOrder,
    formatMoney,
    getProductPrice,
    getStockForProduct,
  } = logic;

  const [showProductResults, setShowProductResults] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.customerName?.trim()) {
      window.alert("Please enter the customer's name.");
      return;
    }

    if (!form.customerPhone?.trim()) {
      window.alert("Please enter the customer's phone number.");
      return;
    }

    if (!form.items?.length) {
      window.alert("Please add at least one product.");
      return;
    }

    if (!form.governorate) {
      window.alert("Please select a governorate.");
      return;
    }

    if (!form.shippingAddress?.trim()) {
      window.alert("Please enter the shipping address.");
      return;
    }

    if (
      form.shippingCost === "" ||
      !Number.isFinite(Number(form.shippingCost)) ||
      Number(form.shippingCost) < 0
    ) {
      window.alert("Please enter a valid shipping cost.");
      return;
    }

    const invalidItem = form.items.some(
      (item) =>
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        Number(item.quantity) > Number(item.availableStock)
    );

    if (invalidItem) {
      window.alert("Please check product quantities and available stock.");
      return;
    }

    await submitNewOrder(event);
  };

  const handleGovernorateChange = (governorate) => {
    updateFormField("governorate", governorate);
  };

  return (
    <section className="orders-page add-order-page">
      <ContentHeader
        title="Add New Order"
        subTitle="Enter customer details, products, and delivery information."
        action={
          <Button variant="text" onClick={() => navigate("/orders")}>
            <HiOutlineArrowLeft />
            Back to Orders
          </Button>
        }
      />

      <form
        className="orders-panel add-order-form"
        onSubmit={handleSubmit}
      >
        <div className="orders-modal-content">
          <h3 className="orders-detail-section-title">
            Customer Details
          </h3>

          <div className="orders-form-grid">
            <label className="orders-form-field">
              <span>Customer Name *</span>
              <input
                type="text"
                value={form.customerName}
                onChange={(event) =>
                  updateFormField("customerName", event.target.value)
                }
                maxLength={120}
                autoComplete="name"
                required
                disabled={addingOrder}
                placeholder="Enter customer's full name"
              />
            </label>

            <label className="orders-form-field">
              <span>Phone Number *</span>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(event) =>
                  updateFormField("customerPhone", event.target.value)
                }
                maxLength={30}
                autoComplete="tel"
                required
                disabled={addingOrder}
                placeholder="Enter phone number"
              />
            </label>
          </div>

          <h3 className="orders-detail-section-title">
            Products
          </h3>

          {productsLoading ? (
            <p>Loading products...</p>
          ) : productsError ? (
            <p role="alert">{productsError}</p>
          ) : products.length === 0 ? (
            <p>No products are currently available.</p>
          ) : (
            <>
              <div className="orders-form-grid">
                <div className="orders-form-field orders-product-picker">
                  <label htmlFor="add-order-product-search">
                    Search Products *
                  </label>

                  <div className="orders-product-search">
                    <HiOutlineSearch aria-hidden="true" />

                    <input
                      id="add-order-product-search"
                      type="search"
                      value={form.productSearch || ""}
                      onChange={(event) => {
                        updateFormField(
                          "productSearch",
                          event.target.value
                        );
                        updateFormField("productId", "");
                        setShowProductResults(true);
                      }}
                      onFocus={() => setShowProductResults(true)}
                      autoComplete="off"
                      placeholder="Search by product name or ID..."
                      disabled={addingOrder}
                    />
                  </div>

                  {showProductResults && (
                    <div className="orders-product-results">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => {
                          const stock = getStockForProduct(product);

                          return (
                            <button
                              type="button"
                              key={product.itemId}
                              className="orders-product-result"
                              disabled={addingOrder || stock < 1}
                              onClick={() => {
                                updateFormField(
                                  "productId",
                                  String(product.itemId)
                                );
                                updateFormField(
                                  "productSearch",
                                  product.name || `Item ${product.itemId}`
                                );
                                setShowProductResults(false);
                              }}
                            >
                              <span>
                                <strong>
                                  {product.name || `Item ${product.itemId}`}
                                </strong>
                                <small>
                                  {formatMoney(getProductPrice(product))}
                                </small>
                              </span>

                              <small>
                                {stock > 0
                                  ? `Stock: ${stock}`
                                  : "Out of stock"}
                              </small>
                            </button>
                          );
                        })
                      ) : (
                        <p className="orders-product-search-empty">
                          No matching products found.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <label className="orders-form-field">
                  <span>Quantity *</span>
                  <input
                    type="number"
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
                className="orders-details-button"
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

          {form.items.length > 0 && (
            <>
              <h3 className="orders-detail-section-title">
                Selected Products ({form.items.length})
              </h3>

              <div className="orders-detail-items">
                {form.items.map((item) => (
                  <div
                    className="orders-detail-item"
                    key={item.itemId}
                  >
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        Unit Price: {formatMoney(item.unitPrice)}
                      </span>

                      <label className="orders-form-field">
                        <span>Quantity *</span>
                        <input
                          type="number"
                          min="1"
                          max={item.availableStock}
                          step="1"
                          value={item.quantity}
                          required
                          disabled={addingOrder}
                          onChange={(event) =>
                            changeItemQuantity(
                              item.itemId,
                              event.target.value
                            )
                          }
                        />
                      </label>
                    </div>

                    <div>
                      <strong>
                        {formatMoney(
                          Number(item.unitPrice) * Number(item.quantity)
                        )}
                      </strong>

                      <button
                        type="button"
                        className="orders-details-button"
                        disabled={addingOrder}
                        onClick={() => removeItem(item.itemId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <h3 className="orders-detail-section-title">
            Delivery Details
          </h3>

          <label className="orders-form-field">
            <span>Governorate *</span>
            <select
              value={form.governorate}
              onChange={(event) =>
                handleGovernorateChange(event.target.value)
              }
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

          <label className="orders-form-field">
            <span>Shipping Address *</span>
            <textarea
              rows="3"
              value={form.shippingAddress}
              onChange={(event) =>
                updateFormField("shippingAddress", event.target.value)
              }
              maxLength={1000}
              required
              disabled={addingOrder}
              autoComplete="street-address"
              placeholder="Enter the full delivery address"
            />
          </label>

          <label className="orders-form-field">
            <span>Shipping Cost (EGP) *</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.shippingCost}
              onChange={(event) =>
                updateFormField("shippingCost", event.target.value)
              }
              required
              disabled={addingOrder}
            />
          </label>

          <label className="orders-form-field">
            <span>Customer Notes (Optional)</span>
            <textarea
              rows="3"
              value={form.customerNote}
              onChange={(event) =>
                updateFormField("customerNote", event.target.value)
              }
              maxLength={2000}
              disabled={addingOrder}
              placeholder="Enter any additional instructions"
            />
          </label>

          <h3 className="orders-detail-section-title">
            Order Summary
          </h3>

          <div className="orders-detail-total">
            <span>Products Subtotal</span>
            <strong>{formatMoney(estimatedSubtotal)}</strong>
          </div>

          <div className="orders-detail-total">
            <span>Shipping</span>
            <strong>{formatMoney(validShippingCost)}</strong>
          </div>

          <div className="orders-detail-total">
            <span>Grand Total</span>
            <strong>{formatMoney(estimatedTotal)}</strong>
          </div>

          {formError && (
            <p className="orders-form-error" role="alert">
              {formError}
            </p>
          )}
        </div>

        <footer className="orders-modal-footer">
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
      </form>
    </section>
  );
}