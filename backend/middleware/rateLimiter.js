const rateLimit = require('express-rate-limit');

let RedisStore, redisClient;
try {
  RedisStore = require('rate-limit-redis').default;
  redisClient = require('../config/redisClient');
  console.log('✅ Redis rate limiting enabled');
} catch (err) {
  console.log('⚠️ Redis not available, using memory store for rate limiting');
  redisClient = null;
}

// 🔐 Global API limiter
const globalLimiter = rateLimit({
  store: redisClient && RedisStore
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined, // fallback to memory
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5000, // Very high for development
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development', // Skip in development
});

// 🔥 Strict limiter for auth routes
const authLimiter = rateLimit({
  store: redisClient && RedisStore
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined,
  windowMs: 15 * 60 * 1000, // 15 min
  max: 1000, // Very high for development
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development', // Skip in development
});

// 🧠 Multi-key limiter helper
const keyGenerator = (req) => {
  return (
    req.user?.id ||
    req.headers.authorization ||
    req.ip
  );
};

module.exports = {
  globalLimiter,
  authLimiter,
  keyGenerator,
};
