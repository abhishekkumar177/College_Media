const emailQueue = require('../jobs/emailQueue');
const logger = require('../utils/logger');

/**
 * Notification Service - Handles queuing of all notification types
 */
class NotificationService {
    /**
     * Send welcome email to new user
     * @param {object} user - User object with email, firstName
     */
    static async sendWelcomeEmail(user) {
        try {
            await emailQueue.add({
                type: 'welcome',
                to: user.email,
                data: {
                    firstName: user.firstName,
                    username: user.username
                }
            }, {
                priority: 2 // Higher priority for welcome emails
            });
            logger.info(`Welcome email queued for ${user.email}`);
        } catch (error) {
            logger.error('Failed to queue welcome email:', error);
        }
    }

    /**
     * Send new message notification
     * @param {object} sender - Sender user object
     * @param {object} recipient - Recipient user object
     * @param {string} messageContent - Message content
     */
    static async sendNewMessageNotification(sender, recipient, messageContent) {
        try {
            // Don't send if recipient has notifications disabled (future feature)
            // if (recipient.settings?.emailNotifications === false) return;

            await emailQueue.add({
                type: 'newMessage',
                to: recipient.email,
                data: {
                    recipientName: recipient.firstName,
                    senderName: `${sender.firstName} ${sender.lastName}`,
                    senderUsername: sender.username,
                    messagePreview: messageContent.substring(0, 100)
                }
            }, {
                delay: 60000 // Delay 1 minute (in case user reads it immediately)
            });
            logger.info(`New message notification queued for ${recipient.email}`);
        } catch (error) {
            logger.error('Failed to queue message notification:', error);
        }
    }

    /**
     * Send new follower notification
     * @param {object} user - User being followed
     * @param {object} follower - User who followed
     */
    static async sendNewFollowerNotification(user, follower) {
        try {
            await emailQueue.add({
                type: 'newFollower',
                to: user.email,
                data: {
                    userName: user.firstName,
                    followerName: `${follower.firstName} ${follower.lastName}`,
                    followerUsername: follower.username
                }
            });
            logger.info(`New follower notification queued for ${user.email}`);
        } catch (error) {
            logger.error('Failed to queue follower notification:', error);
        }
    }

    /**
     * Send password changed notification
     * @param {object} user - User who changed password
     */
    static async sendPasswordChangedNotification(user) {
        try {
            await emailQueue.add({
                type: 'passwordChanged',
                to: user.email,
                data: {
                    firstName: user.firstName
                }
            }, {
                priority: 1 // Highest priority for security emails
            });
            logger.info(`Password changed notification queued for ${user.email}`);
        } catch (error) {
            logger.error('Failed to queue password changed notification:', error);
        }
    }

    /**
     * Get queue statistics
     */
    static async getQueueStats() {
        try {
            const [waiting, active, completed, failed] = await Promise.all([
                emailQueue.getWaitingCount(),
                emailQueue.getActiveCount(),
                emailQueue.getCompletedCount(),
                emailQueue.getFailedCount()
            ]);

            return { waiting, active, completed, failed };
        } catch (error) {
            logger.error('Failed to get queue stats:', error);
            return null;
        }
    }
}

module.exports = NotificationService;
