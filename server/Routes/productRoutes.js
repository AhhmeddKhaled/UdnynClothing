const express = require("express");

const {
  getProducts,
  getProduct,
  importProducts,
  uploadProductImage,
} = require("../controllers/productController");

const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const {
  imageUpload,
  excelUpload,
} = require("../middleware/upload");

const router = express.Router();

// Import products from Excel
router.post(
  "/import",
  authenticate,
  authorize("products.create"),
  excelUpload.single("file"),
  importProducts
);

// Get all products
router.get(
  "/",
  authenticate,
  authorize("products.read"),
  getProducts
);

// Get single product
router.get(
  "/:itemId",
  authenticate,
  authorize("products.read"),
  getProduct
);

// Upload product image
router.post(
  "/:itemId/image",
  authenticate,
  authorize("products.update"),
  imageUpload.single("image"),
  uploadProductImage
);

module.exports = router;