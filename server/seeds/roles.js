const Role = require("../models/Role");
const Permission = require("../models/Permission");

const roles = {
  customer: [
    "products.read",
    "orders.create",
    "orders.read",
  ],

  editor: [
    "products.read",
    "products.create",
    "products.update",
  ],

  moderator: [
    "products.read",
    "users.read",
    "users.update",
    "orders.read",
    "orders.update",
    "availableStock.read",
  ],

  admin: [
    "products.read",
    "products.create",
    "products.update",
    "products.delete",

    "users.read",
    "users.create",
    "users.update",
    "users.delete",

    "orders.read",
    "orders.create",
    "orders.update",
    "orders.delete",

    "availableStock.read",
  ],

  owner: [
    "products.read",
    "products.create",
    "products.update",
    "products.delete",

    "users.read",
    "users.create",
    "users.update",
    "users.delete",

    "orders.read",
    "orders.create",
    "orders.update",
    "orders.delete",

    "availableStock.read",
  ],
};

async function seedRoles() {
  try {
    for (const [roleName, permissionNames] of Object.entries(roles)) {
      const permissions = await Permission.find({
        name: { $in: permissionNames },
      });

      if (permissions.length !== permissionNames.length) {
        console.warn(
          `Some permissions are missing for role: ${roleName}`
        );
      }

      await Role.updateOne(
        { name: roleName },
        {
          $set: {
            name: roleName,
            permissions: permissions.map(
              (permission) => permission._id
            ),
          },
        },
        { upsert: true }
      );
    }

    console.log("Roles seeded successfully");
  } catch (error) {
    console.error("Role seed error:", error.message);
  }
}

module.exports = seedRoles;