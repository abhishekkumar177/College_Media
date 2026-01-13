const cache = require('../utils/cache');
const logger = require('../utils/logger');

/**
 * Cache middleware
 * @param {object} options - Options
 * @param {string} options.prefix - Cache key prefix
 * @param {number} options.ttl - TTL in seconds
 * @param {function} options.keyGenerator - Custom key generator function (optional)
 * @returns {function} - Express middleware
 */
const cacheMiddleware = (options = {}) => {
    const { prefix, ttl = 300, keyGenerator } = options;

    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        try {
            // Generate key
            let key;
            if (keyGenerator) {
                key = keyGenerator(req);
            } else {
                const identifier = req.userId || 'public';
                key = cache.generateKey(prefix, identifier, req.query);
            }

            // Try to get from cache
            const cachedData = await cache.get(key);

            if (cachedData) {
                logger.debug(`Cache hit for key: ${key}`);
                return res.json(cachedData);
            }

            logger.debug(`Cache miss for key: ${key}`);

            // Intercept response to cache it
            const originalJson = res.json;

            res.json = function (data) {
                // Restore original json method to prevent double caching issues or infinite loops if called internally
                res.json = originalJson;

                // Cache the data if it's a success response
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    // We don't await this so it doesn't block the response
                    cache.set(key, data, ttl).catch(err => {
                        logger.warn(`Failed to cache response for key ${key}:`, err);
                    });
                }

                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            logger.error('Cache middleware error:', error);
            // Proceed without caching on error
            next();
        }
    };
};

/**
 * Middleware to invalidate cache based on patterns
 * @param {Array<string>} patterns - Patterns to invalidate (can contain :param placeholders)
 */
const invalidateCache = (patterns) => {
    return async (req, res, next) => {
        const originalJson = res.json;

        res.json = function (data) {
            res.json = originalJson;

            if (res.statusCode >= 200 && res.statusCode < 300) {
                patterns.forEach(pattern => {
                    // Replace placeholders like :id with req.params.id
                    const resolvedPattern = pattern.replace(/:([a-zA-Z0-9_]+)/g, (match, paramName) => {
                        return req.params[paramName] || req.userId || '*';
                    });

                    // If the pattern doesn't start with cache:, add it essentially to act as a proper match
                    // But typically our generateKey adds 'cache:' prefix. 
                    // We should ensure our invalidation patterns match what generateKey produces.
                    // The generateKey usage is `cache:${prefix}:${identifier}:${params}`
                    // So specific invalidation requires knowing the structure.

                    // If we are invalidating `users` list, the key might be `cache:users:public:page:1...`
                    // Pattern `cache:users:*` would work.

                    const fullPattern = resolvedPattern.startsWith('cache:') ? resolvedPattern : `cache:${resolvedPattern}`;

                    cache.invalidatePattern(fullPattern).catch(err => {
                        logger.warn(`Failed to invalidate cache pattern ${fullPattern}:`, err);
                    });
                });
            }

            return originalJson.call(this, data);
        };

        next();
    };
};

module.exports = {
    cacheMiddleware,
    invalidateCache
};
