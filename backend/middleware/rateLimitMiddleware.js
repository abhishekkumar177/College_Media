const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redisClient = require('../utils/redisClient');

let store;

if (redisClient) {
    store = new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    });
}

// Helper to get client IP
const getIp = (req) => {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
};

// Whitelist check
const isWhitelisted = (req) => {
    const whitelist = (process.env.RATE_LIMIT_WHITELIST || '').split(',').map(ip => ip.trim()).filter(Boolean);
    const clientIp = getIp(req);
    // Add localhost to whitelist if in development
    if (process.env.NODE_ENV === 'development') {
        if (clientIp === '::1' || clientIp === '127.0.0.1') return true;
    }
    return whitelist.includes(clientIp);
};

// Common rate limit handler
const limiterHandler = (req, res, next, options) => {
    res.status(options.statusCode).json({
        success: false,
        data: null,
        message: options.message,
        retryAfter: Math.ceil(options.windowMs / 1000)
    });
};

// Create a limiter instance
const createLimiter = ({ windowMs, max, message, keyPrefix }) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        store: store, // Use Redis store if available, otherwise MemoryStore
        keyGenerator: (req) => {
            // Use user ID if authenticated, otherwise IP
            return req.userId ? `${keyPrefix}:${req.userId}` : `${keyPrefix}:${getIp(req)}`;
        },
        skip: (req) => isWhitelisted(req),
        handler: limiterHandler,
        message: message || 'Too many requests, please try again later.',
    });
};

// Tier 1: Strict - Auth Endpoints (Login, Verify OTP)
const authLimiter = createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many login attempts, please try again after 15 minutes',
    keyPrefix: 'rl:auth'
});

// Tier 1b: Very Strict - Registration & Password Reset
const registerLimiter = createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many account creation requests, please try again after an hour',
    keyPrefix: 'rl:register'
});

const forgotPasswordLimiter = createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many password reset requests, please try again after an hour',
    keyPrefix: 'rl:forgot'
});

// Tier 2: Moderate - General API
const apiLimiter = createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests, please try again later',
    keyPrefix: 'rl:api'
});

// Tier 3: Sensitive Operations (Account Deletion, Export)
const sensitiveLimiter = createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2, // Very strict
    message: 'Too many sensitive operation requests, please try again later',
    keyPrefix: 'rl:sensitive'
});

// Global limiter (Safety net)
const globalLimiter = createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Generous limit for overall traffic per IP
    message: 'Too many requests to the server',
    keyPrefix: 'rl:global'
});

module.exports = {
    authLimiter,
    registerLimiter,
    forgotPasswordLimiter,
    apiLimiter,
    sensitiveLimiter,
    globalLimiter
};
