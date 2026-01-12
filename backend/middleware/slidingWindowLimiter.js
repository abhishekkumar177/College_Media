let redisClient;
try {
  redisClient = require("../config/redisClient");
} catch (err) {
  redisClient = null;
}

const WINDOW_SIZE = 60; // seconds
const MAX_REQUESTS = 10000; // Very high for development

const slidingWindowLimiter = async (req, res, next) => {
  // Skip rate limiting in development or if Redis is not available
  if (process.env.NODE_ENV === 'development' || !redisClient) {
    return next();
  }

  try {
    const userId = req.user?.id || req.ip;
    const key = `sliding:${userId}`;
    const now = Date.now();

    const windowStart = now - WINDOW_SIZE * 1000;

    // Remove old requests
    await redisClient.zRemRangeByScore(key, 0, windowStart);

    // Count current requests
    const requestCount = await redisClient.zCard(key);

    if (requestCount >= MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please slow down.",
      });
    }

    // Add current request
    await redisClient.zAdd(key, [{ score: now, value: `${now}` }]);

    // Set expiry so Redis auto-cleans
    await redisClient.expire(key, WINDOW_SIZE);

    next();
  } catch (error) {
    console.error('Sliding window limiter error:', error);
    // Don't block request on error
    next();
  }
};

module.exports = { slidingWindowLimiter };
