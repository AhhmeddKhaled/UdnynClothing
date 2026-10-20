const API_URL = import.meta.env.VITE_API_URL;

// Orders Data
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

// Logic Methods
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
export const statusTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipping", "cancelled"],
  shipping: ["returned", "delivered"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};
export function StatusTransitions({ status, currentStatus }) {
  const canTransitions = statusTransitions[status].includes(currentStatus);

  const isCurrentStatus = status === currentStatus;

  return { canTransitions, isCurrentStatus };
}
export function PriceType(price_type) {
  return price_type;
}
