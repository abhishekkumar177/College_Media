const User = require('../../models/User');
const NotificationService = require('../../services/notificationService');
const logger = require('../../utils/logger');

/**
 * Task: Send digest emails to users
 * Runs: Every Monday at 9:00 AM
 */
module.exports = {
    name: 'sendDigestEmail',
    schedule: '0 9 * * 1', // Every Monday at 9 AM
    enabled: true,
    description: 'Send weekly digest emails to active users',

    async execute() {
        const startTime = Date.now();
        logger.info('Starting digest email task...');

        try {
            // Find active users who haven't logged in recently
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            const users = await User.find({
                isDeleted: false,
                isActive: true,
                lastLogin: { $lt: sevenDaysAgo }
            }).select('email firstName').limit(100); // Batch limit

            let sentCount = 0;
            for (const user of users) {
                try {
                    // Queue digest email (simplified - would normally include activity summary)
                    await NotificationService.sendWelcomeEmail(user); // Reuse welcome as placeholder
                    sentCount++;
                } catch (err) {
                    logger.warn(`Failed to queue digest for ${user.email}:`, err.message);
                }
            }

            const duration = Date.now() - startTime;
            logger.info(`Digest email task completed in ${duration}ms. Sent: ${sentCount}`);

            return {
                success: true,
                sentCount,
                duration
            };
        } catch (error) {
            logger.error('Digest email task failed:', error);
            throw error;
        }
    }
};
