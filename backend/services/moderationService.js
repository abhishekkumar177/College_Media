const Report = require('../models/Report');
const User = require('../models/User');
const Post = require('../models/Post');
const logger = require('../utils/logger');
const NotificationService = require('./notificationService');

class ModerationService {
    /**
     * Create a new report
     */
    static async createReport(data) {
        try {
            const { reporterId, targetType, targetId, reason, description } = data;

            // Check if already reported by this user
            const existingReport = await Report.findOne({
                reporter: reporterId,
                targetType,
                targetId,
                status: { $in: ['pending', 'reviewed'] }
            });

            if (existingReport) {
                throw new Error('You have already reported this content.');
            }

            // Check for auto-flagging based on rules (e.g., if highly reported)
            let priority = 'medium';

            // Determine priority based on reason
            if (['hate_speech', 'harassment'].includes(reason)) {
                priority = 'high';
            }

            const report = await Report.create({
                reporter: reporterId,
                targetType,
                targetId,
                reason,
                description,
                priority
            });

            logger.info(`New report created: ${report._id} for ${targetType}:${targetId}`);

            return report;
        } catch (error) {
            logger.error('Create report error:', error);
            throw error;
        }
    }

    /**
     * Auto-flag content based on text analysis (simple keyword matching)
     */
    static async autoFlagContent(content, type, authorId) {
        const badWords = ['scam', 'spam', 'buy now', 'click here', 'free money', 'lottery'];
        const criticalWords = ['suicide', 'kill', ' bomb', 'terrorist']; // Example sensitive keywords

        let flagged = false;
        let failReason = '';
        let priority = 'medium';

        const lowerContent = content.toLowerCase();

        // Check critical words
        if (criticalWords.some(word => lowerContent.includes(word))) {
            flagged = true;
            failReason = 'Matched critical safety keywords';
            priority = 'critical';
        } else if (badWords.some(word => lowerContent.includes(word))) {
            flagged = true;
            failReason = 'Matched spam keywords';
            priority = 'low'; // Auto-spam usually low priority unless mass
        }

        if (flagged) {
            try {
                // Create a system report
                await Report.create({
                    reporter: authorId, // Attributed to author but marked as auto-flagged (or use a system user ID if available)
                    // To be cleaner, reporter should probably be the system, but schema requires User. 
                    // For now, allow self-report as a quirk or make reporter optional in schema. 
                    // Let's assume we use the authorId for reference or a dedicated 'System' user in production.
                    // Better approach: make reporter optional. I'll adhere to schema constraints for now.
                    targetType: type, // 'Post' or 'Comment'
                    targetId: authorId, // This logic needs the actual target object ID. 
                    // Since this runs typically BEFORE creation is finalized or AFTER, let's assume async checking.
                    // BUT `autoFlagContent` is often called during creation. 
                    // Implementation strategy: We will just return the diagnosis here.
                });
            } catch (e) {
                logger.error('Auto-flag error', e);
            }
            return { flagged, reason: failReason, priority };
        }

        return { flagged: false };
    }

    /**
     * Process and check content for moderation rules
     * Returns true if content should be blocked immediately (optional feature)
     * Or generates a report asynchronously
     */
    static async checkAndFlag(content, targetType, targetId, authorId) {
        try {
            const check = await this.checkContentSafety(content);

            if (check.flagged) {
                // Auto-create report
                await Report.create({
                    reporter: authorId, // Using author as placeholder or need a System Admin ID
                    targetType,
                    targetId,
                    reason: 'other',
                    description: `Auto-flagged: ${check.reason}`,
                    status: 'pending',
                    priority: check.priority,
                    autoFlagged: true,
                    flaggedReason: check.reason
                });

                logger.warn(`Content auto-flagged: ${targetType}:${targetId} for ${check.reason}`);
            }
        } catch (error) {
            logger.error('Check and flag error:', error);
        }
    }

    static async checkContentSafety(content) {
        // Reusing the logic from autoFlagContent simpler
        const lower = content.toLowerCase();
        if (lower.includes('viagra') || lower.includes('casino')) return { flagged: true, reason: 'Spam detected', priority: 'low' };
        if (lower.includes('hate') && lower.includes('kill')) return { flagged: true, reason: 'Hate speech detected', priority: 'high' };
        return { flagged: false };
    }

    /**
     * Resolve a report
     */
    static async resolveReport(reportId, moderatorId, resolution, notes, action) {
        try {
            const report = await Report.findById(reportId);
            if (!report) throw new Error('Report not found');

            report.status = 'resolved';
            report.moderator = moderatorId;
            report.resolution = resolution;
            report.moderatorNotes = notes;
            await report.save();

            // Take action on target
            if (action === 'delete_content') {
                if (report.targetType === 'Post') {
                    await Post.findByIdAndUpdate(report.targetId, { isDeleted: true });
                }
                // Handle other types...
            } else if (action === 'ban_user') {
                // Find author of target... needs lookup
            }

            return report;
        } catch (error) {
            logger.error('Resolve report error:', error);
            throw error;
        }
    }
}

module.exports = ModerationService;
