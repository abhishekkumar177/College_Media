const Post = require('../../models/Post');
const Message = require('../../models/Message');
const ActivityLog = require('../../models/ActivityLog');
const logger = require('../../utils/logger');

/**
 * Task: Archive old data for performance
 * Runs: Weekly on Sunday at 2:00 AM
 */
module.exports = {
    name: 'archiveOldData',
    schedule: '0 2 * * 0', // Sunday at 2 AM
    enabled: true,
    description: 'Archive old posts, messages, and activity logs older than 1 year',

    async execute() {
        const startTime = Date.now();
        logger.info('Starting data archival task...');

        try {
            const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
            const results = {};

            // Archive old activity logs (delete logs older than 1 year)
            const activityResult = await ActivityLog.deleteMany({
                createdAt: { $lt: oneYearAgo }
            });
            results.activityLogs = activityResult.deletedCount;

            // Soft-delete old posts (mark as archived)
            const postResult = await Post.updateMany(
                { createdAt: { $lt: oneYearAgo }, isDeleted: false },
                { $set: { isDeleted: true, archivedAt: new Date() } }
            );
            results.posts = postResult.modifiedCount;

            // Archive old messages (soft delete)
            const messageResult = await Message.updateMany(
                { createdAt: { $lt: oneYearAgo }, isDeleted: { $ne: true } },
                { $set: { isDeleted: true, archivedAt: new Date() } }
            );
            results.messages = messageResult.modifiedCount;

            const duration = Date.now() - startTime;
            logger.info(`Data archival completed in ${duration}ms.`, results);

            return {
                success: true,
                archived: results,
                duration
            };
        } catch (error) {
            logger.error('Data archival task failed:', error);
            throw error;
        }
    }
};
