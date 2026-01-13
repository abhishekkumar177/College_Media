/**
 * =====================================================
 * Advanced Rate Limiting Middleware
 * -----------------------------------------------------
 * ✔ Per-IP / Per-User / Per-Token limiting
 * ✔ Redis-backed with in-memory fallback
 * ✔ Different limits for:
 *    - Global APIs
 *    - Auth APIs
 *    - Sensitive APIs (OTP, Search)
 * ✔ Proper 429 responses
 * ✔ Centralized logging
 * ✔ Production hardened
 * =====================================================
 */

const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const redisClient = require("../config/redisClient");
const logger = require("../utils/logger");

/* -----------------------------------------------------
   🧠 REDIS STORE (WITH FALLBACK)
----------------------------------------------------- */
const rateLimitStore = redisClient
  ? new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    })
  : undefined;

/* -----------------------------------------------------
   🧠 KEY GENERATOR
   Priority:
   1. Authenticated user ID
   2. Authorization token
   3. IP address
----------------------------------------------------- */
const keyGenerator = (req) => {
  if (req.user && req.user.id) {
    return `user:${req.user.id}`;
  }

  if (req.headers.authorization) {
    return `token:${req.headers.authorization}`;
  }

  return `ip:${req.ip}`;
};

/* -----------------------------------------------------
   🚨 RATE LIMIT VIOLATION HANDLER
----------------------------------------------------- */
const onLimitReached = (req, res, next, options) => {
  logger.warn("Rate limit exceeded", {
    path: req.originalUrl,
    method: req.method,
    key: keyGenerator(req),
    ip: req.ip,
    limit: options.max,
    windowMs: options.windowMs,
  });
};

/* -----------------------------------------------------
   ❌ COMMON 429 RESPONSE
----------------------------------------------------- */
const rateLimitResponse = (req, res) => {
  return res.status(429).json({
    success: false,
    error: "TOO_MANY_REQUESTS",
    message: "Too many requests. Please try again later.",
  });
};

/* -----------------------------------------------------
   🌍 GLOBAL API LIMITER
   Applies to most APIs
----------------------------------------------------- */
const globalLimiter = rateLimit({
  store: rateLimitStore,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // reasonable global limit
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
  onLimitReached,
});

/* -----------------------------------------------------
   🔐 AUTH LIMITER
   Login / Signup / Token APIs
----------------------------------------------------- */
const authLimiter = rateLimit({
  store: rateLimitStore,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // strict to prevent brute force
  keyGenerator,
  handler: (req, res) => {
    logger.warn("Auth rate limit hit", {
      ip: req.ip,
      user: req.user?.id || null,
      route: req.originalUrl,
    });

    return res.status(429).json({
      success: false,
      error: "AUTH_RATE_LIMIT",
      message:
        "Too many authentication attempts. Please wait and try again.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development', // Skip in development
});

/* -----------------------------------------------------
   🔥 OTP / SENSITIVE ACTION LIMITER
----------------------------------------------------- */
const otpLimiter = rateLimit({
  store: rateLimitStore,
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // very strict
  keyGenerator,
  handler: (req, res) => {
    logger.warn("OTP abuse detected", {
      ip: req.ip,
      key: keyGenerator(req),
    });

    return res.status(429).json({
      success: false,
      error: "OTP_RATE_LIMIT",
      message:
        "Too many OTP requests. Please wait before requesting again.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* -----------------------------------------------------
   🔍 SEARCH / READ HEAVY API LIMITER
----------------------------------------------------- */
const searchLimiter = rateLimit({
  store: rateLimitStore,
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  keyGenerator,
  handler: (req, res) => {
    logger.warn("Search rate limit exceeded", {
      query: req.query,
      ip: req.ip,
    });

    return res.status(429).json({
      success: false,
      error: "SEARCH_RATE_LIMIT",
      message: "Too many search requests. Slow down.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* -----------------------------------------------------
   👑 ADMIN LIMITER (RELAXED)
----------------------------------------------------- */
const adminLimiter = rateLimit({
  store: rateLimitStore,
  windowMs: 15 * 60 * 1000,
  max: 500, // admins allowed more
  keyGenerator,
  skip: (req) => req.user?.role !== "admin",
  handler: rateLimitResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

/* -----------------------------------------------------
   🧪 DEV / HEALTH CHECK SKIPPER
----------------------------------------------------- */
const skipLimiterForHealth = (req) => {
  return req.originalUrl === "/" || req.originalUrl === "/health";
};

/* -----------------------------------------------------
   🧩 WRAPPED GLOBAL LIMITER WITH SKIP
----------------------------------------------------- */
const safeGlobalLimiter = (req, res, next) => {
  if (skipLimiterForHealth(req)) {
    return next();
  }
  return globalLimiter(req, res, next);
};

/* -----------------------------------------------------
   📦 EXPORTS
----------------------------------------------------- */
module.exports = {
  globalLimiter: safeGlobalLimiter,
  authLimiter,
  otpLimiter,
  searchLimiter,
  adminLimiter,
  keyGenerator,
};
