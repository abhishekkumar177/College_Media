const logger = require('../utils/logger');

/**
 * Query Performance Monitoring Middleware
 * Tracks and logs slow database queries for optimization
 */

// Configuration
const SLOW_QUERY_THRESHOLD_MS = parseInt(process.env.SLOW_QUERY_THRESHOLD) || 100;
const ENABLE_QUERY_LOGGING = process.env.ENABLE_QUERY_LOGGING === 'true' || process.env.NODE_ENV === 'development';

// Query statistics
const queryStats = {
    totalQueries: 0,
    slowQueries: 0,
    averageQueryTime: 0,
    slowestQuery: null
};

/**
 * Initialize Mongoose query monitoring
 * @param {mongoose} mongoose - Mongoose instance
 */
const initializeQueryMonitoring = (mongoose) => {
    if (!ENABLE_QUERY_LOGGING) {
        logger.info('Query monitoring disabled');
        return;
    }

    logger.info('Initializing query performance monitoring', {
        slowQueryThreshold: `${SLOW_QUERY_THRESHOLD_MS}ms`
    });

    // Monitor all queries
    mongoose.set('debug', function (collectionName, methodName, ...methodArgs) {
        const startTime = Date.now();

        // Log query execution
        const logQuery = () => {
            const duration = Date.now() - startTime;

            // Update statistics
            queryStats.totalQueries++;
            queryStats.averageQueryTime =
                (queryStats.averageQueryTime * (queryStats.totalQueries - 1) + duration) / queryStats.totalQueries;

            const queryInfo = {
                collection: collectionName,
                method: methodName,
                duration: `${duration}ms`,
                args: methodArgs.map(arg => {
                    if (typeof arg === 'object') {
                        return JSON.stringify(arg).substring(0, 200); // Limit arg length
                    }
                    return arg;
                })
            };

            // Log slow queries
            if (duration > SLOW_QUERY_THRESHOLD_MS) {
                queryStats.slowQueries++;

                logger.warn('Slow query detected', {
                    ...queryInfo,
                    threshold: `${SLOW_QUERY_THRESHOLD_MS}ms`
                });

                // Track slowest query
                if (!queryStats.slowestQuery || duration > queryStats.slowestQuery.duration) {
                    queryStats.slowestQuery = {
                        ...queryInfo,
                        duration,
                        timestamp: new Date().toISOString()
                    };
                }
            } else if (process.env.NODE_ENV === 'development') {
                // Log all queries in development
                logger.debug('Query executed', queryInfo);
            }
        };

        // Use setImmediate to log after query completes
        setImmediate(logQuery);
    });
};

/**
 * Middleware to track request-level query performance
 */
const queryPerformanceMiddleware = (req, res, next) => {
    if (!ENABLE_QUERY_LOGGING) {
        return next();
    }

    const startTime = Date.now();
    let queriesExecuted = 0;

    // Track queries for this request
    const originalQuery = req.app.get('dbConnection')?.mongoose?.Query?.prototype?.exec;

    if (originalQuery) {
        req.app.get('dbConnection').mongoose.Query.prototype.exec = function () {
            queriesExecuted++;
            return originalQuery.apply(this, arguments);
        };
    }

    // Log on response finish
    res.on('finish', () => {
        const duration = Date.now() - startTime;

        if (queriesExecuted > 0) {
            const logData = {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                queriesExecuted
            };

            if (duration > SLOW_QUERY_THRESHOLD_MS * 2) {
                logger.warn('Slow request detected', logData);
            } else if (process.env.NODE_ENV === 'development') {
                logger.debug('Request completed', logData);
            }
        }
    });

    next();
};

/**
 * Get query statistics
 * @returns {object} - Query statistics
 */
const getQueryStats = () => {
    return {
        ...queryStats,
        slowQueryPercentage: queryStats.totalQueries > 0
            ? ((queryStats.slowQueries / queryStats.totalQueries) * 100).toFixed(2) + '%'
            : '0%',
        averageQueryTime: `${queryStats.averageQueryTime.toFixed(2)}ms`
    };
};

/**
 * Reset query statistics
 */
const resetQueryStats = () => {
    queryStats.totalQueries = 0;
    queryStats.slowQueries = 0;
    queryStats.averageQueryTime = 0;
    queryStats.slowestQuery = null;

    logger.info('Query statistics reset');
};

/**
 * Analyze query and provide optimization suggestions
 * @param {object} query - Query object
 * @param {string} collection - Collection name
 * @returns {Array} - Optimization suggestions
 */
const analyzeQuery = (query, collection) => {
    const suggestions = [];

    // Check for missing indexes
    if (query.$or && query.$or.length > 2) {
        suggestions.push('Consider creating a compound index for $or queries');
    }

    // Check for regex without index
    if (query.$regex || (typeof query === 'object' && Object.values(query).some(v => v?.$regex))) {
        suggestions.push('Regex queries can be slow. Consider using text indexes or exact matches');
    }

    // Check for large $in arrays
    if (query.$in && Array.isArray(query.$in) && query.$in.length > 100) {
        suggestions.push('Large $in arrays can impact performance. Consider pagination or alternative query structure');
    }

    // Check for unindexed sorts
    if (query.sort && Object.keys(query.sort).length > 1) {
        suggestions.push('Multi-field sorts may require compound indexes');
    }

    return suggestions;
};

/**
 * Create index recommendation based on query patterns
 * @param {string} collection - Collection name
 * @param {object} query - Query filter
 * @returns {object} - Index recommendation
 */
const recommendIndex = (collection, query) => {
    const fields = Object.keys(query).filter(key => !key.startsWith('$'));

    if (fields.length === 0) {
        return null;
    }

    const indexSpec = {};
    fields.forEach(field => {
        indexSpec[field] = 1; // Ascending index
    });

    return {
        collection,
        index: indexSpec,
        reason: `Frequently queried fields: ${fields.join(', ')}`
    };
};

module.exports = {
    initializeQueryMonitoring,
    queryPerformanceMiddleware,
    getQueryStats,
    resetQueryStats,
    analyzeQuery,
    recommendIndex,
    SLOW_QUERY_THRESHOLD_MS
};
