const express = require("express");

const {
  getProducts,
  getProduct,
  importProducts,
  uploadProductImage,
} = require("../controllers/availableStockController");

const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const {
  imageUpload,
  excelUpload,
} = require("../middleware/upload");

const router = express.Router();

// Import available stock from Excel
router.post(
  "/import",
  authenticate,
  authorize("products.create"),
  excelUpload.single("file"),
  importProducts
);

// Get all available stock
router.get(
  "/",
  authenticate,
  authorize("products.read"),
  getProducts
);

// Get one available-stock item
router.get(
  "/:itemId",
  authenticate,
  authorize("products.read"),
  getProduct
);

// Upload available-stock image
router.post(
  "/:itemId/image",
  authenticate,
  authorize("products.update"),
  imageUpload.single("image"),
  uploadProductImage
);

module.exports = router;