
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
} = require("../Controllers/orderController");

router.use(authenticate);

// إنشاء الأوردر يحتاج صلاحية orders.create.
router.post("/", authorize("orders.create"), createOrder);

// عرض أوردرات العميل المسجل دخوله.
router.get("/my-orders", authorize("orders.read"), getMyOrders);

// عرض كل الأوردرات يحتاج صلاحية orders.read.
router.get("/", authorize("orders.read"), getAllOrders);

// تعديل الحالة يحتاج صلاحية orders.updateStatus.
router.patch(
  "/:id/status",
  authorize("orders.updateStatus"),
  updateOrderStatus
);

// عرض أوردر محدد: يتحقق الـ controller من الملكية أو صلاحية الأدمن.
router.get("/:id", getOrderById);

module.exports = router;