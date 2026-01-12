/**
 * =========================================
 * Centralized Error Handling Middleware
 * Timeout + Large File Safe
 * =========================================
 */

const logger = require("../utils/logger");

/* ------------------
   ❌ 404 - Route Not Found
------------------ */
const notFound = (req, res, next) => {
  logger.warn("Route Not Found", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
};

/* ------------------
   ❌ GLOBAL ERROR HANDLER
------------------ */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errorCode = err.code || "INTERNAL_SERVER_ERROR";

  /* ==============================
     ⏱️ REQUEST TIMEOUT
  ============================== */
  if (err.code === "ETIMEDOUT") {
    statusCode = 408;
    errorCode = "REQUEST_TIMEOUT";
    message = "Request timed out while processing large file";
  }

  /* ==============================
     📦 PAYLOAD TOO LARGE
  ============================== */
  if (err.type === "entity.too.large") {
    statusCode = 413;
    errorCode = "PAYLOAD_TOO_LARGE";
    message = "Uploaded file is too large";
  }

  /* ==============================
     🟡 MONGOOSE ERRORS
  ============================== */
  if (err.name === "ValidationError") {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (err.name === "CastError") {
    statusCode = 400;
    errorCode = "INVALID_ID";
    message = "Invalid resource ID format";
  }

  /* ==============================
     🔐 JWT ERRORS
  ============================== */
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    errorCode = "INVALID_TOKEN";
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    errorCode = "TOKEN_EXPIRED";
    message = "Authentication token expired";
  }

  /* ==============================
     📁 MULTER / FILE UPLOAD ERRORS
  ============================== */
  if (err.name === "MulterError") {
    statusCode = 400;
    errorCode = "FILE_UPLOAD_ERROR";

    if (err.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      message = "File size exceeds allowed limit";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Invalid or unexpected file type";
    } else {
      message = err.message;
    }
  }

  /* ==============================
     🔌 CLIENT ABORT (UPLOAD CANCEL)
  ============================== */
  if (err.code === "ECONNABORTED") {
    statusCode = 499;
    errorCode = "CLIENT_ABORTED";
    message = "Client aborted the request during upload";
  }

  /* ==============================
     🔥 LOG (NO SILENT FAILURES)
  ============================== */
  logger.error("Application Error", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    errorCode,
    message,
    user: req.user ? req.user.id : "anonymous",
    stack: err.stack,
  });

  /* ==============================
     ❌ STANDARD RESPONSE
  ============================== */
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

module.exports = {
  notFound,
  errorHandler,
};
