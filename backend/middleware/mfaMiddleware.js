const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * MFA Enforcement Middleware
 * Ensures users with MFA enabled have completed 2FA verification
 * Issue #884: MFA Implementation
 */

/**
 * Middleware to enforce MFA for sensitive routes
 * Checks if user has MFA enabled and if session is MFA-verified
 */
const enforceMFA = async (req, res, next) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Fetch user with MFA settings
        const user = await User.findById(userId).select('twoFactorEnabled');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // If MFA is enabled, ensure the session is MFA-verified
        if (user.twoFactorEnabled) {
            // Check if the session has MFA verification flag
            // This would typically be set in the JWT payload or session store
            if (!req.mfaVerified) {
                return res.status(403).json({
                    success: false,
                    message: 'MFA verification required for this action',
                    requiresMFA: true
                });
            }
        }

        next();
    } catch (error) {
        logger.error('MFA enforcement error:', error);
        res.status(500).json({
            success: false,
            message: 'MFA verification failed'
        });
    }
};

/**
 * Middleware to check if MFA is enabled for user
 * Adds MFA status to request object
 */
const checkMFAStatus = async (req, res, next) => {
    try {
        const userId = req.userId;

        if (!userId) {
            req.mfaEnabled = false;
            return next();
        }

        const user = await User.findById(userId).select('twoFactorEnabled');

        if (!user) {
            req.mfaEnabled = false;
            return next();
        }

        req.mfaEnabled = user.twoFactorEnabled || false;
        next();
    } catch (error) {
        logger.error('Check MFA status error:', error);
        req.mfaEnabled = false;
        next();
    }
};

/**
 * Middleware to require MFA to be disabled for certain actions
 * Useful for security-sensitive operations that shouldn't be done with MFA active
 */
const requireMFADisabled = async (req, res, next) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = await User.findById(userId).select('twoFactorEnabled');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.twoFactorEnabled) {
            return res.status(403).json({
                success: false,
                message: 'Please disable MFA before performing this action'
            });
        }

        next();
    } catch (error) {
        logger.error('Require MFA disabled error:', error);
        res.status(500).json({
            success: false,
            message: 'MFA check failed'
        });
    }
};

/**
 * Rate limiting for MFA attempts
 * Prevents brute force attacks on MFA codes
 */
const mfaRateLimiter = (req, res, next) => {
    // Simple in-memory rate limiting
    // In production, use Redis or similar
    const attempts = req.session?.mfaAttempts || 0;
    const lastAttempt = req.session?.lastMfaAttempt || 0;
    const now = Date.now();

    // Reset after 15 minutes
    if (now - lastAttempt > 15 * 60 * 1000) {
        req.session.mfaAttempts = 0;
    }

    if (attempts >= 5) {
        return res.status(429).json({
            success: false,
            message: 'Too many MFA attempts. Please try again later.',
            retryAfter: Math.ceil((15 * 60 * 1000 - (now - lastAttempt)) / 1000)
        });
    }

    req.session.mfaAttempts = attempts + 1;
    req.session.lastMfaAttempt = now;

    next();
};

module.exports = {
    enforceMFA,
    checkMFAStatus,
    requireMFADisabled,
    mfaRateLimiter
};
