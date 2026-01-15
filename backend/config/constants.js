/**
 * ==========================================================
 * APPLICATION CONSTANTS
 * Centralized replacement for magic numbers
 * ==========================================================
 */

/* ===================== HTTP ===================== */

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  INTERNAL_SERVER_ERROR: 500
};

/* ===================== AUTH ===================== */

const AUTH = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 64,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME_MINUTES: 15,
  JWT_EXPIRY_MINUTES: 15,
  REFRESH_TOKEN_EXPIRY_DAYS: 7
};

/* ===================== PAGINATION ===================== */

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

/* ===================== RATE LIMIT ===================== */

const RATE_LIMIT = {
  WINDOW_MINUTES: 15,
  MAX_REQUESTS: 100
};

/* ===================== FILE UPLOAD ===================== */

const FILE_UPLOAD = {
  MAX_FILE_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024
};

/* ===================== LOGGING ===================== */

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

/* ===================== CACHE ===================== */

const CACHE = {
  DEFAULT_TTL_SECONDS: 300
};

module.exports = {
  HTTP_STATUS,
  AUTH,
  PAGINATION,
  RATE_LIMIT,
  FILE_UPLOAD,
  LOG_LEVELS,
  CACHE
};
