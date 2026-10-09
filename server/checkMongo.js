
require("dotenv").config();

const mongoose = require("mongoose");

async function checkMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    const result = await mongoose.connection.db.admin().command({
      hello: 1,
    });

    console.log("MongoDB connection successful.");
    console.log("Replica set:", result.setName || "Not detected");
    console.log("Mongos:", Boolean(result.msg === "isdbgrid"));

    if (result.setName || result.msg === "isdbgrid") {
      console.log("Transactions are supported by this deployment type.");
    } else {
      console.log("Replica set not detected; transactions may not be supported.");
    }
  } catch (error) {
    console.error("MongoDB check failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

checkMongo();