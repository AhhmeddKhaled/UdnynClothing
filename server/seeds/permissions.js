const Permission = require("../models/Permission");

const permissions = [
  {
    name: "products.read",
    description: "View products",
  },
  {
    name: "products.create",
    description: "Create products",
  },
  {
    name: "products.update",
    description: "Update products",
  },
  {
    name: "products.delete",
    description: "Delete products",
  },

  {
    name: "users.read",
    description: "View users",
  },
  {
    name: "users.create",
    description: "Create users",
  },
  {
    name: "users.update",
    description: "Update users",
  },
  {
    name: "users.delete",
    description: "Delete users",
  },

  {
    name: "orders.read",
    description: "View orders",
  },
  {
    name: "orders.create",
    description: "Create orders",
  },
  {
    name: "orders.update",
    description: "Update orders",
  },
  {
    name: "orders.delete",
    description: "Delete orders",
  },

  {
    name: "availableStock.read",
    description: "View available stock",
  },
  {
    name: "availableStock.import",
    description: "Import available stock",
  },
];

async function seedPermissions() {
  try {
    for (const permission of permissions) {
      await Permission.updateOne(
        { name: permission.name },
        { $set: permission },
        { upsert: true }
      );
    }

    console.log("Permissions seeded successfully");
  } catch (error) {
    console.error("Permission seed error:", error.message);
  }
}

module.exports = seedPermissions;