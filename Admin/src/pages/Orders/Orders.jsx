import "./Orders.css";
import { useOrdersLogic } from "../../UI_Logic/OrdersLogic.jsx";
import { useNavigate } from "react-router-dom";

import {
  HiOutlineClipboardList,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlinePlus,
} from "react-icons/hi";

import { GoDownload } from "react-icons/go";

import ContentHeader from "../../Components/ContentHeader/ContentHeader.jsx";
import Button from "../../Components/Button/Button";

function Icon({ name, size = 18 }) {
  const icons = {
    orders: HiOutlineClipboardList,
    search: HiOutlineSearch,
    close: HiOutlineX,
    eye: HiOutlineEye,
    trash: HiOutlineTrash,
  };

  const IconComponent = icons[name];

  if (!IconComponent) return null;

  return (
    <IconComponent
      aria-hidden="true"
      size={size}
      focusable="false"
    />
  );
}

function StatusBadge({ status, statuses = [] }) {
  const normalizedStatus = statuses.includes(status)
    ? status
    : "unknown";

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
                <StatusBadge
                  status={order.status}
                  statuses={statuses}
                />
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
              <strong>
                {getCustomerPhone(order) || "Not available"}
              </strong>
            </div>

            <div>
              <span>Email</span>
              <strong>
                {getCustomerEmail(order) || "Not available"}
              </strong>
            </div>

            <div>
              <span>Governorate</span>
              <strong>{order.governorate || "Not specified"}</strong>
            </div>

            <div className="orders-detail-address">
              <span>Shipping address</span>
              <strong>
                {order.shippingAddress ||
                  "No shipping address provided"}
              </strong>
            </div>
          </div>

          <h3 className="orders-detail-section-title">
            Order items
          </h3>

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

                <strong>
                  {formatMoney(getItemLineTotal(item))}
                </strong>
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

          <h3 className="orders-detail-section-title">
            Customer note
          </h3>

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

export default function Orders() {
  const navigate = useNavigate();
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
    exportQPExpresse,
    exportingOrders,
    successMessage,
    setSuccessMessage,
    refreshOrders,
    getCustomerName,
    getItemCount,
    formatMoney,
    formatDate,
    deleteOrder,
    deletingOrderId,
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
          <div className="orders-header-actions">
            <Button
              onClick={exportQPExpresse}
              loading={exportingOrders}
              className="orders-export-btn"
              variant="text"
            >
              <span className="icon">
                <GoDownload />
              </span>
              Export File
            </Button>

            <Button onClick={() => navigate("/orders/new")}>
              <HiOutlinePlus aria-hidden="true" />
              Add Order
            </Button>
          </div>
        }
      />

      {error && (
        <div
          className="orders-message orders-message-error"
          role="alert"
        >
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
        <div
          className="orders-message orders-message-success"
          role="status"
        >
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

      <section
        className="orders-stats"
        aria-label="Order statistics"
      >
        {statCards.map((stat) => (
          <article
            className={`orders-stat-card ${stat.className}`}
            key={stat.label}
          >
            <span className="orders-stat-label">
              {stat.label}
            </span>

            <strong>{stat.value}</strong>

            <span className="orders-stat-caption">
              {stat.caption}
            </span>
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

        <div
          className="orders-status-tabs"
          aria-label="Filter by status"
        >
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
                  : status.charAt(0).toUpperCase() +
                    status.slice(1)}

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
            <p>
              Check your API connection and account permissions.
            </p>

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

            <h3>
              {hasActiveFilters
                ? "No matching orders"
                : "No orders yet"}
            </h3>

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
                {filteredOrders.map((order, index) => {
                  const orderId = order._id || order.id;
                  const isDeleting = deletingOrderId === orderId;

                  return (
                    <tr
                      key={
                        orderId || order.orderNumber || index
                      }
                    >
                      <td>
                        <span className="orders-number">
                          {String(
                            order._id ||
                              order.id ||
                              order.orderNumber ||
                              "",
                          ).slice(0, 6)}
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
                        <StatusBadge
                          status={order.status}
                          statuses={statuses}
                        />
                      </td>

                      <td>
                        <div className="orders-row-actions">
                          <button
                            type="button"
                            className="orders-details-button"
                            onClick={() =>
                              setSelectedOrder(order)
                            }
                            aria-label={`View order ${
                              order.orderNumber || ""
                            }`}
                          >
                            <Icon name="eye" />
                            Details
                          </button>

                          <button
                            type="button"
                            className="orders-delete-button"
                            onClick={() => deleteOrder(order)}
                            disabled={Boolean(deletingOrderId)}
                            aria-label={`Delete order ${
                              order.orderNumber || ""
                            }`}
                          >
                            <Icon name="trash" />
                            {isDeleting
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          logic={logic}
        />
      )}
    </section>
  );
}