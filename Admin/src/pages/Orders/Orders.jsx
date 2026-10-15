import "./Orders.css";
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
import { BsCashCoin } from "react-icons/bs";
import { ImCancelCircle } from "react-icons/im";
import { TbTruckDelivery } from "react-icons/tb";
import { VscSessionInProgress } from "react-icons/vsc";
import { SiVirustotal } from "react-icons/si";
import { CiDeliveryTruck } from "react-icons/ci";
import { GoArrowUpRight } from "react-icons/go";

// Import Services
import { changeOrderStatus } from "../../services/changeOrderStatus";

import { useOrdersLogic } from "../../UI_Logic/OrdersLogic.jsx";
import ContentHeader from "../../Components/ContentHeader/ContentHeader.jsx";
import Button from "../../Components/Button/Button";
import Tost from "../../Components/Tost/Tost";
import StatsContainer from "../../Components/StatCard/StatsContainer";
import StatCard from "../../Components/StatCard/StatCard";
import OrderStatus from "../../Components/OrderStatus/OrderStatus";

function StatusBadge({ status, statuses = [] }) {
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
          ></button>
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

            <div>
              <span>Governorate</span>
              <strong>{order.governorate || "Not specified"}</strong>
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

export default function Orders() {
  const navigate = useNavigate();
  const logic = useOrdersLogic();

  changeOrderStatus(25);

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
      title: "Revenue",
      value: formatMoney(stats.revenue),
      description: "Excluding cancelled orders",
      icon: <BsCashCoin />,
      rate: "+26%",
      status: "revenue",
    },
    {
      title: "Total orders",
      value: stats.total,
      description: "All orders",
      icon: <SiVirustotal />,
      rate: "+25%",
      status: "total",
    },
    {
      title: "Pending",
      value: stats.pending,
      description: "Awaiting processing",
      icon: <BsCashCoin />,
      rate: "+12%",
      status: "pending",
    },
    {
      title: "In progress",
      value: stats.inProgress,
      description: "Confirmed or processing",
      icon: <VscSessionInProgress />,
      rate: "-32%",
      rateStatus: false,
      status: "preparing",
    },
    {
      title: "shipping",
      value: stats.shipped,
      description: "On the way",
      icon: <TbTruckDelivery />,
      rate: "+42%",
      status: "shipping",
    },
    {
      title: "delivered",
      value: stats.delivered,
      description: "Successfully delivered",
      icon: <CiDeliveryTruck />,
      rate: "+48%",
      status: "delivered",
    },
    {
      title: "cancelled",
      value: stats.cancelled,
      description: "Cancelled orders",
      icon: <ImCancelCircle />,
      rate: "-22%",
      status: "cancelled",
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
              variant="download"
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

      {successMessage && <Tost status="success" description={successMessage} />}

      <StatsContainer>
        {statCards.map((stat, i) => (
          <StatCard
            key={i}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            status={stat.status}
            icon={stat.icon}
            rate={stat.rate}
            rateStatus={stat.rateStatus}
          />
        ))}
      </StatsContainer>

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
            <span className="orders-empty-icon"></span>

            <h3>Loading orders</h3>
            <p>Please wait while your orders are loaded.</p>
          </div>
        ) : error && filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <span className="orders-empty-icon"></span>

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
            <span className="orders-empty-icon"></span>

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
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th scope="col">Order</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Status</th>
                  <th scope="col">Items</th>
                  <th scope="col">Total</th>
                  <th scope="col">Date</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order, index) => {
                  console.log(order.status);
                  const orderId = order._id || order.id;
                  const isDeleting = deletingOrderId === orderId;

                  return (
                    <tr key={orderId || order.orderNumber || index}>
                      <td>
                        <input type="checkbox" />
                      </td>

                      <td data-label="Order">
                        <span className="orders-number">
                          {String(
                            order._id || order.id || order.orderNumber || "",
                          ).slice(0, 6)}
                        </span>
                      </td>

                      <td data-label="Customer">
                        <div className="orders-customer">
                          <span className="orders-customer-name">
                            {getCustomerName(order)}
                          </span>
                        </div>
                      </td>

                      <td data-label="Status">
                        <OrderStatus status={order.status} />
                      </td>

                      <td data-label="Items">
                        <span className="orders-items-count">
                          {getItemCount(order)}
                        </span>
                      </td>

                      <td data-label="Total" className="orders-total">
                        {formatMoney(order.totalAmount)}
                      </td>

                      <td data-label="Date">{formatDate(order.createdAt)}</td>

                      <td data-label="Actions" className="orders-actions-cell">
                        <div className="orders-row-actions">
                          <Button
                            variant="details"
                            onClick={() => setSelectedOrder(order)}
                            aria-label={`View order ${order.orderNumber || ""}`}
                          ></Button>

                          <Button
                            variant="delet"
                            onClick={() => deleteOrder(order)}
                            disabled={Boolean(deletingOrderId)}
                            aria-label={`Delete order ${
                              order.orderNumber || ""
                            }`}
                          >
                          </Button>
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
        <OrderDetailsModal order={selectedOrder} logic={logic} />
      )}
    </section>
  );
}
