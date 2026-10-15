
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  exportQPExpresse,
  deleteOrder,
} = require("../Controllers/orderController");

// تخزين صور المنتجات الفعلية في مجلد مستقل عن صور الكتالوج.
const orderImagesDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "order-items"
);

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const imageStorage = multer.diskStorage({
  destination(_req, _file, callback) {
    try {
      fs.mkdirSync(orderImagesDirectory, { recursive: true });
      callback(null, orderImagesDirectory);
    } catch (error) {
      callback(error);
    }
  },

  filename(_req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeExtension = /^\.(jpg|jpeg|png|webp|avif)$/.test(extension)
      ? extension
      : "";

    callback(
      null,
      `${Date.now()}-${crypto.randomUUID()}${safeExtension}`
    );
  },
});

const uploadOrderImages = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 100,
    fields: 20,
    fieldSize: 1024 * 1024,
  },
  fileFilter(_req, file, callback) {
    if (!allowedImageTypes.has(file.mimetype)) {
      const error = new Error(
        "Only JPEG, PNG, WebP, and AVIF images are allowed."
      );
      error.statusCode = 400;
      return callback(error);
    }

    callback(null, true);
  },
});

router.use(authenticate);

// إنشاء أوردر يدوي مع استقبال صور المنتجات.
router.post(
  "/",
  authorize("orders.create"),
  uploadOrderImages.any(),
  createOrder
);

router.get("/my-orders", authorize("orders.read"), getMyOrders);

router.get(
  "/export/qp-expresse",
  authorize("orders.read"),
  exportQPExpresse
);

router.get("/", authorize("orders.read"), getAllOrders);

router.patch(
  "/:id/status",
  authorize("orders.updateStatus"),
  updateOrderStatus
);

// عرض أوردر محدد.
router.get("/:id", getOrderById);

// حذف أوردر.
router.delete("/:id", authorize("orders.delete"), deleteOrder);

module.exports = router;
