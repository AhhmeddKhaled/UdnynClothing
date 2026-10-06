const express = require("express");

const {
  getCatalogProducts,
  getCatalogProduct,
  createCatalogProduct,
  updateCatalogProduct,
  deleteCatalogProduct,
} = require("../controllers/catalogController");

const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

// ======================================================
// Public Catalog
// العميل يقدر يشوف المنتجات بدون Login
// ======================================================

router.get(
  "/",
  getCatalogProducts
);

router.get(
  "/:id",
  getCatalogProduct
);

// ======================================================
// Admin Catalog Management
// لازم Login + Permission
// ======================================================

router.post(
  "/",
  authenticate,
  authorize("products.create"),
  createCatalogProduct
);

router.put(
  "/:id",
  authenticate,
  authorize("products.update"),
  updateCatalogProduct
);

router.delete(
  "/:id",
  authenticate,
  authorize("products.delete"),
  deleteCatalogProduct
);

module.exports = router;