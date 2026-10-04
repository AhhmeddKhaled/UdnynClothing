const mongoose = require("mongoose");

function getServerStatus(req, res) {
  res.json({
    success: true,
    message: "UdnynClothing Server is working!",
    mongoConfigured: !!process.env.MONGO_URI,
    mongoConnected:
      mongoose.connection.readyState === 1,
  });
}

function getHealth(req, res) {
  res.json({
    success: true,
    server: "online",
    mongoConfigured: !!process.env.MONGO_URI,
    mongoConnected:
      mongoose.connection.readyState === 1,
  });
}

module.exports = {
  getServerStatus,
  getHealth,
};