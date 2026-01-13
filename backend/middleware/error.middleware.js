/**
 * ============================================
 * Global Error Middleware (Standardized)
 * ============================================
 */

const logger = require("../utils/logger");

class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = "INTERNAL_ERROR", details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
  }
}

/* ---------- NOT FOUND ---------- */
const notFound = (req, res, next) => {
  next(
    new AppError(
      `Route not found: ${req.originalUrl}`,
      404,
      "ROUTE_NOT_FOUND"
    )
  );
};

/* ---------- GLOBAL ERROR HANDLER ---------- */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: err.message || "Something went wrong",
    errorCode: err.errorCode || "INTERNAL_ERROR",
  };

  // optional debug info (non-prod only)
  if (process.env.NODE_ENV !== "production") {
    response.details = err.details || {};
    response.stack = err.stack;
  }

  logger.error("Global Error Handler", {
    statusCode,
    message: err.message,
    errorCode: err.errorCode,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json(response);
};

module.exports = {
  AppError,
  notFound,
  errorHandler,
};
