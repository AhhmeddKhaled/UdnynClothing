const express = require("express");

const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

// كل الراوتس هنا محتاجة تسجيل دخول الأول
router.use(authenticate);

router.post("/", authorize("users.create"), createUser);

router.get("/", authorize("users.read"), getUsers);

router.get("/:id", authorize("users.read"), getUser);

router.patch("/:id", authorize("users.update"), updateUser);

router.delete("/:id", authorize("users.delete"), deleteUser);

module.exports = router;