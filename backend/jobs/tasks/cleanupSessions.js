const User = require('../../models/User');
const logger = require('../../utils/logger');

/**
 * Task: Clean up expired sessions and inactive tokens
 * Runs: Daily at 3:00 AM
 */
module.exports = {
    name: 'cleanupSessions',
    schedule: '0 3 * * *', // Daily at 3 AM
    enabled: true,
    description: 'Clean up expired sessions and soft-deleted users older than 30 days',

    async execute() {
        const startTime = Date.now();
        logger.info('Starting session cleanup task...');

        try {
            // Find and permanently delete users that were soft-deleted more than 30 days ago
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            const result = await User.deleteMany({
                isDeleted: true,
                deletedAt: { $lt: thirtyDaysAgo }
            });

            const duration = Date.now() - startTime;
            logger.info(`Session cleanup completed in ${duration}ms. Permanently deleted: ${result.deletedCount} users`);

            return {
                success: true,
                deletedUsers: result.deletedCount,
                duration
            };
        } catch (error) {
            logger.error('Session cleanup task failed:', error);
            throw error;
        }
    }
};
