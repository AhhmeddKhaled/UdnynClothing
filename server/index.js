require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("UdnynClothing Server is working!");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
    mongoConfigured: !!process.env.MONGO_URI,
  });
});

// ======================================================
// تشغيل السيرفر أولًا
// ======================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);

  // نحاول الاتصال بـ MongoDB بعد تشغيل السيرفر
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing!");
    return;
  }

  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
    });
});