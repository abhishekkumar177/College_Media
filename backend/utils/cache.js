const redisClient = require('./redisClient');
const logger = require('./logger');

const DEFAULT_TTL = 300; // 5 minutes default

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached data or null
 */
const get = async (key) => {
    if (!redisClient) return null;

    try {
        const data = await redisClient.get(key);
        if (!data) return null;
        return JSON.parse(data);
    } catch (error) {
        logger.error(`Redis get error for key ${key}:`, error);
        return null;
    }
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} - Success status
 */
const set = async (key, value, ttl = DEFAULT_TTL) => {
    if (!redisClient) return false;

    try {
        const stringValue = JSON.stringify(value);
        await redisClient.setex(key, ttl, stringValue);
        return true;
    } catch (error) {
        logger.error(`Redis set error for key ${key}:`, error);
        return false;
    }
};

/**
 * Delete data from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
const del = async (key) => {
    if (!redisClient) return false;

    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        logger.error(`Redis del error for key ${key}:`, error);
        return false;
    }
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Key pattern to match (e.g. 'user:*')
 * @returns {Promise<number>} - Number of keys deleted
 */
const invalidatePattern = async (pattern) => {
    if (!redisClient) return 0;

    try {
        const stream = redisClient.scanStream({
            match: pattern,
            count: 100
        });

        let keysToDelete = [];

        stream.on('data', (resultKeys) => {
            keysToDelete = keysToDelete.concat(resultKeys);
        });

        return new Promise((resolve, reject) => {
            stream.on('end', async () => {
                if (keysToDelete.length > 0) {
                    try {
                        // Delete keys in batches/pipeline if extremely large, but unlink is good
                        // Use pipeline for atomic-ish deletion
                        const pipeline = redisClient.pipeline();
                        keysToDelete.forEach(key => pipeline.del(key));
                        await pipeline.exec();
                        logger.info(`Invalidated ${keysToDelete.length} keys matching pattern: ${pattern}`);
                        resolve(keysToDelete.length);
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    resolve(0);
                }
            });

            stream.on('error', (err) => {
                reject(err);
            });
        });
    } catch (error) {
        logger.error(`Redis invalidatePattern error for pattern ${pattern}:`, error);
        return 0;
    }
};

/**
 * Generate a standardized cache key
 * @param {string} prefix - Key prefix (e.g. 'user', 'feed')
 * @param {string} identifier - Unique identifier (e.g. userId, 'all')
 * @param {object} params - Query parameters to include in key
 * @returns {string} - Generated key
 */
const generateKey = (prefix, identifier, params = {}) => {
    const paramString = Object.keys(params)
        .sort()
        .map(k => `${k}:${params[k]}`)
        .join(':');

    return paramString
        ? `cache:${prefix}:${identifier}:${paramString}`
        : `cache:${prefix}:${identifier}`;
};

module.exports = {
    get,
    set,
    del,
    invalidatePattern,
    generateKey,
    DEFAULT_TTL
};
