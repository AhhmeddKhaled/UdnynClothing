
import { useMemo, useState } from "react";
import mockOrders from "../pages/order.json";

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

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

export function useOrdersLogic(sourceOrders = mockOrders) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = useMemo(() => {
    if (Array.isArray(sourceOrders)) return sourceOrders;

    if (Array.isArray(sourceOrders?.orders)) {
      return sourceOrders.orders;
    }

    return [];
  }, [sourceOrders]);

  const statusCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      if (VALID_STATUSES.includes(order.status)) {
        counts[order.status] += 1;
      }
    });

    return counts;
  }, [orders]);

  const stats = useMemo(() => {
    const countByStatus = (status) =>
      orders.filter((order) => order.status === status).length;

    const inProgress = orders.filter(
      (order) =>
        order.status === "confirmed" || order.status === "processing"
    ).length;

    const revenue = orders
      .filter((order) => order.status !== "cancelled")
      .reduce(
        (total, order) => total + Number(order.totalAmount || 0),
        0
      );

    return {
      total: orders.length,
      pending: countByStatus("pending"),
      inProgress,
      shipped: countByStatus("shipped"),
      delivered: countByStatus("delivered"),
      cancelled: countByStatus("cancelled"),
      revenue,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders
      .filter((order) => {
        const matchesStatus =
          statusFilter === "all" || order.status === statusFilter;

        const searchableText = [
          order.orderNumber,
          getCustomerName(order),
          getCustomerEmail(order),
          order.shippingAddress,
          ...(order.items || []).map((item) => item.name),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesStatus && searchableText.includes(query);
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        return dateB - dateA;
      });
  }, [orders, search, statusFilter]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  return {
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
    hasActiveFilters: Boolean(search.trim()) || statusFilter !== "all",
  };
}
