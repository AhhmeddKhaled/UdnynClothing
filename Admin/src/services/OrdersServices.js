const API_URL = import.meta.env.VITE_API_URL;

export const STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipping",
  "delivered",
  "cancelled",
  "returned"
];

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

export function StatusTransitions({status, currentStatus}) {
  const canTransitions = statusTransitions[status].includes(currentStatus);

  const isCurrentStatus = status === currentStatus;


  return {canTransitions, isCurrentStatus};
}
