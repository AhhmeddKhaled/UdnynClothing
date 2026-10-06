const express = require("express");

const router = express.Router();

// ======================================================
// GET Catalog
// ======================================================

router.get("/", async (req, res) => {
  try {
    console.log("GET /api/catalog HIT");

    res.status(200).json({
      success: true,
      products: [],
    });
  } catch (error) {
    console.error("Catalog route error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load catalog",
    });
  }
});

module.exports = router;