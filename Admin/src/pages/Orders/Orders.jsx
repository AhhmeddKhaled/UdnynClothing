import "./Orders.css";
import { useOrdersLogic } from "../../UI_Logic/OrdersLogic.jsx";
import {
  HiOutlineClipboardList,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineEye,
  HiOutlinePlus,
} from "react-icons/hi";
import ContentHeader from "../../Components/ContentHeader/ContentHeader.jsx";

function Icon({ name, size = 18 }) {
  const icons = {
    orders: HiOutlineClipboardList,
    search: HiOutlineSearch,
    close: HiOutlineX,
    eye: HiOutlineEye,
    plus: HiOutlinePlus,
  };

  const IconComponent = icons[name];

  if (!IconComponent) return null;

  return <IconComponent aria-hidden="true" size={size} focusable="false" />;
}

function StatusBadge({ status, statuses }) {
  const normalizedStatus = statuses.includes(status) ? status : "unknown";

  return (
    <span className={`orders-status orders-status-${normalizedStatus}`}>
      <span className="orders-status-dot" />
      {status || "Unknown"}
    </span>
  );
}

function OrderDetailsModal({ order, logic }) {
  if (!order) return null;

  const {
    setSelectedOrder,
    getCustomerName,
    getCustomerPhone,
    getCustomerEmail,
    getItemName,
    getItemUnitPrice,
    getItemLineTotal,
    getOrderSubtotal,
    getOrderTotal,
    formatMoney,
    formatDate,
    statuses,
  } = logic;

  const onClose = () => setSelectedOrder(null);

  return (
    <div className="orders-modal-backdrop" onClick={onClose}>
      <section
        className="orders-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="orders-modal-header">
          <div>
            <span className="orders-eyebrow">ORDER DETAILS</span>
            <h2 id="order-details-title">
              {order.orderNumber || "Order details"}
            </h2>
          </div>

          <button
            type="button"
            className="orders-modal-close"
            onClick={onClose}
            aria-label="Close order details"
          >
            <Icon name="close" />
          </button>
        </header>

        <div className="orders-modal-content">
          <div className="orders-detail-grid">
            <div>
              <span>Order status</span>
              <strong>
                <StatusBadge status={order.status} statuses={statuses} />
              </strong>
            </div>

            <div>
              <span>Order date</span>
              <strong>{formatDate(order.createdAt)}</strong>
            </div>

            <div>
              <span>Customer name</span>
              <strong>{getCustomerName(order)}</strong>
            </div>

            <div>
              <span>Customer phone</span>
              <strong>{getCustomerPhone(order) || "Not available"}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{getCustomerEmail(order) || "Not available"}</strong>
            </div>

            <div className="orders-detail-address">
              <span>Shipping address</span>
              <strong>
                {order.shippingAddress || "No shipping address provided"}
              </strong>
            </div>
          </div>

          <h3 className="orders-detail-section-title">Order items</h3>

          <div className="orders-detail-items">
            {(order.items || []).map((item, index) => (
              <div
                className="orders-detail-item"
                key={`${item.itemId || getItemName(item)}-${index}`}
              >
                <div>
                  <strong>{getItemName(item)}</strong>
                  <span>
                    Quantity: {item.quantity || 0}
                    {" · "}
                    Unit price: {formatMoney(getItemUnitPrice(item))}
                  </span>
                </div>

                <strong>{formatMoney(getItemLineTotal(item))}</strong>
              </div>
            ))}
          </div>

          <div className="orders-detail-total">
            <span>Products subtotal</span>
            <strong>{formatMoney(getOrderSubtotal(order))}</strong>
          </div>

          <div className="orders-detail-total">
            <span>Shipping cost</span>
            <strong>{formatMoney(order.shippingCost)}</strong>
          </div>

          <div className="orders-detail-total">
            <span>Total amount</span>
            <strong>{formatMoney(getOrderTotal(order))}</strong>
          </div>

          <h3 className="orders-detail-section-title">Customer note</h3>
          <p>{order.customerNote || "No customer note."}</p>
        </div>

        <footer className="orders-modal-footer">
          <button
            type="button"
            className="orders-close-button"
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

function AddOrderModal({ logic }) {
  const {
    products,
    productsLoading,
    productsError,
    addingOrder,
    closeAddOrder,
    form,
    updateFormField,
    formError,
    filteredProducts,
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

  return (
    <div className="orders-modal-backdrop" onClick={closeAddOrder}>
      <section
        className="orders-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-order-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="orders-modal-header">
          <div>
            <span className="orders-eyebrow">ORDER MANAGEMENT</span>
            <h2 id="add-order-title">Create new order</h2>
          </div>

          <button
            type="button"
            className="orders-modal-close"
            onClick={closeAddOrder}
            disabled={addingOrder}
            aria-label="Close add order form"
          >
            <Icon name="close" />
          </button>
        </header>

        <form onSubmit={submitNewOrder}>
          <div className="orders-modal-content">
            <h3 className="orders-detail-section-title">Customer details</h3>

            <div className="orders-form-grid">
              <label className="orders-form-field">
                <span>Customer name *</span>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(event) =>
                    updateFormField("customerName", event.target.value)
                  }
                  placeholder="Enter customer's full name"
                  maxLength={120}
                  autoComplete="name"
                  required
                  disabled={addingOrder}
                />
              </label>

              <label className="orders-form-field">
                <span>Customer phone *</span>
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(event) =>
                    updateFormField("customerPhone", event.target.value)
                  }
                  placeholder="Enter phone number"
                  maxLength={30}
                  autoComplete="tel"
                  required
                  disabled={addingOrder}
                />
              </label>
            </div>

            <h3 className="orders-detail-section-title">Add products</h3>

            {productsLoading ? (
              <p>Loading available products…</p>
            ) : productsError ? (
              <p role="alert">{productsError}</p>
            ) : products.length === 0 ? (
              <p>No active products were found.</p>
            ) : (
              <>
                <div className="orders-form-grid">
                  <label className="orders-form-field">
                    <span>Search product</span>

                    <div className="orders-product-search">
                      <Icon name="search" />
                      <input
                        type="search"
                        value={form.productSearch}
                        onChange={(event) =>
                          updateFormField("productSearch", event.target.value)
                        }
                        placeholder="Search by product name or ID..."
                        aria-label="Search products"
                        disabled={addingOrder}
                      />
                    </div>
                  </label>

                  <label className="orders-form-field">
                    <span>Product</span>

                    <select
                      value={form.productId}
                      onChange={(event) =>
                        updateFormField("productId", event.target.value)
                      }
                      disabled={addingOrder}
                    >
                      <option value="">Choose a product</option>

                      {filteredProducts.map((product) => (
                        <option
                          key={product.itemId}
                          value={String(product.itemId)}
                          disabled={getStockForProduct(product) < 1}
                        >
                          {product.name || `Item ${product.itemId}`} —{" "}
                          {formatMoney(getProductPrice(product))} · Stock:{" "}
                          {getStockForProduct(product)}
                        </option>
                      ))}
                    </select>

                    {filteredProducts.length === 0 && (
                      <small className="orders-product-search-empty">
                        No products match your search.
                      </small>
                    )}
                  </label>

                  <label className="orders-form-field">
                    <span>Quantity</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.quantity}
                      onChange={(event) =>
                        updateFormField("quantity", event.target.value)
                      }
                      disabled={addingOrder}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="orders-details-button"
                  onClick={handleAddItem}
                  disabled={addingOrder}
                >
                  <Icon name="plus" />
                  Add item
                </button>
              </>
            )}

            {form.items.length > 0 && (
              <>
                <h3 className="orders-detail-section-title">
                  Selected items ({form.items.length})
                </h3>

                <div className="orders-detail-items">
                  {form.items.map((item) => (
                    <div className="orders-detail-item" key={item.itemId}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{formatMoney(item.unitPrice)} per unit</span>

                        <label className="orders-form-field">
                          <span>Quantity</span>
                          <input
                            aria-label={`Quantity for ${item.name}`}
                            type="number"
                            min="1"
                            max={item.availableStock}
                            value={item.quantity}
                            disabled={addingOrder}
                            onChange={(event) =>
                              changeItemQuantity(
                                item.itemId,
                                event.target.value,
                              )
                            }
                          />
                        </label>
                      </div>

                      <div>
                        <strong>
                          {formatMoney(item.unitPrice * item.quantity)}
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

            <h3 className="orders-detail-section-title">Delivery details</h3>

            <label className="orders-form-field">
              <span>Shipping address *</span>
              <textarea
                rows="3"
                maxLength={1000}
                value={form.shippingAddress}
                onChange={(event) =>
                  updateFormField("shippingAddress", event.target.value)
                }
                placeholder="Enter the delivery address"
                autoComplete="street-address"
                required
                disabled={addingOrder}
              />
            </label>

            <div className="orders-form-grid">
              <label className="orders-form-field">
                <span>Shipping cost (EGP) *</span>
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
            </div>

            <label className="orders-form-field">
              <span>Customer note (optional)</span>
              <textarea
                rows="3"
                maxLength={2000}
                value={form.customerNote}
                onChange={(event) =>
                  updateFormField("customerNote", event.target.value)
                }
                placeholder="Additional instructions"
                disabled={addingOrder}
              />
            </label>

            <h3 className="orders-detail-section-title">Order summary</h3>

            <div className="orders-detail-total">
              <span>Products subtotal</span>
              <strong>{formatMoney(estimatedSubtotal)}</strong>
            </div>

            <div className="orders-detail-total">
              <span>Shipping cost</span>
              <strong>{formatMoney(validShippingCost)}</strong>
            </div>

            <div className="orders-detail-total">
              <span>Estimated total</span>
              <strong>{formatMoney(estimatedTotal)}</strong>
            </div>

            <p>
              Prices and stock availability are verified by the server when the
              order is created. The final total may differ if product prices or
              stock have changed.
            </p>

            {formError && (
              <p role="alert" className="orders-form-error">
                {formError}
              </p>
            )}
          </div>

          <footer className="orders-modal-footer">
            <button
              type="button"
              className="orders-reset-button"
              onClick={closeAddOrder}
              disabled={addingOrder}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="orders-close-button"
              disabled={
                addingOrder ||
                form.items.length === 0 ||
                productsLoading ||
                Boolean(productsError)
              }
            >
              {addingOrder ? "Creating order…" : "Create order"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default function Orders() {

  const logic = useOrdersLogic();

  const {
    statuses,
    filteredOrders,
    stats,
    statusCounts,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    selectedOrder,
    setSelectedOrder,
    clearFilters,
    hasActiveFilters,
    loading,
    error,
    setError,
    products,
    productsLoading,
    productsError,
    addingOrder,
    successMessage,
    setSuccessMessage,
    refreshOrders,
    showAddOrder,
    openAddOrder,
    getCustomerName,
    getCustomerPhone,
    getCustomerEmail,
    getItemCount,
    formatMoney,
    formatDate,
  } = logic;


  const statCards = [
    {
      label: "Total orders",
      value: stats.total,
      caption: "All orders",
      className: "orders-stat-total",
    },
    {
      label: "Pending",
      value: stats.pending,
      caption: "Awaiting processing",
      className: "orders-stat-pending",
    },
    {
      label: "In progress",
      value: stats.inProgress,
      caption: "Confirmed or processing",
      className: "orders-stat-progress",
    },
    {
      label: "Shipped",
      value: stats.shipped,
      caption: "On the way",
      className: "orders-stat-shipped",
    },
    {
      label: "Delivered",
      value: stats.delivered,
      caption: "Successfully delivered",
      className: "orders-stat-delivered",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      caption: "Cancelled orders",
      className: "orders-stat-cancelled",
    },
    {
      label: "Revenue",
      value: formatMoney(stats.revenue),
      caption: "Excluding cancelled orders",
      className: "orders-stat-revenue",
    },
  ];

  return (
    <section className="orders-page">
      <ContentHeader
        title="Orders"
        subTitle="Manage orders, track their status, and create new orders."
        action={
          <button
            type="button"
            className="orders-close-button"
            onClick={openAddOrder}
          >
            <Icon name="plus" />
            Add Order
          </button>
        }
      />

      {error && (
        <div className="orders-message orders-message-error" role="alert">
          <span>{error}</span>

          <button
            type="button"
            className="orders-details-button"
            onClick={refreshOrders}
          >
            Retry
          </button>

          <button
            type="button"
            className="orders-message-dismiss"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="orders-message orders-message-success" role="status">
          <span>{successMessage}</span>

          <button
            type="button"
            className="orders-message-dismiss"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      <section className="orders-stats" aria-label="Order statistics">
        {statCards.map((stat) => (
          <article
            className={`orders-stat-card ${stat.className}`}
            key={stat.label}
          >
            <span className="orders-stat-label">{stat.label}</span>
            <strong>{stat.value}</strong>
            <span className="orders-stat-caption">{stat.caption}</span>
          </article>
        ))}
      </section>

      <section className="orders-panel">
        <header className="orders-panel-header">
          <div>
            <h2>All orders</h2>
            <p>Review orders from the connected database.</p>
          </div>

          <span className="orders-stat-caption">
            {filteredOrders.length} result
            {filteredOrders.length === 1 ? "" : "s"}
          </span>
        </header>

        <div className="orders-toolbar">
          <label className="orders-search">
            <Icon name="search" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer, or product…"
              aria-label="Search orders"
            />
          </label>

          <button
            type="button"
            className="orders-reset-button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>

        <div className="orders-status-tabs" aria-label="Filter by status">
          {["all", ...statuses].map((status) => {
            const isActive = statusFilter === status;

            return (
              <button
                key={status}
                type="button"
                className={[
                  "orders-status-tab",
                  status !== "all" ? `tab-${status}` : "",
                  isActive ? "is-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setStatusFilter(status)}
                aria-pressed={isActive}
              >
                {status === "all"
                  ? "All"
                  : status.charAt(0).toUpperCase() + status.slice(1)}

                <span className="orders-tab-count">
                  {statusCounts[status] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="orders-empty" role="status">
            <span className="orders-empty-icon">
              <Icon name="orders" />
            </span>
            <h3>Loading orders</h3>
            <p>Please wait while your orders are loaded.</p>
          </div>
        ) : error && filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <span className="orders-empty-icon">
              <Icon name="orders" />
            </span>
            <h3>Unable to load orders</h3>
            <p>Check your API connection and account permissions.</p>

            <button
              type="button"
              className="orders-reset-button"
              onClick={refreshOrders}
            >
              Try again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <span className="orders-empty-icon">
              <Icon name="orders" />
            </span>

            <h3>{hasActiveFilters ? "No matching orders" : "No orders yet"}</h3>

            <p>
              {hasActiveFilters
                ? "Try changing your search or status filter."
                : "Create an order using the Add Order button."}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                className="orders-reset-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order._id || order.id || order.orderNumber || index}>
                    <td>
                      <span className="orders-number">
                        {order._id.slice(0,6)}
                      </span>
                    </td>

                    <td>
                      <div className="orders-customer">
                        <span className="orders-customer-name">
                          {getCustomerName(order)}
                        </span>
                      </div>
                    </td>

                    <td>{formatDate(order.createdAt)}</td>

                    <td>
                      <span className="orders-items-count">
                        {getItemCount(order)}
                      </span>
                    </td>

                    <td className="orders-total">
                      {formatMoney(order.totalAmount)}
                    </td>

                    <td>
                      <StatusBadge status={order.status} statuses={statuses} />
                    </td>

                    <td>
                      <button
                        type="button"
                        className="orders-details-button"
                        onClick={() => setSelectedOrder(order)}
                        aria-label={`View order ${order.orderNumber || ""}`}
                      >
                        <Icon name="eye" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="orders-panel-footer">
          <span>Live data from the Orders API</span>
          <span>
            {loading
              ? "Loading…"
              : `${filteredOrders.length} order${
                  filteredOrders.length === 1 ? "" : "s"
                } shown`}
          </span>
        </footer>
      </section>

      {showAddOrder && <AddOrderModal logic={logic} />}

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} logic={logic} />
      )}
    </section>
  );
}
