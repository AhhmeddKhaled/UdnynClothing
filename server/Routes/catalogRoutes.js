const express = require("express");

const CatalogProduct = require("../Models/CatalogProduct");

const router = express.Router();

// ======================================================
// GET Catalog
// ======================================================

router.get("/", async (req, res) => {
  try {
    console.log("🔥 GET /api/catalog HIT");

    const products = await CatalogProduct.find({
      isActive: true,
    })
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .lean();

    console.log(
      "📦 Catalog products count:",
      products.length
    );

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(
      "❌ Catalog GET error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "فشل تحميل المنتجات",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message,
    });
  }
});

module.exports = router;