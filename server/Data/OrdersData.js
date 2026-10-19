const VALID_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipping",
  "delivered",
  "cancelled",
  "returned",
];

const EGYPTIAN_GOVERNORATES = [
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

const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipping", "cancelled"],
  shipping: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

module.exports = {
  ALLOWED_TRANSITIONS,
  EGYPTIAN_GOVERNORATES,
  VALID_STATUSES,
};
