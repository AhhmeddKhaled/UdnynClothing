import "./Orders.css";
import { useNavigate } from "react-router-dom";

import { GoDownload } from "react-icons/go";
import { BsCashCoin } from "react-icons/bs";
import { ImCancelCircle } from "react-icons/im";
import { TbTruckDelivery } from "react-icons/tb";
import { VscSessionInProgress } from "react-icons/vsc";
import { SiVirustotal } from "react-icons/si";
import { CiDeliveryTruck } from "react-icons/ci";
import { HiOutlinePlus } from "react-icons/hi";

// Import Services
import { useOrdersLogic } from "../../UI_Logic/OrdersLogic.jsx";
import { ORDERS_TABLE_DATA } from "../../services/OrdersServices.js";

// import Components
import ContentHeader from "../../Components/ContentHeader/ContentHeader.jsx";
import Button from "../../Components/Button/Button";
import StatsContainer from "../../Components/StatCard/StatsContainer";
import StatCard from "../../Components/StatCard/StatCard";
import OrderStatus from "../../Components/OrderStatus/OrderStatus";
import Table from "../../Components/Table/Table.jsx";

import OrderDetailsModal from "../../Components/OrderDetailsModal/OrderDetailsModal";

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
    refreshOrders,
    getCustomerName,
    getItemCount,
    formatMoney,
    formatDate,
    deleteOrder,
    deletingOrderId,
  } = logic;

  console.log(filteredOrders);

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
      title: "Shipping",
      value: stats.shipped,
      description: "On the way",
      icon: <TbTruckDelivery />,
      rate: "+42%",
      status: "shipping",
    },
    {
      title: "Delivered",
      value: stats.delivered,
      description: "Successfully delivered",
      icon: <CiDeliveryTruck />,
      rate: "+48%",
      status: "delivered",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      description: "Cancelled orders",
      icon: <ImCancelCircle />,
      rate: "-22%",
      status: "cancelled",
    },
  ];

  const actions = [
    {
      element: (order) => (
        <Button
          variant="details"
          disabled={Boolean(deletingOrderId)}
          onClick={() => setSelectedOrder(order)}
        ></Button>
      ),
    },
    {
      element: (order) => (
        <Button
          variant="delete"
          onClick={() => deleteOrder(order)}
          disabled={Boolean(deletingOrderId)}
          // loading={deletingOrderId === orderId}
          aria-label={`Delete order ${order.orderNumber || ""}`}
        ></Button>
      ),
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

      <StatsContainer>
        {statCards.map((stat) => (
          <StatCard
            key={stat.status}
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

          <Button
            type="button"
            variant="text"
            radius="radius-md"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
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
            <span className="orders-empty-icon" />

            <h3>Loading orders</h3>
            <p>Please wait while your orders are loaded.</p>
          </div>
        ) : error && filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <span className="orders-empty-icon" />

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
            <span className="orders-empty-icon" />

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
            <Table
              tableHeader={ORDERS_TABLE_DATA}
              tableBody={filteredOrders}
              actions={actions}
            />
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
        <OrderDetailsModal order={selectedOrder} logic={logic}/>
      )}
    </section>
  );
}
