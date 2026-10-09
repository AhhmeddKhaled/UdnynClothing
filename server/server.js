
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectMongoDB = require("./Config/database");

const healthRoutes = require("./Routes/healthRoutes");
const userRoutes = require("./Routes/userRoutes");
const availableStockRoutes = require("./Routes/availableStockRoutes");
const authRoutes = require("./Routes/authRoutes");
const catalogRoutes = require("./Routes/catalogRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// ======================================================
// Middleware
// ======================================================

app.use(cors());
app.use(express.json());

// ======================================================
// Static uploads
// ======================================================

const uploadDir = path.join(__dirname, "uploads");

app.use("/uploads", express.static(uploadDir));

// ======================================================
// Test route
// ======================================================

app.get("/test", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is working",
    port: PORT,
  });
});

// ======================================================
// Routes
// ======================================================

app.use("/", healthRoutes);

app.use("/api/availableStock", availableStockRoutes);

// Catalog routes: GET, POST and DELETE are defined in catalogRoutes.js
app.use("/api/catalog", catalogRoutes);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// ======================================================
// Temporary catalog POST diagnostic
// ======================================================

// IMPORTANT:
// This route only confirms that this server receives POST requests.
// Remove it after testing. It does NOT create a product.
app.post("/api/catalog", (_req, res) => {
  console.log("CATALOG POST DIAGNOSTIC ROUTE REACHED");

  res.status(200).json({
    success: true,
    message: "POST catalog route reached",
  });
});

// ======================================================
// Error handler
// ======================================================

app.use(errorHandler);

// ======================================================
// Start server
// ======================================================

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("--------------------------------------");
  console.log(`Server running on port ${PORT}`);
  console.log(`Catalog endpoint: http://localhost:${PORT}/api/catalog`);
  console.log(`MongoDB configured: ${Boolean(process.env.MONGO_URI)}`);
  console.log("--------------------------------------");
});

// ======================================================
// MongoDB connection
// ======================================================

connectMongoDB();

// ======================================================
// Graceful shutdown
// ======================================================

async function shutdown(signal) {
  console.log(`${signal} received`);

  server.close(async () => {
    try {
      const mongoose = require("mongoose");
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (error) {
      console.error("Error closing MongoDB:", error.message);
    }

    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));