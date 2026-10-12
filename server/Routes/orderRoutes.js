const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  exportQPExpresse,
  deleteOrder
} = require("../Controllers/orderController");

router.use(authenticate);

// إنشاء أوردر.
router.post("/", authorize("orders.create"), createOrder);

// أوردرات العميل المسجل دخوله.
router.get("/my-orders", authorize("orders.read"), getMyOrders);

// تصدير أوردرات QP Expresse.
// لازم المسار يكون قبل /:id.
router.get(
  "/export/qp-expresse",
  authorize("orders.read"),
  exportQPExpresse
);

// عرض كل الأوردرات.
router.get("/", authorize("orders.read"), getAllOrders);

// تعديل حالة الأوردر.
router.patch(
  "/:id/status",
  authorize("orders.updateStatus"),
  updateOrderStatus
);

// عرض أوردر محدد.
router.get("/:id", getOrderById);

router.delete("/:id", authorize("orders.delete"), deleteOrder);

module.exports = router;