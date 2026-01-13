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

module.exports = router;
