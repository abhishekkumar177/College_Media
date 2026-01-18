const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ModerationService = require('../services/moderationService');
const Report = require('../models/Report');
const { checkPermission, PERMISSIONS } = require('../middleware/rbacMiddleware');
const logger = require('../utils/logger');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

// Middleware to verify token for reports
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

/**
 * @swagger
 * /api/moderation/reports:
 *   post:
 *     summary: Create a moderation report
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 */
router.post('/reports', verifyToken, apiLimiter, async (req, res) => {
    try {
        const { targetType, targetId, reason, description } = req.body;

        const report = await ModerationService.createReport({
            reporterId: req.userId,
            targetType,
            targetId,
            reason,
            description
        });

        res.status(201).json({
            success: true,
            data: report,
            message: 'Report submitted successfully'
        });
    } catch (error) {
        logger.error('Submit report error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to submit report'
        });
    }
});

/**
 * @swagger
 * /api/moderation/queue:
 *   get:
 *     summary: Get moderation queue (Moderators only)
 *     tags: [Moderation]
 */
router.get('/queue', verifyToken, checkPermission(PERMISSIONS.VIEW_REPORTS), async (req, res) => {
    try {
        const { status = 'pending', priority, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const match = { status };
        if (priority) match.priority = priority;

        const [reports, total] = await Promise.all([
            Report.find(match)
                .populate('reporter', 'username firstName lastName profilePicture')
                .sort({ priority: -1, createdAt: 1 }) // High priority first, then oldest
                .skip(skip)
                .limit(parseInt(limit)),
            Report.countDocuments(match)
        ]);

        res.json({
            success: true,
            data: {
                reports,
                pagination: {
                    page: parseInt(page),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            },
            message: 'Moderation queue retrieved'
        });
    } catch (error) {
        logger.error('Get queue error:', error);
        res.status(500).json({ success: false, message: 'Failed to get queue' });
    }
});

/**
 * @swagger
 * /api/moderation/resolve/{reportId}:
 *   put:
 *     summary: Resolve a report (Moderators only)
 *     tags: [Moderation]
 */
router.put('/resolve/:reportId', verifyToken, checkPermission(PERMISSIONS.RESOLVE_REPORTS), async (req, res) => {
    try {
        const { resolution, notes, action } = req.body;
        const { reportId } = req.params;

        const report = await ModerationService.resolveReport(
            reportId,
            req.userId,
            resolution,
            notes,
            action
        );

        res.json({
            success: true,
            data: report,
            message: 'Report resolved'
        });
    } catch (error) {
        logger.error('Resolve report error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// ===== AI-Powered Moderation Routes (Issue #901) =====

const enhancedModerationService = require('../services/enhancedModerationService');
const aiModerationService = require('../services/aiModerationService');
const ContentFilter = require('../models/ContentFilter');
const ModerationQueue = require('../models/ModerationQueue');
const Appeal = require('../models/Appeal');

/**
 * @swagger
 * /api/moderation/ai/analyze:
 *   post:
 *     summary: Analyze content with AI
 *     tags: [AI Moderation]
 */
router.post('/ai/analyze', verifyToken, async (req, res) => {
    try {
        const { text, imageUrls, videoUrls } = req.body;

        const analysis = await aiModerationService.analyzeContent({
            text,
            imageUrls: imageUrls || [],
            videoUrls: videoUrls || []
        });

        const recommendation = aiModerationService.getRecommendedAction(analysis);

        res.json({
            success: true,
            data: { analysis, recommendation }
        });
    } catch (error) {
        logger.error('AI analyze error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/moderation/ai/queue:
 *   get:
 *     summary: Get AI moderation queue
 *     tags: [AI Moderation]
 */
router.get('/ai/queue', verifyToken, checkPermission(PERMISSIONS.VIEW_REPORTS), async (req, res) => {
    try {
        const { status, limit, page, category, priority } = req.query;

        const result = await enhancedModerationService.getQueue({
            status: status || 'pending',
            limit: parseInt(limit) || 20,
            page: parseInt(page) || 1,
            category,
            priority: priority ? parseInt(priority) : null
        });

        res.json({ success: true, data: result });
    } catch (error) {
        logger.error('Get AI queue error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/moderation/ai/queue/:id/action:
 *   post:
 *     summary: Take action on AI queue item
 *     tags: [AI Moderation]
 */
router.post('/ai/queue/:id/action', verifyToken, checkPermission(PERMISSIONS.RESOLVE_REPORTS), async (req, res) => {
    try {
        const { action, reason, notes } = req.body;

        const result = await enhancedModerationService.takeAction(
            req.params.id,
            req.userId,
            action,
            reason,
            notes
        );

        res.json({ success: true, data: result });
    } catch (error) {
        logger.error('AI action error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/moderation/appeals:
 *   get:
 *     summary: Get appeals list
 *     tags: [AI Moderation]
 */
router.get('/appeals', verifyToken, checkPermission(PERMISSIONS.VIEW_REPORTS), async (req, res) => {
    try {
        const { status, limit, page } = req.query;
        const query = {};
        if (status) query.status = status;

        const skip = ((parseInt(page) || 1) - 1) * (parseInt(limit) || 20);

        const [appeals, total] = await Promise.all([
            Appeal.find(query)
                .sort({ priority: 1, submittedAt: 1 })
                .skip(skip)
                .limit(parseInt(limit) || 20)
                .populate('userId', 'username profilePicture')
                .lean(),
            Appeal.countDocuments(query)
        ]);

        res.json({ success: true, data: { appeals, total } });
    } catch (error) {
        logger.error('Get appeals error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/moderation/appeals:
 *   post:
 *     summary: Submit an appeal
 *     tags: [AI Moderation]
 */
router.post('/appeals', verifyToken, async (req, res) => {
    try {
        const { actionId, reason, evidence } = req.body;

        const appeal = await enhancedModerationService.submitAppeal(
            actionId,
            req.userId,
            reason,
            evidence
        );

        res.status(201).json({ success: true, data: appeal });
    } catch (error) {
        logger.error('Submit appeal error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/moderation/filters:
 *   get:
 *     summary: Get content filters
 *     tags: [AI Moderation]
 */
router.get('/filters', verifyToken, checkPermission(PERMISSIONS.VIEW_REPORTS), async (req, res) => {
    try {
        const { category, isActive } = req.query;
        const query = {};
        if (category) query.category = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const filters = await ContentFilter.find(query).sort({ category: 1, name: 1 }).lean();
        res.json({ success: true, data: filters });
    } catch (error) {
        logger.error('Get filters error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/moderation/filters:
 *   post:
 *     summary: Create content filter
 *     tags: [AI Moderation]
 */
router.post('/filters', verifyToken, checkPermission(PERMISSIONS.RESOLVE_REPORTS), async (req, res) => {
    try {
        const { name, description, filterType, pattern, regexFlags, category, severity, action, applyTo } = req.body;

        const filter = await ContentFilter.create({
            name, description, filterType, pattern, regexFlags, category, severity, action, applyTo,
            createdBy: req.userId
        });

        aiModerationService.clearCache();
        res.status(201).json({ success: true, data: filter });
    } catch (error) {
        logger.error('Create filter error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/moderation/statistics:
 *   get:
 *     summary: Get moderation statistics
 *     tags: [AI Moderation]
 */
router.get('/statistics', verifyToken, checkPermission(PERMISSIONS.VIEW_REPORTS), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await enhancedModerationService.getStatistics(startDate, endDate);
        res.json({ success: true, data: stats });
    } catch (error) {
        logger.error('Get statistics error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
