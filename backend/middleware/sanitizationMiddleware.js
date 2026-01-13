const xss = require('xss');
const mongoSanitize = require('mongo-sanitize');
const logger = require('../utils/logger');

/**
 * Sanitization Middleware
 * Protects against XSS, NoSQL injection, and other input-based attacks
 */

/**
 * XSS Protection Options
 * Customize allowed HTML tags and attributes
 */
const xssOptions = {
    whiteList: {}, // No HTML tags allowed by default
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
};

/**
 * Recursively sanitize object properties
 * @param {*} obj - Object to sanitize
 * @returns {*} - Sanitized object
 */
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    // Handle objects
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Sanitize the key itself (prevent prototype pollution)
                const sanitizedKey = key.replace(/^\$/, '').replace(/\./g, '');
                sanitized[sanitizedKey] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }

    // Handle strings - apply XSS protection
    if (typeof obj === 'string') {
        return xss(obj, xssOptions);
    }

    // Return primitives as-is
    return obj;
};

/**
 * Middleware: Sanitize request body
 * Removes potential XSS and NoSQL injection attempts from req.body
 */
const sanitizeBody = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        try {
            // First, apply mongo-sanitize to prevent NoSQL injection
            req.body = mongoSanitize(req.body);

            // Then, apply XSS protection
            req.body = sanitizeObject(req.body);

            logger.debug('Request body sanitized', {
                path: req.path,
                method: req.method
            });
        } catch (error) {
            logger.error('Error sanitizing request body:', error);
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Invalid request data format'
            });
        }
    }
    next();
};

/**
 * Middleware: Sanitize query parameters
 * Removes potential XSS and NoSQL injection attempts from req.query
 */
const sanitizeQuery = (req, res, next) => {
    if (req.query && typeof req.query === 'object') {
        try {
            // Apply mongo-sanitize
            req.query = mongoSanitize(req.query);

            // Apply XSS protection
            req.query = sanitizeObject(req.query);

            logger.debug('Query parameters sanitized', {
                path: req.path,
                method: req.method
            });
        } catch (error) {
            logger.error('Error sanitizing query parameters:', error);
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Invalid query parameters'
            });
        }
    }
    next();
};

/**
 * Middleware: Sanitize route parameters
 * Removes potential XSS and NoSQL injection attempts from req.params
 */
const sanitizeParams = (req, res, next) => {
    if (req.params && typeof req.params === 'object') {
        try {
            // Apply mongo-sanitize
            req.params = mongoSanitize(req.params);

            // Apply XSS protection
            req.params = sanitizeObject(req.params);

            logger.debug('Route parameters sanitized', {
                path: req.path,
                method: req.method
            });
        } catch (error) {
            logger.error('Error sanitizing route parameters:', error);
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Invalid route parameters'
            });
        }
    }
    next();
};

/**
 * Combined middleware: Sanitize all request inputs
 * Applies sanitization to body, query, and params
 */
const sanitizeAll = (req, res, next) => {
    sanitizeBody(req, res, (err) => {
        if (err) return next(err);
        sanitizeQuery(req, res, (err) => {
            if (err) return next(err);
            sanitizeParams(req, res, next);
        });
    });
};

/**
 * Middleware: Validate Content-Type for POST/PUT/PATCH requests
 * Ensures JSON content type is specified
 */
const validateContentType = (req, res, next) => {
    const methods = ['POST', 'PUT', 'PATCH'];

    if (methods.includes(req.method)) {
        const contentType = req.headers['content-type'];

        if (!contentType || !contentType.includes('application/json')) {
            logger.warn('Invalid Content-Type header', {
                path: req.path,
                method: req.method,
                contentType
            });

            return res.status(400).json({
                success: false,
                data: null,
                message: 'Content-Type must be application/json'
            });
        }
    }

    next();
};

/**
 * Middleware: Prevent parameter pollution
 * Ensures query parameters are not arrays (unless expected)
 */
const preventParameterPollution = (allowedArrayParams = []) => {
    return (req, res, next) => {
        if (req.query && typeof req.query === 'object') {
            for (const key in req.query) {
                if (req.query.hasOwnProperty(key)) {
                    // If parameter is an array and not in allowed list, take first value
                    if (Array.isArray(req.query[key]) && !allowedArrayParams.includes(key)) {
                        logger.warn('Parameter pollution detected', {
                            param: key,
                            path: req.path
                        });
                        req.query[key] = req.query[key][0];
                    }
                }
            }
        }
        next();
    };
};

module.exports = {
    sanitizeBody,
    sanitizeQuery,
    sanitizeParams,
    sanitizeAll,
    validateContentType,
    preventParameterPollution,
    sanitizeObject, // Export for manual use
};
