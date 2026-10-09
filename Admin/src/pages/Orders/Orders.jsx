
import "./Orders.css";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ContentHeader from "../../Components/ContentHeader/ContentHeader.jsx";
import { useOrdersLogic } from "../../UI_Logic/OrdersLogic.jsx";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_TABS = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })} EGP`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCustomerName(order) {
  if (typeof order.customer === "object" && order.customer !== null) {
    return order.customer.name || "Unknown Customer";
  }

  return "Customer";
}

function getCustomerEmail(order) {
  if (typeof order.customer === "object" && order.customer !== null) {
    return order.customer.email || "";
  }

  return "";
}

function getItemCount(order) {
  return (order.items || []).reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`orders-status orders-status-${status || "unknown"}`}>
      <span className="orders-status-dot" />
      {STATUS_LABELS[status] || status || "Unknown"}
    </span>
  );
}

export default function Orders() {
  const { user } = useOutletContext();
  const [sessionTime, setSessionTime] = useState("");

  useEffect(() => {
    setSessionTime(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  const {
    orders,
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
  } = useOrdersLogic();

  return (
    <main className="orders-page">
      <ContentHeader
        title="Orders"
        subTitle="Track customer orders, fulfillment, and delivery status."
        user={user}
        sessionTime={sessionTime}
      />

      <section className="orders-stats" aria-label="Order statistics">
        <article className="orders-stat-card orders-stat-total">
          <span className="orders-stat-label">Total Orders</span>
          <strong>{stats.total.toLocaleString("en-US")}</strong>
          <span className="orders-stat-caption">All recorded orders</span>
        </article>

        <article className="orders-stat-card orders-stat-pending">
          <span className="orders-stat-label">Pending</span>
          <strong>{stats.pending.toLocaleString("en-US")}</strong>
          <span className="orders-stat-caption">Awaiting review</span>
        </article>

        <article className="orders-stat-card orders-stat-progress">
          <span className="orders-stat-label">In Progress</span>
          <strong>{stats.inProgress.toLocaleString("en-US")}</strong>
          <span className="orders-stat-caption">Confirmed or processing</span>
        </article>

        <article className="orders-stat-card orders-stat-shipped">
          <span className="orders-stat-label">Shipped</span>
          <strong>{stats.shipped.toLocaleString("en-US")}</strong>
          <span className="orders-stat-caption">On the way</span>
        </article>

        <article className="orders-stat-card orders-stat-delivered">
          <span className="orders-stat-label">Delivered</span>
          <strong>{stats.delivered.toLocaleString("en-US")}</strong>
          <span className="orders-stat-caption">Successfully delivered</span>
        </article>

        <article className="orders-stat-card orders-stat-cancelled">
          <span className="orders-stat-label">Cancelled</span>
          <strong>{stats.cancelled.toLocaleString("en-US")}</strong>
          <span className="orders-stat-caption">Cancelled orders</span>
        </article>

        <article className="orders-stat-card orders-stat-revenue">
          <span className="orders-stat-label">Order Value</span>
          <strong>{formatMoney(stats.revenue)}</strong>
          <span className="orders-stat-caption">
            Excluding cancelled orders
          </span>
        </article>
      </section>

      <section className="orders-panel">
        <header className="orders-panel-header">
          <div>
            <h2>All Orders</h2>
            <p>
              Showing {filteredOrders.length.toLocaleString("en-US")} of{" "}
              {orders.length.toLocaleString("en-US")} orders
            </p>
          </div>
        </header>

        <div className="orders-toolbar">
          <label className="orders-search">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="orders-search-icon"
            >
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.5 4.5" />
            </svg>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order number, customer, or email..."
              aria-label="Search orders"
            />
          </label>

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

        <div
          className="orders-status-tabs"
          role="tablist"
          aria-label="Filter orders by status"
        >
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={statusFilter === tab.value}
              className={`orders-status-tab ${
                statusFilter === tab.value ? "is-active" : ""
              } ${tab.value !== "all" ? `tab-${tab.value}` : ""}`}
              onClick={() => setStatusFilter(tab.value)}
            >
              <span>{tab.label}</span>
              <span className="orders-tab-count">
                {statusCounts[tab.value] || 0}
              </span>
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <span className="orders-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.5 4.5" />
              </svg>
            </span>
            <h3>No orders found</h3>
            <p>Try another search term or select a different status.</p>

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
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order._id || order.orderNumber || index}>
                    <td>
                      <span className="orders-number">
                        {order.orderNumber || "—"}
                      </span>
                    </td>

                    <td>
                      <div className="orders-customer">
                        <span className="orders-customer-avatar">
                          {getCustomerName(order).slice(0, 1).toUpperCase()}
                        </span>

                        <span className="orders-customer-info">
                          <strong>{getCustomerName(order)}</strong>
                          <small>{getCustomerEmail(order) || "—"}</small>
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="orders-items-count">
                        {getItemCount(order).toLocaleString("en-US")}
                      </span>
                      <span className="orders-items-label"> items</span>
                    </td>

                    <td>
                      <strong className="orders-total">
                        {formatMoney(order.totalAmount)}
                      </strong>
                    </td>

                    <td>{formatDate(order.createdAt)}</td>

                    <td>
                      <StatusBadge status={order.status} />
                    </td>

                    <td>
                      <button
                        type="button"
                        className="orders-details-button"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View details
                        <span aria-hidden="true">→</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="orders-panel-footer">
          <span>Demo data — not connected to the database</span>
          <span>{filteredOrders.length.toLocaleString("en-US")} results</span>
        </footer>
      </section>

      {selectedOrder && (
        <div
          className="orders-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <section
            className="orders-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="orders-modal-title"
          >
            <header className="orders-modal-header">
              <div>
                <span className="orders-eyebrow">ORDER DETAILS</span>
                <h2 id="orders-modal-title">
                  {selectedOrder.orderNumber || "Order details"}
                </h2>
              </div>

              <button
                type="button"
                className="orders-modal-close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </header>

            <div className="orders-modal-content">
              <div className="orders-detail-grid">
                <div>
                  <span>Customer</span>
                  <strong>{getCustomerName(selectedOrder)}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{getCustomerEmail(selectedOrder) || "—"}</strong>
                </div>

                <div>
                  <span>Order Date</span>
                  <strong>{formatDate(selectedOrder.createdAt)}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    <StatusBadge status={selectedOrder.status} />
                  </strong>
                </div>

                <div className="orders-detail-address">
                  <span>Shipping Address</span>
                  <strong>{selectedOrder.shippingAddress || "—"}</strong>
                </div>

                <div className="orders-detail-address">
                  <span>Customer Note</span>
                  <strong>{selectedOrder.customerNote || "No notes"}</strong>
                </div>
              </div>

              <h3 className="orders-detail-section-title">Order Items</h3>

              <div className="orders-detail-items">
                {(selectedOrder.items || []).map((item, index) => (
                  <div
                    className="orders-detail-item"
                    key={`${item.itemId}-${index}`}
                  >
                    <div>
                      <strong>{item.name || "Item"}</strong>
                      <span>
                        {formatMoney(item.unitPrice)} ×{" "}
                        {Number(item.quantity || 0).toLocaleString("en-US")}
                      </span>
                    </div>

                    <strong>{formatMoney(item.lineTotal)}</strong>
                  </div>
                ))}
              </div>

              <div className="orders-detail-total">
                <span>Order Total</span>
                <strong>{formatMoney(selectedOrder.totalAmount)}</strong>
              </div>
            </div>

            <footer className="orders-modal-footer">
              <button
                type="button"
                className="orders-close-button"
                onClick={() => setSelectedOrder(null)}
              >
                Close details
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
