const Redis = require('ioredis');
const { slidingWindowScript, bruteForceBlockScript } = require('../utils/redisScripts');
const logger = require('../utils/logger');

// Initialize Redis Client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Default Limits Configuration
const LIMITS = {
    global: { limit: 100, window: 60000 }, // 100 req/min per IP
    auth: { limit: 5, window: 60000, blockDuration: 300000 }, // 5 failures/min -> 5 min block
    transcoding: { limit: 3, window: 300000 }, // 3 videos/5min
    premium: { multiplier: 2.0 }, // 2x limits
    admin: { multiplier: 10.0 }   // 10x limits
};

/**
 * Distributed Rate Limiter Middleware
 * @param {string} type - 'global' | 'auth' | 'transcoding'
 * @param {boolean} byUser - Limit by UserId (true) or IP (false)
 */
const distributedRateLimit = (type = 'global', byUser = false) => {
    return async (req, res, next) => {
        try {
            const userId = req.userId || req.user?._id;
            const userRole = req.userRole || 'student';
            const ip = req.ip || req.connection.remoteAddress;

            // Determine Identifier
            const identifier = byUser && userId ? `user:${userId}` : `ip:${ip}`;
            const key = `ratelimit:${type}:${identifier}`;

            // Determine Limits based on Role
            let { limit, window, blockDuration } = LIMITS[type] || LIMITS.global;

            if (userRole === 'admin') limit = Math.floor(limit * LIMITS.admin.multiplier);
            else if (userRole === 'premium') limit = Math.floor(limit * LIMITS.premium.multiplier);

            // 1. Auth Brute Force Check (Special Case)
            if (type === 'auth') {
                const blockKey = `block:${identifier}`;
                const result = await redis.eval(
                    bruteForceBlockScript,
                    2,
                    key,
                    blockKey,
                    limit,
                    window,
                    blockDuration || 300000
                );

                if (result === -1) {
                    logger.warn(`Brute force attempt blocked: ${identifier}`);
                    return res.status(429).json({
                        success: false,
                        message: 'Too many attempts. You are temporarily blocked.',
                        retryAfter: Math.floor((blockDuration || 300000) / 1000)
                    });
                }

                // For Auth, we ideally increment only on FAILURE. 
                // But as a standard limiter, we count attempts.
                // If this passes, current Logic allows 'limit' attempts.
                res.set('X-RateLimit-Remaining', result);
                return next();
            }

            // 2. Sliding Window Check (Standard API)
            const now = Date.now();
            const result = await redis.eval(
                slidingWindowScript,
                1,
                key,
                limit,
                window,
                now
            );

            const [allowed, remaining] = result;

            res.set('X-RateLimit-Limit', limit);
            res.set('X-RateLimit-Remaining', remaining);
            res.set('X-RateLimit-Reset', Math.floor((now + window) / 1000));

            if (allowed === 1) {
                next();
            } else {
                logger.warn(`Rate limit exceeded (${type}) for ${identifier}`);
                res.status(429).json({
                    success: false,
                    message: 'Too many requests. Please try again later.'
                });
            }

        } catch (error) {
            logger.error('Rate Limiter Error:', error);
            // Fail open (allow request) if Redis down, or fail closed?
            // "Fail open" is usually safer for UX unless unexpected load
            next();
        }
    };
};

module.exports = distributedRateLimit;
