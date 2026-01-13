const Redis = require('ioredis');
const logger = require('./logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const ENABLE_REDIS = process.env.ENABLE_REDIS === 'true';

let redisClient = null;

if (ENABLE_REDIS) {
    try {
        redisClient = new Redis(REDIS_URL, {
            enableOfflineQueue: false,
            connectTimeout: 2000,
            retryStrategy: (times) => Math.min(times * 50, 2000), // Exponential backoff max 2s
            lazyConnect: true // Don't connect immediately, wait for manual connect or first command
        });

        redisClient.on('error', (err) => {
            logger.warn('Redis connection error:', err.message);
        });

        redisClient.on('connect', () => {
            logger.info('Connected to Redis server');
        });

        redisClient.on('ready', () => {
            logger.info('Redis client ready');
        });

        // Attempt to connect
        redisClient.connect().catch(err => {
            logger.warn('Could not connect to Redis on startup, running in fallback mode:', err.message);
        });

    } catch (error) {
        logger.error('Failed to initialize Redis client:', error);
        redisClient = null;
    }
} else {
    logger.info('Redis disabled via environment variable');
}

module.exports = redisClient;
