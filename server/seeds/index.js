const seedPermissions = require("./permissions");
const seedRoles = require("./roles");

async function seedDatabase() {
  await seedPermissions();
  await seedRoles();

  console.log("Database seed completed");
}

module.exports = seedDatabase;
