/**
 * Content Filter Middleware
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * Middleware for automatically analyzing content before submission.
 */

const aiModerationService = require('../services/aiModerationService');
const enhancedModerationService = require('../services/enhancedModerationService');
const logger = require('../utils/logger');

/**
 * Middleware to check content before allowing creation
 * Used for posts, comments, and messages
 */
const contentFilterMiddleware = async (req, res, next) => {
    try {
        const { content, text, body, caption } = req.body;
        const textContent = content || text || body || caption;

        if (!textContent) {
            return next();
        }

        // Analyze content with AI
        const analysis = await aiModerationService.analyzeContent({ text: textContent });
        const recommendation = aiModerationService.getRecommendedAction(analysis);

        // Attach analysis to request for potential use downstream
        req.contentAnalysis = {
            analysis,
            recommendation
        };

        // If content is clearly safe, proceed
        if (recommendation.action === 'approve') {
            return next();
        }

        // If confidence is very high and action is block, reject immediately
        if (analysis.overallConfidence >= 0.95 && recommendation.action === 'remove') {
            logger.warn(`Content blocked by filter: User ${req.userId}, Confidence: ${analysis.overallConfidence}`);
            return res.status(400).json({
                success: false,
                message: 'Your content appears to violate our community guidelines.',
                flaggedCategories: analysis.detectedCategories
            });
        }

        // For medium-high confidence, allow but queue for moderation
        if (analysis.overallConfidence >= 0.5) {
            req.requiresModeration = true;
        }

        next();
    } catch (error) {
        logger.error('Content filter middleware error:', error);
        // Don't block on filter errors, allow through
        next();
    }
};

/**
 * Middleware to queue content for moderation after creation
 */
const queueForModerationMiddleware = (contentType) => {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.send;

        res.send = function (data) {
            // Queue for moderation after successful response
            if (res.statusCode >= 200 && res.statusCode < 300 && req.requiresModeration) {
                const responseData = typeof data === 'string' ? JSON.parse(data) : data;
                const contentId = responseData?.data?._id || responseData?._id;

                if (contentId) {
                    setImmediate(async () => {
                        try {
                            const { content, text, body, caption } = req.body;
                            const textContent = content || text || body || caption;

                            await enhancedModerationService.submitForModeration(
                                contentId,
                                contentType,
                                req.userId,
                                { text: textContent, imageUrls: req.body.imageUrls || [] }
                            );

                            logger.info(`Content queued for moderation: ${contentType}:${contentId}`);
                        } catch (error) {
                            logger.error('Queue for moderation error:', error);
                        }
                    });
                }
            }

            return originalSend.call(this, data);
        };

        next();
    };
};

/**
 * Middleware to check if user is rate-limited or shadow-banned
 */
const checkModerationStatusMiddleware = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) return next();

        // Check user moderation status from cache or database
        // This is a simplified version - production would use Redis cache
        const User = require('../models/User');
        const user = await User.findById(userId).select('moderationStatus shadowBanned').lean();

        if (user?.shadowBanned) {
            // For shadow-banned users, accept the request but don't actually process it
            req.isShadowBanned = true;
            logger.info(`Shadow banned user activity: ${userId}`);
        }

        if (user?.moderationStatus === 'restricted') {
            // Apply rate limiting for restricted users
            req.isRestricted = true;
        }

        next();
    } catch (error) {
        logger.error('Check moderation status error:', error);
        next();
    }
};

module.exports = {
    contentFilterMiddleware,
    queueForModerationMiddleware,
    checkModerationStatusMiddleware
};
