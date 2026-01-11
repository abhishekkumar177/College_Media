
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

const getKey = (req) => {
  const userId = req.user?.id || "guest";
  const ip = req.ip; // ab express-rate-limit khud handle karega
  const route = req.originalUrl;
  return `${userId}:${ip}:${route}`;
};

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => getKey(req),
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => getKey(req),
});
