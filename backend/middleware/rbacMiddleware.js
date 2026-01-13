const { hasPermission, PERMISSIONS } = require('../config/roles');
const UserMongo = require('../models/User');
const UserMock = require('../mockdb/userDB');
const logger = require('../utils/logger');

/**
 * Middleware to check if user has required permission
 * Must be placed AFTER auth middleware (which sets req.userId)
 * @param {string} permission - The permission required
 */
const checkPermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    data: null,
                    message: 'Access denied. User not authenticated.'
                });
            }

            const dbConnection = req.app.get('dbConnection');
            const useMongoDB = dbConnection?.useMongoDB;

            let user;
            // Fetch user to get their role
            // We could cache this or add role to the JWT token to avoid DB hit
            // For now, let's fetch to be safe and ensure role is up to date
            if (useMongoDB) {
                user = await UserMongo.findById(req.userId).select('role');
            } else {
                user = await UserMock.findById(req.userId);
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    message: 'User not found.'
                });
            }

            if (hasPermission(user.role, permission)) {
                // Add auth info to request for downstream use
                req.userRole = user.role;
                next();
            } else {
                logger.warn(`Access denied: User ${req.userId} with role ${user.role} attempted to access protected resource requiring ${permission}`);
                res.status(403).json({
                    success: false,
                    data: null,
                    message: 'Access denied. Insufficient permissions.'
                });
            }
        } catch (error) {
            logger.error('RBAC middleware error:', error);
            res.status(500).json({
                success: false,
                data: null,
                message: 'Internal server error checking permissions.'
            });
        }
    };
};

/**
 * Middleware to check if user has one of the allowed roles
 * @param {Array<string>} allowedRoles - List of allowed roles
 */
const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. User not authenticated.'
                });
            }

            const dbConnection = req.app.get('dbConnection');
            const useMongoDB = dbConnection?.useMongoDB;

            let user;
            if (useMongoDB) {
                user = await UserMongo.findById(req.userId).select('role');
            } else {
                user = await UserMock.findById(req.userId);
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            if (allowedRoles.includes(user.role)) {
                req.userRole = user.role;
                next();
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Insufficient role privileges.'
                });
            }
        } catch (error) {
            logger.error('Role check middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error checking role.'
            });
        }
    };
};

module.exports = {
    checkPermission,
    checkRole,
    PERMISSIONS
};
