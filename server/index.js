const express = require("express");

const app = express();

const PORT = process.env.PORT || 8080;

console.log("=== UDNYN TEST SERVER STARTING ===");
console.log("PORT =", PORT);

app.get("/", (req, res) => {
  res.send("UdnynClothing Server is working!");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`=== SERVER RUNNING ON PORT ${PORT} ===`);
});