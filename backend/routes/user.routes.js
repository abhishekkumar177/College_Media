/**
 * ============================================
 * User Routes – Middleware Heavy & Secure
 * ============================================
 */

const express = require("express");
const router = express.Router();

/* ----------- Controllers ----------- */
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

/* ----------- Middlewares ----------- */
const auth = require("../middleware/authMiddleware");
const { AppError } = require("../middleware/errorMiddleware");

/**
 * Async handler wrapper
 * (prevents try/catch in every route)
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Role-based access control
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          403,
          "FORBIDDEN"
        )
      );
    }
    next();
  };
};

/**
 * Param validation middleware
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!id || id.length !== 24) {
    return next(
      new AppError(
        "Invalid ID format",
        400,
        "INVALID_OBJECT_ID"
      )
    );
  }

  next();
};

/* ===================================
   ROUTES
=================================== */

/**
 * GET /api/users
 * Admin only
 */
router.get(
  "/",
  auth,
  restrictTo("admin"),
  asyncHandler(getAllUsers)
);

/**
 * GET /api/users/:id
 * Admin + self-access allowed
 */
router.get(
  "/:id",
  auth,
  validateObjectId,
  asyncHandler(getUserById)
);

/**
 * POST /api/users
 * Admin only
 */
router.post(
  "/",
  auth,
  restrictTo("admin"),
  asyncHandler(createUser)
);

/**
 * PATCH /api/users/:id
 * Admin only
 */
router.patch(
  "/:id",
  auth,
  restrictTo("admin"),
  validateObjectId,
  asyncHandler(updateUser)
);

/**
 * DELETE /api/users/:id
 * Admin only (soft delete)
 */
router.delete(
  "/:id",
  auth,
  restrictTo("admin"),
  validateObjectId,
  asyncHandler(deleteUser)
);

module.exports = router;
