const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

/**
 * Extract client IP from request
 */
const getClientIP = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        'unknown';
};

/**
 * Extract user agent from request
 */
const getUserAgent = (req) => {
    return req.headers['user-agent'] || 'Unknown';
};

/**
 * Determine risk level based on action type
 */
const getRiskLevel = (action) => {
    const highRisk = ['PASSWORD_CHANGE', 'PASSWORD_RESET_COMPLETE', 'EMAIL_CHANGE', '2FA_DISABLED', 'ACCOUNT_DELETED', 'ADMIN_ACTION'];
    const mediumRisk = ['LOGIN_FAILED', 'PASSWORD_RESET_REQUEST', 'SETTINGS_CHANGE', '2FA_ENABLED'];

    if (highRisk.includes(action)) return 'high';
    if (mediumRisk.includes(action)) return 'medium';
    return 'low';
};

/**
 * Log activity helper function
 * @param {object} req - Express request object
 * @param {string} action - Action type
 * @param {object} metadata - Additional data to log
 * @param {string} status - success/failed/pending
 */
const logActivity = async (req, action, metadata = {}, status = 'success') => {
    try {
        const userId = req.userId;
        if (!userId) {
            logger.warn('Activity log skipped: No userId in request');
            return null;
        }

        const log = await ActivityLog.log({
            userId,
            action,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
            metadata,
            status,
            riskLevel: getRiskLevel(action)
        });

        if (log) {
            logger.debug(`Activity logged: ${action} for user ${userId}`);
        }

        return log;
    } catch (error) {
        logger.error('Activity logging failed:', error);
        return null;
    }
};

/**
 * Middleware factory - logs activity after route handler completes
 * @param {string} action - Action type to log
 * @param {function} metadataExtractor - Optional function to extract metadata from req/res
 */
const activityLoggerMiddleware = (action, metadataExtractor = null) => {
    return (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json to capture response
        res.json = function (data) {
            // Only log on success responses
            const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
            const status = isSuccess ? 'success' : 'failed';

            // Extract metadata if extractor provided
            const metadata = metadataExtractor ? metadataExtractor(req, data) : {};

            // Log activity asynchronously (don't block response)
            logActivity(req, action, metadata, status).catch(err =>
                logger.error('Async activity log failed:', err)
            );

            // Call original json
            return originalJson(data);
        };

        next();
    };
};

/**
 * Log login attempt (successful or failed)
 */
const logLoginAttempt = async (req, userId, success, metadata = {}) => {
    try {
        await ActivityLog.log({
            userId,
            action: success ? 'LOGIN' : 'LOGIN_FAILED',
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
            metadata,
            status: success ? 'success' : 'failed',
            riskLevel: success ? 'low' : 'medium'
        });
    } catch (error) {
        logger.error('Login activity logging failed:', error);
    }
};

module.exports = {
    logActivity,
    logLoginAttempt,
    activityLoggerMiddleware,
    getClientIP,
    getUserAgent
};
