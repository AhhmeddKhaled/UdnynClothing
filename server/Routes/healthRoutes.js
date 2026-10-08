const express = require("express");

const {
  getServerStatus,
  getHealth,
} = require("../Controllers/healthController");

const router = express.Router();

router.get("/", getServerStatus);

router.get("/health", getHealth);

module.exports = router;