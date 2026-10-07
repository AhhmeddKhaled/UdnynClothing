require("dotenv").config();
const seedPermissions = require("./permissions");


const seedRoles = require("./roles");
const connectMongoDB = require("../config/database");
async function runSeed() {
  try {
    await connectMongoDB();

    await seedPermissions();
    await seedRoles();

    console.log("Database seed completed successfully");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

runSeed();