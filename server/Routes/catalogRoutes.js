const express = require("express");

const router = express.Router();

// ======================================================
// GET Catalog
// ======================================================

router.get("/", (req, res) => {
  console.log("🔥 GET /api/catalog HIT");

  res.status(200).json({
    success: true,
    products: [],
  });
});

module.exports = router;