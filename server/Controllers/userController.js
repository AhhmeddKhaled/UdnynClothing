const bcrypt = require("bcryptjs");

const User = require("../Models/User");
const Role = require("../Models/Role");

// Create User
async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const roleName = role || "customer";

    const userRole = await Role.findOne({
      name: roleName,
    });

    if (!userRole) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole._id,
    });

    const createdUser = await User.findById(user._id)
      .select("-password")
      .populate("role", "name");

    res.status(201).json({
      success: true,
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role.name,
        isActive: createdUser.isActive,
        createdAt: createdUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get All Users
async function getUsers(req, res, next) {
  try {
    const users = await User.find()
      .select("-password")
      .populate("role", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
}

// Get Single User
async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("role", "name");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

// Update User
async function updateUser(req, res, next) {
  try {
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (email !== undefined) {
      user.email = email.toLowerCase().trim();
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    if (role !== undefined) {
      const userRole = await Role.findOne({
        name: role,
      });

      if (!userRole) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      user.role = userRole._id;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate("role", "name");

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

// Delete User
async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};