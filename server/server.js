require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectMongoDB = require("./config/database");
const healthRoutes = require("./routes/healthRoutes");
const userRoutes = require("./routes/userRoutes");
const availableStockRoutes = require("./routes/availableStockRoutes");
const authRoutes = require("./routes/authRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
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

app.get("/test", (req, res) => {
  console.log("🔥 TEST ROUTE HIT");

  res.status(200).json({
    success: true,
    message: "Server is working",
  });
});

// ======================================================
// Routes
// ======================================================

app.use("/", healthRoutes);

app.use("/api/availableStock", availableStockRoutes);

app.use("/api/catalog", catalogRoutes);

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

// ======================================================
// Error handler
// ======================================================

app.use(errorHandler);

// ======================================================
// Start server
// ======================================================

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);

  console.log(
    `MongoDB configured: ${!!process.env.MONGO_URI}`
  );
});

// ======================================================
// MongoDB
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
    } catch (err) {
      console.error(
        "Error closing MongoDB:",
        err.message
      );
    }

    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("SIGINT", () => shutdown("SIGINT"));