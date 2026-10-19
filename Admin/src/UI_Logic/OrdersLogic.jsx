import { useCallback, useEffect, useMemo, useState } from "react";
import { authFetch } from "../pages/Login/auth.js";
import { Audio } from "../services/audio.js";

import {
  STATUSES,
  GOVERNORATES,
  EMPTY_FORM,
} from "../services/OrdersServices.js";

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (${response.status})`,
    );
  }

  return data;
}

function getCustomerName(order) {
  return (
    order?.customerName ||
    (order?.customer && typeof order.customer === "object"
      ? order.customer.name || order.customer.fullName
      : "") ||
    "Unknown Customer"
  );
}

function getCustomerPhone(order) {
  return order?.customerPhone || "";
}

function getCustomerEmail(order) {
  return order?.customer && typeof order.customer === "object"
    ? order.customer.email || ""
    : "";
}

function getItemCount(order) {
  return (order?.items || []).reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );
}

function getItemName(item) {
  return item?.name || item?.productName || `Item ${item?.itemId || ""}`;
}

function getProductPrice(product) {
  const offerPrice = Number(product?.offerPrice || 0);
  return offerPrice > 0 ? offerPrice : Number(product?.retailPrice || 0);
}

function getStockForProduct(product) {
  return Number(product?.qty || 0);
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getOrderSubtotal(order) {
  if (order?.subtotal != null) {
    return Number(order.subtotal);
  }

  return (order?.items || []).reduce(
    (total, item) =>
      total +
      Number(
        item.lineTotal ??
          Number(item.unitPrice ?? item.price ?? 0) *
            Number(item.quantity || 0),
      ),
    0,
  );
}

function getItemUnitPrice(item, price_type) {
  if (price_type === "offerPrice") {
    item.unitPrice = "offerPrice";

  } else if (price_type === "retailPrice") {
    item.unitPrice = "retailPrice";
  
  } else if (price_type === "wholesalePrice") {
    item.unitPrice = "wholesalePrice";
  } else {
    return "type price Invalid"
  }
  
  if (item?.unitPrice != null) return Number(item.unitPrice);
  if (item?.price != null) return Number(item.price);

  const quantity = Number(item?.quantity || 0);

  return quantity > 0 ? Number(item?.lineTotal || 0) / quantity : 0;
}

function getItemLineTotal(item) {
  return Number(
    item?.lineTotal ??
      Number(item?.unitPrice ?? item?.price ?? 0) * Number(item?.quantity || 0),
  );
}

function getOrderTotal(order) {
  if (order?.totalAmount != null) {
    return Number(order.totalAmount);
  }

  return getOrderSubtotal(order) + Number(order?.shippingCost || 0);
}

function validateOrderForm(form) {
  const customerName = form.customerName.trim();
  const customerPhone = form.customerPhone.trim();
  const shippingAddress = form.shippingAddress.trim();
  const shippingCost = Number(form.shippingCost);

  if (!form.governorate) {
    return "Please select the governorate.";
  }

  if (!GOVERNORATES.includes(form.governorate)) {
    return "Please select a valid governorate.";
  }

  if (!customerName) {
    return "Please enter the customer's name.";
  }

  if (customerName.length > 120) {
    return "Customer name must not exceed 120 characters.";
  }

  if (!customerPhone) {
    return "Please enter the customer's phone number.";
  }

  if (customerPhone.length > 30) {
    return "Phone number must not exceed 30 characters.";
  }

  if (!shippingAddress) {
    return "Please enter the shipping address.";
  }

  if (shippingAddress.length > 1000) {
    return "Shipping address must not exceed 1000 characters.";
  }

  if (!Array.isArray(form.items) || form.items.length === 0) {
    return "Add at least one product to the order.";
  }

  if (!Number.isFinite(shippingCost) || shippingCost < 0) {
    return "Shipping cost must be zero or greater.";
  }

  if (form.customerNote.trim().length > 2000) {
    return "Customer note must not exceed 2000 characters.";
  }

  for (const item of form.items) {
    if (
      !Number.isSafeInteger(Number(item.quantity)) ||
      Number(item.quantity) < 1
    ) {
      return `Enter a valid quantity for ${item.name}.`;
    }

    if (Number(item.quantity) > Number(item.availableStock)) {
      return `Only ${item.availableStock} unit(s) of ${item.name} are available.`;
    }

    if (item.realImageFile && !(item.realImageFile instanceof File)) {
      return `Invalid actual photo for ${item.name}.`;
    }

    if (item.realImageFile && !item.realImageFile.type.startsWith("image/")) {
      return `The file selected for ${item.name} is not an image.`;
    }
  }

  return "";
}

function changeOrderStatus(id, status) {}
export function useOrdersLogic() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [deletingOrderId, setDeletingOrderId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [addingOrder, setAddingOrder] = useState(false);

  const [error, setError] = useState("");
  const [productsError, setProductsError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showAddOrder, setShowAddOrder] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState("");

  const updateFormField = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
  }, []);

  const setItemRealImage = useCallback((itemId, file) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) =>
        String(item.itemId) === String(itemId)
          ? { ...item, realImageFile: file || null }
          : item,
      ),
    }));

    setFormError("");
  }, []);

  setTimeout(() => {
    setSuccessMessage("");
  }, 10000);

  const refreshOrders = useCallback(async () => {
    const response = await authFetch("/api/orders");
    const data = await readResponse(response);
    const fetchedOrders = Array.isArray(data.orders) ? data.orders : [];

    setOrders(fetchedOrders);
    return fetchedOrders;
  }, []);

  const refreshProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError("");

    try {
      const response = await authFetch("/api/availableStock");
      const data = await readResponse(response);

      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      setProducts([]);
      setProductsError(err.message || "Unable to load products.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await refreshOrders();
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }

    await refreshProducts();
  }, [refreshOrders, refreshProducts]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const addOrder = useCallback(
    async ({
      customerName,
      customerPhone,
      items,
      shippingAddress,
      governorate,
      customerNote = "",
      shippingCost = 0,
    }) => {
      setAddingOrder(true);
      setError("");
      setSuccessMessage("");

      try {
        if (typeof customerName !== "string" || !customerName.trim()) {
          throw new Error("Customer name is required.");
        }

        if (typeof customerPhone !== "string" || !customerPhone.trim()) {
          throw new Error("Customer phone is required.");
        }

        if (typeof shippingAddress !== "string" || !shippingAddress.trim()) {
          throw new Error("Shipping address is required.");
        }

        if (!Array.isArray(items) || items.length === 0) {
          throw new Error("Please add at least one product.");
        }

        const parsedShippingCost = Number(shippingCost);

        if (!Number.isFinite(parsedShippingCost) || parsedShippingCost < 0) {
          throw new Error("Shipping cost must be zero or greater.");
        }

        const formData = new FormData();

        formData.append("customerName", customerName.trim());
        formData.append("customerPhone", customerPhone.trim());
        formData.append("governorate", governorate);
        formData.append("shippingAddress", shippingAddress.trim());
        formData.append("customerNote", customerNote.trim());
        formData.append("shippingCost", String(parsedShippingCost));

        const orderItems = items.map((item) => ({
          itemId: Number(item.itemId),
          quantity: Number(item.quantity),
        }));

        formData.append("items", JSON.stringify(orderItems));

        items.forEach((item) => {
          if (item.realImageFile instanceof File) {
            formData.append(
              `itemImage_${item.itemId}`,
              item.realImageFile,
              item.realImageFile.name,
            );
          }
        });

        const response = await authFetch("/api/orders", {
          method: "POST",
          body: formData,
        });

        const data = await readResponse(response);

        setSuccessMessage(data.message || "Order created successfully.");

        await Promise.all([refreshOrders(), refreshProducts()]);

        return data.order;
      } catch (err) {
        setError(err.message || "Unable to create order.");
        throw err;
      } finally {
        setAddingOrder(false);
      }
    },
    [refreshOrders, refreshProducts],
  );

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };

    for (const status of STATUSES) {
      counts[status] = orders.filter((order) => order.status === status).length;
    }

    return counts;
  }, [orders]);

  const stats = useMemo(() => {
    const countByStatus = (status) =>
      orders.filter((order) => order.status === status).length;

    return {
      total: orders.length,
      pending: countByStatus("pending"),
      inProgress: orders.filter((order) =>
        ["confirmed", "processing"].includes(order.status),
      ).length,
      shipped: countByStatus("shipped"),
      delivered: countByStatus("delivered"),
      cancelled: countByStatus("cancelled"),
      revenue: orders
        .filter((order) => order.status !== "cancelled")
        .reduce((total, order) => total + Number(order.totalAmount || 0), 0),
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders
      .filter((order) => {
        const matchesStatus =
          statusFilter === "all" || order.status === statusFilter;

        const itemNames = (order.items || [])
          .map((item) => item.name || item.productName || "")
          .join(" ");

        const searchableText = [
          order.orderNumber,
          getCustomerName(order),
          getCustomerPhone(order),
          getCustomerEmail(order),
          order.shippingAddress,
          itemNames,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesStatus && searchableText.includes(query);
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
  }, [orders, search, statusFilter]);

  const filteredProducts = useMemo(() => {
    const query = form.productSearch.trim().toLowerCase();

    return products.filter((product) => {
      if (!query) return true;

      return (
        String(product.name || "")
          .toLowerCase()
          .includes(query) ||
        String(product.itemId ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [products, form.productSearch]);

  const selectedProduct = useMemo(
    () =>
      products.find((product) => String(product.itemId) === form.productId) ||
      null,
    [products, form.productId],
  );

  const estimatedSubtotal = useMemo(
    () =>
      form.items.reduce(
        (total, item) => total + Number(item.unitPrice) * Number(item.quantity),
        0,
      ),
    [form.items],
  );

  const parsedShippingCost = Number(form.shippingCost);

  const validShippingCost =
    Number.isFinite(parsedShippingCost) && parsedShippingCost >= 0
      ? parsedShippingCost
      : 0;

  const estimatedTotal = estimatedSubtotal + validShippingCost;

  const openAddOrder = useCallback(() => {
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setError("");
    setSuccessMessage("");
    setShowAddOrder(true);
  }, []);

  const closeAddOrder = useCallback(() => {
    if (addingOrder) return;

    setShowAddOrder(false);
    setFormError("");
  }, [addingOrder]);

  const handleAddItem = useCallback(() => {
    setFormError("");

    if (!selectedProduct) {
      setFormError("Please select a product.");
      return;
    }

    const requestedQuantity = Number(form.quantity);
    const stock = getStockForProduct(selectedProduct);

    if (!Number.isSafeInteger(requestedQuantity) || requestedQuantity < 1) {
      setFormError("Quantity must be a positive whole number.");
      return;
    }

    const itemId = Number(selectedProduct.itemId);
    const existingItem = form.items.find(
      (item) => Number(item.itemId) === itemId,
    );

    const totalRequested =
      requestedQuantity + Number(existingItem?.quantity || 0);

    if (totalRequested > stock) {
      setFormError(`Only ${stock} unit(s) are currently available.`);
      return;
    }

    setForm((current) => {
      const existing = current.items.find(
        (item) => Number(item.itemId) === itemId,
      );

      const nextItems = existing
        ? current.items.map((item) =>
            Number(item.itemId) === itemId
              ? {
                  ...item,
                  quantity: Number(item.quantity) + requestedQuantity,
                }
              : item,
          )
        : [
            ...current.items,
            {
              itemId,
              name: selectedProduct.name || `Item ${itemId}`,
              quantity: requestedQuantity,
              unitPrice: getProductPrice(selectedProduct),
              availableStock: stock,

              // صورة الكتالوج للعرض فقط.
              imagePath: selectedProduct.imagePath || null,

              // صورة الطبيعة تُرفع بشكل مستقل.
              realImageFile: null,
            },
          ];

      return {
        ...current,
        items: nextItems,
        productId: "",
        productSearch: "",
        quantity: "1",
      };
    });
  }, [selectedProduct, form.quantity, form.items]);

  const changeItemQuantity = useCallback(
    (itemId, value) => {
      const nextQuantity = Number(value);
      const item = form.items.find(
        (entry) => String(entry.itemId) === String(itemId),
      );

      if (
        !item ||
        !Number.isSafeInteger(nextQuantity) ||
        nextQuantity < 1 ||
        nextQuantity > Number(item.availableStock)
      ) {
        return;
      }

      setForm((current) => ({
        ...current,
        items: current.items.map((entry) =>
          String(entry.itemId) === String(itemId)
            ? { ...entry, quantity: nextQuantity }
            : entry,
        ),
      }));

      setFormError("");
    },
    [form.items],
  );

  const removeItem = useCallback((itemId) => {
    setForm((current) => ({
      ...current,
      items: current.items.filter(
        (item) => String(item.itemId) !== String(itemId),
      ),
    }));

    setFormError("");
  }, []);

  const submitNewOrder = useCallback(
    async (event) => {
      event?.preventDefault?.();

      const validationError = validateOrderForm(form);

      if (validationError) {
        setFormError(validationError);
        return false;
      }

      setFormError("");

      try {
        await addOrder({
          customerName: form.customerName,
          customerPhone: form.customerPhone,

          // نمرر الملفات للدالة، وهي تفصلها عن بيانات JSON.
          items: form.items,

          shippingAddress: form.shippingAddress,
          governorate: form.governorate,
          customerNote: form.customerNote,
          shippingCost: Number(form.shippingCost),
        });

        setShowAddOrder(false);
        setForm({ ...EMPTY_FORM });

        return true;
      } catch (err) {
        setFormError(err.message || "Could not create this order.");
        return false;
      }
    },
    [form, addOrder],
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
  }, []);

  const hasActiveFilters = Boolean(search.trim()) || statusFilter !== "all";

  const [exportingOrders, setExportingOrders] = useState(false);

  const exportQPExpresse = useCallback(async () => {
    setExportingOrders(true);
    setError("");

    try {
      const response = await authFetch("/api/orders/export/qp-expresse");

      if (!response.ok) {
        let message = "فشل تصدير الأوردرات";

        try {
          const data = await response.json();
          message = data.message || data.error || message;
        } catch {
          // The response may not contain JSON.
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "qp-expresse-orders.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      setSuccessMessage("The data has been successfully exported.");
      Audio("/audio/success.mp3");
    } catch (err) {
      setError(err.message || "فشل تصدير الأوردرات");
    } finally {
      setExportingOrders(false);
    }
  }, []);

  const deleteOrder = async (order) => {
    const orderId = order?._id || order?.id;

    if (!orderId || deletingOrderId) return;

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف الأوردر ${
        order.orderNumber || orderId
      }؟ لا يمكن التراجع عن هذا الإجراء.`,
    );

    if (!confirmed) return;

    setDeletingOrderId(orderId);
    setError("");

    try {
      const response = await authFetch(
        `/api/orders/${encodeURIComponent(orderId)}`,
        { method: "DELETE" },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "فشل حذف الأوردر");
      }

      setSuccessMessage("تم حذف الأوردر بنجاح");
      await refreshOrders();
    } catch (error) {
      setError(error.message || "حدث خطأ أثناء حذف الأوردر");
    } finally {
      setDeletingOrderId(null);
    }
  };

  return {
    statuses: STATUSES,
    orders,
    governorates: GOVERNORATES,
    products,
    loading,
    productsLoading,
    addingOrder,
    error,
    setError,
    productsError,
    successMessage,
    setSuccessMessage,
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
    refreshOrders,
    refreshAll,
    addOrder,

    deleteOrder,
    deletingOrderId,

    showAddOrder,
    openAddOrder,
    closeAddOrder,
    form,
    updateFormField,
    formError,
    filteredProducts,
    selectedProduct,
    estimatedSubtotal,
    validShippingCost,
    estimatedTotal,
    handleAddItem,
    changeItemQuantity,
    removeItem,
    setItemRealImage,
    submitNewOrder,

    exportQPExpresse,
    exportingOrders,

    getCustomerName,
    getCustomerPhone,
    getCustomerEmail,
    getItemCount,
    getItemName,
    getProductPrice,
    getStockForProduct,
    getOrderSubtotal,
    getItemUnitPrice,
    getItemLineTotal,
    getOrderTotal,
    formatMoney,
    formatDate,
  };
}
