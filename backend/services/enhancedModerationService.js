/**
 * Enhanced Moderation Service
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * Core moderation service with AI integration, queue management, and actions.
 */

const ModerationQueue = require('../models/ModerationQueue');
const ModerationAction = require('../models/ModerationAction');
const Appeal = require('../models/Appeal');
const aiModerationService = require('./aiModerationService');
const reputationService = require('./reputationService');

class EnhancedModerationService {

    /**
     * Submit content for AI-powered moderation
     */
    async submitForModeration(contentId, contentType, userId, contentSnapshot) {
        const analysis = await aiModerationService.analyzeContent(contentSnapshot);
        const recommendation = aiModerationService.getRecommendedAction(analysis);

        const queueItem = new ModerationQueue({
            contentId,
            contentType,
            userId,
            contentSnapshot,
            aiAnalysis: analysis,
            priority: recommendation.priority,
            status: recommendation.requiresReview ? 'pending' : 'approved',
            autoModerated: !recommendation.requiresReview
        });

        await queueItem.save();

        if (!recommendation.requiresReview) {
            return { status: 'approved', queueItem };
        }

        return { status: 'queued', queueItem };
    }

    /**
     * Get moderation queue with filters
     */
    async getQueue(options = {}) {
        const { status = 'pending', limit = 20, page = 1, category = null, priority = null } = options;
        const query = {};

        if (status) query.status = status;
        if (category) query['aiAnalysis.detectedCategories'] = category;
        if (priority) query.priority = priority;

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            ModerationQueue.find(query)
                .sort({ priority: 1, createdAt: 1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'username avatar')
                .lean(),
            ModerationQueue.countDocuments(query)
        ]);

        return { items, total, page, totalPages: Math.ceil(total / limit) };
    }

    /**
     * Take moderation action
     */
    async takeAction(queueItemId, moderatorId, action, reason, notes = '') {
        const queueItem = await ModerationQueue.findById(queueItemId);
        if (!queueItem) throw new Error('Queue item not found');

        queueItem.status = action === 'approve' ? 'approved' : 'rejected';
        queueItem.decision = {
            action,
            reason,
            moderatorNotes: notes,
            decidedBy: moderatorId,
            decidedAt: new Date()
        };
        await queueItem.save();

        const actionRecord = new ModerationAction({
            queueItemId,
            contentId: queueItem.contentId,
            contentType: queueItem.contentType,
            userId: queueItem.userId,
            action,
            reason,
            moderatorId,
            moderatorNotes: notes,
            aiConfidenceScore: queueItem.aiAnalysis.overallConfidence,
            appealable: ['warn', 'hide', 'remove', 'ban_user'].includes(action)
        });
        await actionRecord.save();

        if (queueItem.userId && ['warn', 'hide', 'remove'].includes(action)) {
            await reputationService.penalizeUser(queueItem.userId, action);
        }

        return { queueItem, actionRecord };
    }

    /**
     * Submit appeal
     */
    async submitAppeal(actionId, userId, reason, evidence = []) {
        const action = await ModerationAction.findById(actionId);
        if (!action) throw new Error('Action not found');
        if (!action.appealable) throw new Error('This action cannot be appealed');
        if (action.appealed) throw new Error('Appeal already submitted');

        const appeal = new Appeal({ actionId, userId, reason, evidence, status: 'pending' });
        await appeal.save();

        action.appealed = true;
        action.appealId = appeal._id;
        await action.save();

        return appeal;
    }

    /**
     * Get statistics
     */
    async getStatistics(startDate, endDate) {
        const query = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const [totalQueued, pendingCount, approvedCount, rejectedCount] = await Promise.all([
            ModerationQueue.countDocuments(query),
            ModerationQueue.countDocuments({ ...query, status: 'pending' }),
            ModerationQueue.countDocuments({ ...query, status: 'approved' }),
            ModerationQueue.countDocuments({ ...query, status: 'rejected' })
        ]);

        return { totalQueued, pendingCount, approvedCount, rejectedCount };
    }
}

module.exports = new EnhancedModerationService();
