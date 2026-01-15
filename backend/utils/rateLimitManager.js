/**
 * ============================================================
 * RATE LIMIT MANAGER
 * ------------------------------------------------------------
 * ✔ Centralized rate limiting engine
 * ✔ Removes magic numbers
 * ✔ Redis + memory fallback
 * ✔ Role aware limits
 * ✔ Route aware limits
 * ✔ Security hardened
 * ✔ ECWoC / Production ready
 * ============================================================
 */

const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const redisClient = require("../config/redisClient");
const logger = require("./logger");

/* ============================================================
   🧠 INTERNAL HELPERS
============================================================ */

/**
 * Check redis availability safely
 */
const isRedisAvailable = () => {
  try {
    return redisClient && redisClient.isOpen;
  } catch (err) {
    logger.error("Redis availability check failed", { err });
    return false;
  }
};

/**
 * Safe Redis store creator
 */
const createStore = () => {
  if (!isRedisAvailable()) return undefined;

  return new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  });
};

/* ============================================================
   🔑 RATE LIMIT KEYS
============================================================ */

const generateKey = (req) => {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }

  if (req.headers.authorization) {
    return `token:${req.headers.authorization}`;
  }

  return `ip:${req.ip}`;
};

/* ============================================================
   📊 CENTRALIZED CONFIGURATION
============================================================ */

const LIMITS = Object.freeze({
  GLOBAL: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX: 200,
  },
  AUTH: {
    WINDOW_MS: 10 * 60 * 1000,
    MAX: 20,
  },
  OTP: {
    WINDOW_MS: 5 * 60 * 1000,
    MAX: 5,
  },
  SEARCH: {
    WINDOW_MS: 60 * 1000,
    MAX: 60,
  },
  ADMIN: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX: 500,
  },
  BURST: {
    WINDOW_MS: 30 * 1000,
    MAX: 30,
  },
  EMERGENCY: {
    WINDOW_MS: 60 * 60 * 1000,
    MAX: 50,
  },
});

/* ============================================================
   🧑 ROLE BASED LIMIT ADJUSTER
============================================================ */

const adjustLimitByRole = (req, baseLimit) => {
  if (!req.user) return baseLimit;

  if (req.user.role === "admin") {
    return baseLimit * 2;
  }

  if (req.user.role === "moderator") {
    return Math.floor(baseLimit * 1.5);
  }

  return baseLimit;
};

/* ============================================================
   🚨 COMMON HANDLER
============================================================ */

const defaultHandler = (req, res) => {
  logger.warn("Rate limit exceeded", {
    key: generateKey(req),
    ip: req.ip,
    path: req.originalUrl,
    method: req.method,
  });

  res.setHeader("Retry-After", "60");

  return res.status(429).json({
    success: false,
    error: "TOO_MANY_REQUESTS",
    message: "Too many requests. Please try again later.",
  });
};

/* ============================================================
   🏭 LIMITER FACTORY
============================================================ */

const createLimiter = ({
  windowMs,
  max,
  skip,
  handler = defaultHandler,
}) =>
  rateLimit({
    store: createStore(),
    windowMs,
    max: (req) => adjustLimitByRole(req, max),
    keyGenerator: generateKey,
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    handler,
  });

/* ============================================================
   🌍 GLOBAL LIMITER
============================================================ */

const globalLimiter = createLimiter({
  windowMs: LIMITS.GLOBAL.WINDOW_MS,
  max: LIMITS.GLOBAL.MAX,
});

/* ============================================================
   🔐 AUTH LIMITER
============================================================ */

const authLimiter = createLimiter({
  windowMs: LIMITS.AUTH.WINDOW_MS,
  max: LIMITS.AUTH.MAX,
  skip: () => process.env.NODE_ENV === "development",
});

/* ============================================================
   🔥 OTP LIMITER
============================================================ */

const otpLimiter = createLimiter({
  windowMs: LIMITS.OTP.WINDOW_MS,
  max: LIMITS.OTP.MAX,
  handler: (req, res) => {
    logger.warn("OTP abuse detected", {
      ip: req.ip,
      key: generateKey(req),
    });

    return res.status(429).json({
      success: false,
      error: "OTP_RATE_LIMIT",
      message: "Too many OTP requests. Try again later.",
    });
  },
});

/* ============================================================
   🔍 SEARCH LIMITER
============================================================ */

const searchLimiter = createLimiter({
  windowMs: LIMITS.SEARCH.WINDOW_MS,
  max: LIMITS.SEARCH.MAX,
});

/* ============================================================
   👑 ADMIN LIMITER
============================================================ */

const adminLimiter = createLimiter({
  windowMs: LIMITS.ADMIN.WINDOW_MS,
  max: LIMITS.ADMIN.MAX,
  skip: (req) => req.user?.role !== "admin",
});

/* ============================================================
   🧯 BURST PROTECTION
============================================================ */

const burstLimiter = createLimiter({
  windowMs: LIMITS.BURST.WINDOW_MS,
  max: LIMITS.BURST.MAX,
});

/* ============================================================
   🚑 EMERGENCY LOCKDOWN
============================================================ */

const emergencyLimiter = createLimiter({
  windowMs: LIMITS.EMERGENCY.WINDOW_MS,
  max: LIMITS.EMERGENCY.MAX,
  handler: (req, res) => {
    logger.error("Emergency limiter active", {
      ip: req.ip,
    });

    return res.status(429).json({
      success: false,
      error: "EMERGENCY_LIMIT",
      message:
        "Service temporarily restricted due to high traffic.",
    });
  },
});

/* ============================================================
   📈 METRICS MIDDLEWARE
============================================================ */

const rateLimitMetrics = (req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode === 429) {
      logger.info("Rate limit metric", {
        ip: req.ip,
        route: req.originalUrl,
        method: req.method,
      });
    }
  });
  next();
};

/* ============================================================
   🧩 COMPOSED MIDDLEWARE SETS
============================================================ */

const protectedGlobal = [
  rateLimitMetrics,
  burstLimiter,
  globalLimiter,
];

const protectedAuth = [
  rateLimitMetrics,
  authLimiter,
];

const protectedSearch = [
  rateLimitMetrics,
  searchLimiter,
];

/* ============================================================
   📦 EXPORTS
============================================================ */

module.exports = {
  LIMITS,
  generateKey,

  globalLimiter,
  authLimiter,
  otpLimiter,
  searchLimiter,
  adminLimiter,
  burstLimiter,
  emergencyLimiter,

  protectedGlobal,
  protectedAuth,
  protectedSearch,
};
