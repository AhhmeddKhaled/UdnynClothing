const mongoose = require("mongoose");

async function connectMongoDB() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not configured");
    return;
  }

  try {
    ("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    ("MongoDB connected successfully");
  } catch (err) {
    console.error(
      "MongoDB connection error:",
      err.message
    );
  }
}

// ======================================================
// MongoDB Events
// ======================================================

mongoose.connection.on("connected", () => {
  ("Mongoose: connected");
});

mongoose.connection.on("error", (err) => {
  console.error(
    "Mongoose error:",
    err.message
  );
});

mongoose.connection.on("disconnected", () => {
  ("Mongoose: disconnected");
});

module.exports = connectMongoDB;