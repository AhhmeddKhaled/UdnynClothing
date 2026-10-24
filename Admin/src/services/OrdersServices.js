const API_URL = import.meta.env.VITE_API_URL;

/*######################
    Start Orders Data
########################*/
export const STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipping",
  "delivered",
  "cancelled",
  "returned",
];

export const GOVERNORATES = [
  "قاهره",
  "جيزة",
  "اسكندريه",
  "قليوبية",
  "البحيرة",
  "مطروح",
  "دمياط",
  "دقهلية",
  "كفر الشيخ",
  "غربيه",
  "المنوفية",
  "شرقيه",
  "بورسعيد",
  "اسماعيلية",
  "سويس",
  "شرم الشيخ",
  "فيوم",
  "بني سويف",
  "منيا",
  "اسيوط",
  "سوهاج",
  "قنا",
  "اقصر",
  "اسوان",
  "بحر الاحمر",
];

export const EMPTY_FORM = {
  customerName: "",
  customerPhone: "",
  productId: "",
  productSearch: "",
  quantity: "1",
  items: [],
  shippingAddress: "",
  governorate: "",
  shippingCost: "0",
  customerNote: "",
};

export const ORDERS_TABLE_DATA = [
  {
    label: "Order",
    key: "_id",
  },
  {
    label: "Customer",
    key: "customerName",
  },
  {
    label: "Status",
    key: "status",
  },
  {
    label: "Items",
    key: "items.length",
  },
  {
    label: "Total",
    key: "totalAmount",
  },
  {
    label: "Date",
    key: "createdAt",
  },
];

export const statusTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipping", "cancelled"],
  shipping: ["returned", "delivered"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export const PriceTypesList = ["Retail", "Wholesale", "Offer"];

/*######################
    End Orders Data
########################*/

/*######################
    Start Orders Logic
########################*/
export function getImageUrl(imagePath) {
  if (!imagePath || typeof imagePath !== "string") {
    return "";
  }

  const path = imagePath.trim();

  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith("/")) {
    return path;
  }

  return `/${path}`;
}

export function StatusTransitions({ status, currentStatus }) {
  const canTransitions = statusTransitions[status].includes(currentStatus);

  const isCurrentStatus = status === currentStatus;

  return { canTransitions, isCurrentStatus };
}

export function getPriceType(price_type) {
  return price_type;
}

export function validateOrderForm(form) {
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

export function getCustomerName(order) {
  return (
    order?.customerName ||
    (order?.customer && typeof order.customer === "object"
      ? order.customer.name || order.customer.fullName
      : "") ||
    "Unknown Customer"
  );
}

export function getCustomerPhone(order) {
  return order?.customerPhone || "";
}

export function getCustomerEmail(order) {
  return order?.customer && typeof order.customer === "object"
    ? order.customer.email || ""
    : "";
}

export function getItemCount(order) {
  return (order?.items || []).reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );
}

export function getItemName(item) {
  return item?.name || item?.productName || `Item ${item?.itemId || ""}`;
}

export function getProductPrice(product) {
  const offerPrice = Number(product?.offerPrice || 0);
  return offerPrice > 0 ? offerPrice : Number(product?.retailPrice || 0);
}

export function getStockForProduct(product) {
  return Number(product?.qty || 0);
}

export function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

export function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatID(id) {
  return id.slice(0,5)
}

export function getOrderSubtotal(order) {
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

export function getItemUnitPrice(item, price_type) {

  switch (price_type) {
    case "offerPrice":
      item.unitPrice = "offerPrice";
      break;
    case "retailPrice":
      item.unitPrice = "retailPrice";
    case "wholesalePrice":
      item.unitPrice = "wholesalePrice";
    default:
      return "type price Invalid"
  }

  if (item?.unitPrice != null) return Number(item.unitPrice);
  if (item?.price != null) return Number(item.price);

  const quantity = Number(item?.quantity || 0);

  return quantity > 0 ? Number(item?.lineTotal || 0) / quantity : 0;
}

export function getItemLineTotal(item) {
  return Number(
    item?.lineTotal ??
      Number(item?.unitPrice ?? item?.price ?? 0) * Number(item?.quantity || 0),
  );
}

export function getOrderTotal(order) {
  if (order?.totalAmount != null) {
    return Number(order.totalAmount);
  }

  return getOrderSubtotal(order) + Number(order?.shippingCost || 0);
}

export async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (${response.status})`,
    );
  }

  return data;
}
/*######################
    End Orders Logic
########################*/