/**
 * Moderation Controller
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * API endpoints for content moderation system.
 */

const enhancedModerationService = require('../services/enhancedModerationService');
const aiModerationService = require('../services/aiModerationService');
const ContentFilter = require('../models/ContentFilter');
const ModerationQueue = require('../models/ModerationQueue');
const ModerationAction = require('../models/ModerationAction');
const Appeal = require('../models/Appeal');

const moderationController = {

    /**
     * GET /api/moderation/queue
     * Get moderation queue
     */
    async getQueue(req, res) {
        try {
            const { status, limit, page, category, priority } = req.query;

            const result = await enhancedModerationService.getQueue({
                status,
                limit: parseInt(limit) || 20,
                page: parseInt(page) || 1,
                category,
                priority: priority ? parseInt(priority) : null
            });

            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Get queue error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/moderation/queue/:id
     * Get single queue item
     */
    async getQueueItem(req, res) {
        try {
            const item = await ModerationQueue.findById(req.params.id)
                .populate('userId', 'username avatar email')
                .populate('assignedTo', 'username')
                .populate('reports.reporterId', 'username');

            if (!item) {
                return res.status(404).json({ success: false, message: 'Item not found' });
            }

            res.json({ success: true, data: item });
        } catch (error) {
            console.error('Get queue item error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/moderation/queue/:id/action
     * Take action on queue item
     */
    async takeAction(req, res) {
        try {
            const { action, reason, notes } = req.body;
            const moderatorId = req.user._id;

            const result = await enhancedModerationService.takeAction(
                req.params.id,
                moderatorId,
                action,
                reason,
                notes
            );

            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Take action error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/moderation/bulk-action
     * Bulk moderation action
     */
    async bulkAction(req, res) {
        try {
            const { itemIds, action, reason } = req.body;
            const moderatorId = req.user._id;

            const results = [];
            for (const id of itemIds) {
                try {
                    const result = await enhancedModerationService.takeAction(id, moderatorId, action, reason);
                    results.push({ id, success: true });
                } catch (error) {
                    results.push({ id, success: false, error: error.message });
                }
            }

            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Bulk action error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/moderation/analyze
     * Analyze content with AI
     */
    async analyzeContent(req, res) {
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
            console.error('Analyze content error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/moderation/appeals
     * Get appeals list
     */
    async getAppeals(req, res) {
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
                    .populate('userId', 'username avatar')
                    .populate('actionId')
                    .lean(),
                Appeal.countDocuments(query)
            ]);

            res.json({
                success: true,
                data: { appeals, total, page: parseInt(page) || 1 }
            });
        } catch (error) {
            console.error('Get appeals error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/moderation/appeals
     * Submit an appeal
     */
    async submitAppeal(req, res) {
        try {
            const { actionId, reason, evidence } = req.body;
            const userId = req.user._id;

            const appeal = await enhancedModerationService.submitAppeal(
                actionId,
                userId,
                reason,
                evidence
            );

            res.json({ success: true, data: appeal });
        } catch (error) {
            console.error('Submit appeal error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/moderation/filters
     * Get content filters
     */
    async getFilters(req, res) {
        try {
            const { category, isActive } = req.query;

            const query = {};
            if (category) query.category = category;
            if (isActive !== undefined) query.isActive = isActive === 'true';

            const filters = await ContentFilter.find(query)
                .sort({ category: 1, name: 1 })
                .lean();

            res.json({ success: true, data: filters });
        } catch (error) {
            console.error('Get filters error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/moderation/filters
     * Create content filter
     */
    async createFilter(req, res) {
        try {
            const { name, description, filterType, pattern, regexFlags, category, severity, action, applyTo } = req.body;

            const filter = await ContentFilter.create({
                name,
                description,
                filterType,
                pattern,
                regexFlags,
                category,
                severity,
                action,
                applyTo,
                createdBy: req.user._id
            });

            // Clear AI service cache to pick up new filter
            aiModerationService.clearCache();

            res.status(201).json({ success: true, data: filter });
        } catch (error) {
            console.error('Create filter error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/moderation/statistics
     * Get moderation statistics
     */
    async getStatistics(req, res) {
        try {
            const { startDate, endDate } = req.query;

            const stats = await enhancedModerationService.getStatistics(startDate, endDate);

            res.json({ success: true, data: stats });
        } catch (error) {
            console.error('Get statistics error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/moderation/history/:userId
     * Get moderation history for a user
     */
    async getUserHistory(req, res) {
        try {
            const { userId } = req.params;
            const { limit } = req.query;

            const history = await ModerationAction.getUserHistory(userId, parseInt(limit) || 50);

            res.json({ success: true, data: history });
        } catch (error) {
            console.error('Get user history error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = moderationController;
