/**
 * ==========================================================
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * ==========================================================
 * - Prevents sensitive data exposure
 * - Centralized error handling
 * - Environment-aware responses
 * - OWASP-compliant
 * - Production ready
 * ==========================================================
 */

const AppError = require('../errors/AppError');
const mongoose = require('mongoose');

/* ==========================================================
   ENVIRONMENT HELPERS
========================================================== */

const isProduction = () => process.env.NODE_ENV === 'production';
const isDevelopment = () => process.env.NODE_ENV === 'development';
const isTest = () => process.env.NODE_ENV === 'test';

/* ==========================================================
   ERROR TYPE CHECKERS
========================================================== */

const isOperationalError = (error) =>
  error.isOperational === true;

const isJWTError = (error) =>
  error.name === 'JsonWebTokenError';

const isJWTExpiredError = (error) =>
  error.name === 'TokenExpiredError';

const isValidationError = (error) =>
  error.name === 'ValidationError';

const isCastError = (error) =>
  error.name === 'CastError';

const isDuplicateKeyError = (error) =>
  error.code === 11000;

const isSyntaxError = (error) =>
  error instanceof SyntaxError && error.status === 400;

/* ==========================================================
   ERROR TRANSFORMERS
========================================================== */

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const message = `Duplicate value for field '${field}'. Please use another value.`;
  return new AppError(message, 409);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please login again.', 401);

const handleSyntaxError = () =>
  new AppError('Invalid JSON payload provided.', 400);

/* ==========================================================
   RESPONSE BUILDERS
========================================================== */

const buildSafeResponse = (err) => ({
  status: err.status || 'error',
  message: err.message || 'Something went wrong'
});

const buildDevResponse = (err) => ({
  status: err.status || 'error',
  message: err.message,
  error: err,
  stack: err.stack
});

/* ==========================================================
   LOGGING (SERVER SIDE ONLY)
========================================================== */

const logError = (error, req) => {
  const logPayload = {
    time: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    user: req.user ? req.user.id : 'Anonymous',
    errorName: error.name,
    message: error.message,
    stack: error.stack
  };

  // ❌ NEVER SEND THIS TO CLIENT
  console.error('🔥 ERROR LOG:', logPayload);
};

/* ==========================================================
   SEND ERROR - DEVELOPMENT
========================================================== */

const sendErrorDev = (err, req, res) => {
  logError(err, req);

  res.status(err.statusCode || 500).json(
    buildDevResponse(err)
  );
};

/* ==========================================================
   SEND ERROR - PRODUCTION
========================================================== */

const sendErrorProd = (err, req, res) => {
  logError(err, req);

  if (isOperationalError(err)) {
    return res.status(err.statusCode).json(
      buildSafeResponse(err)
    );
  }

  // Programming / unknown errors
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

/* ==========================================================
   GLOBAL ERROR HANDLER MIDDLEWARE
========================================================== */

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = Object.assign(err);

  /* -------------------- MongoDB Errors -------------------- */

  if (isCastError(error)) {
    error = handleCastErrorDB(error);
  }

  if (isDuplicateKeyError(error)) {
    error = handleDuplicateFieldsDB(error);
  }

  if (isValidationError(error)) {
    error = handleValidationErrorDB(error);
  }

  /* -------------------- JWT Errors -------------------- */

  if (isJWTError(error)) {
    error = handleJWTError();
  }

  if (isJWTExpiredError(error)) {
    error = handleJWTExpiredError();
  }

  /* -------------------- Syntax Errors -------------------- */

  if (isSyntaxError(error)) {
    error = handleSyntaxError();
  }

  /* -------------------- ENV BASED RESPONSE -------------------- */

  if (isDevelopment()) {
    sendErrorDev(error, req, res);
  } else if (isProduction()) {
    sendErrorProd(error, req, res);
  } else {
    // Test / fallback
    res.status(error.statusCode).json(
      buildSafeResponse(error)
    );
  }
};

/* ==========================================================
   END OF GLOBAL ERROR HANDLER
========================================================== */
