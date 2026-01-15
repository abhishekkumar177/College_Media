/* =====================================================
   📊 CENTRALIZED RATE LIMIT CONFIG
   (Removes magic numbers & allows reuse)
===================================================== */
const RATE_LIMIT_CONFIG = Object.freeze({
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
});

/* =====================================================
   🧠 ROLE BASED LIMIT RESOLVER
===================================================== */
const resolveLimitByRole = (req, defaultLimit) => {
  if (!req.user) return defaultLimit;

  switch (req.user.role) {
    case "admin":
      return defaultLimit * 2;
    case "moderator":
      return Math.floor(defaultLimit * 1.5);
    default:
      return defaultLimit;
  }
};

/* =====================================================
   🔁 REDIS HEALTH CHECK (SAFE FALLBACK)
===================================================== */
const isRedisHealthy = () => {
  try {
    return redisClient && redisClient.isOpen;
  } catch (err) {
    logger.error("Redis health check failed", { err });
    return false;
  }
};

/* =====================================================
   🧯 BURST PROTECTION LIMITER
   Prevents sudden spikes
===================================================== */
const burstLimiter = rateLimit({
  store: isRedisHealthy() ? rateLimitStore : undefined,
  windowMs: RATE_LIMIT_CONFIG.BURST.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.BURST.MAX,
  keyGenerator,
  handler: (req, res) => {
    logger.warn("Burst traffic detected", {
      ip: req.ip,
      route: req.originalUrl,
    });

    res.setHeader("Retry-After", "30");

    return res.status(429).json({
      success: false,
      error: "BURST_LIMIT",
      message: "Too many requests in a short time. Please slow down.",
    });
  },
});

/* =====================================================
   🧪 ROUTE BASED LIMIT OVERRIDE
===================================================== */
const routeLimiter = (options) =>
  rateLimit({
    store: isRedisHealthy() ? rateLimitStore : undefined,
    windowMs: options.windowMs,
    max: (req) => resolveLimitByRole(req, options.max),
    keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
  });

/* =====================================================
   📈 RATE LIMIT METRICS HOOK
===================================================== */
const metricsHook = (req, res, next) => {
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

/* =====================================================
   🛡️ COMPOSED PROTECTION LAYER
   (Global + Burst + Metrics)
===================================================== */
const protectedLimiter = [
  metricsHook,
  burstLimiter,
  safeGlobalLimiter,
];

/* =====================================================
   🚑 EMERGENCY LOCKDOWN MODE
   Enable during attacks
===================================================== */
const emergencyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  keyGenerator,
  handler: (req, res) => {
    logger.error("Emergency rate limit active", {
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

/* =====================================================
   📦 EXTENDED EXPORTS
===================================================== */
module.exports.burstLimiter = burstLimiter;
module.exports.routeLimiter = routeLimiter;
module.exports.protectedLimiter = protectedLimiter;
module.exports.emergencyLimiter = emergencyLimiter;
module.exports.RATE_LIMIT_CONFIG = RATE_LIMIT_CONFIG;
