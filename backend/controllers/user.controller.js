/**
 * ============================================
 * User Controller – Standardized Error Handling
 * ============================================
 */

const User = require("../models/User");
const { AppError } = require("../middleware/errorMiddleware");

/* -------------------------------------------
   GET ALL USERS (with pagination)
------------------------------------------- */
exports.getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "10");

  if (page <= 0 || limit <= 0) {
    throw new AppError(
      "Page and limit must be positive numbers",
      400,
      "INVALID_PAGINATION"
    );
  }

  const skip = (page - 1) * limit;

  const users = await User.find({})
    .skip(skip)
    .limit(limit)
    .select("-password");

  const total = await User.countDocuments();

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

/* -------------------------------------------
   GET USER BY ID
------------------------------------------- */
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("User ID is required", 400, "USER_ID_MISSING");
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};

/* -------------------------------------------
   CREATE USER
------------------------------------------- */
exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError(
      "Name, email and password are required",
      400,
      "VALIDATION_ERROR",
      { required: ["name", "email", "password"] }
    );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError(
      "Email already registered",
      409,
      "EMAIL_ALREADY_EXISTS"
    );
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

/* -------------------------------------------
   UPDATE USER
------------------------------------------- */
exports.updateUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("User ID missing", 400, "USER_ID_MISSING");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  Object.assign(user, req.body);
  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
};

/* -------------------------------------------
   DELETE USER (SOFT DELETE)
------------------------------------------- */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  user.isDeleted = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
};
