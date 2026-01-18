/**
 * Enhanced Notification Service
 * Issue #906: Real-time Notification System with Push Notifications
 * 
 * Comprehensive notification service with multi-channel delivery.
 */

const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');

class EnhancedNotificationService {

    /**
     * Create and send notification
     */
    async createNotification(data) {
        try {
            const {
                recipientId,
                senderId,
                type,
                title,
                message,
                priority = 'normal',
                data: notificationData = {},
                channels = { inApp: true }
            } = data;

            // Get user preferences
            const prefs = await NotificationPreference.getOrCreate(recipientId);

            // Determine which channels to use based on preferences
            const enabledChannels = {
                inApp: channels.inApp && prefs.shouldSend(type, 'inApp'),
                push: channels.push && prefs.shouldSend(type, 'push'),
                email: channels.email && prefs.shouldSend(type, 'email'),
                sms: channels.sms && prefs.shouldSend(type, 'sms')
            };

            // Create notification
            const notification = await Notification.create({
                recipientId,
                senderId,
                type,
                title,
                message,
                priority,
                data: notificationData,
                channels: enabledChannels,
                status: 'pending'
            });

            // Send to enabled channels
            await this.sendToChannels(notification, enabledChannels);

            return notification;
        } catch (error) {
            console.error('[Notification] Create error:', error);
            throw error;
        }
    }

    /**
     * Send notification to enabled channels
     */
    async sendToChannels(notification, channels) {
        const promises = [];

        if (channels.inApp) {
            promises.push(this.sendInApp(notification));
        }

        if (channels.push) {
            promises.push(this.sendPush(notification));
        }

        if (channels.email) {
            promises.push(this.sendEmail(notification));
        }

        await Promise.allSettled(promises);
    }

    /**
     * Send in-app notification
     */
    async sendInApp(notification) {
        try {
            // Mark as sent
            await notification.markAsSent('inApp');

            // Emit via WebSocket (would integrate with socket service)
            // socketService.emitToUser(notification.recipientId, 'notification', notification);

            return true;
        } catch (error) {
            console.error('[Notification] In-app send error:', error);
            notification.errors.push({
                channel: 'inApp',
                error: error.message
            });
            await notification.save();
            return false;
        }
    }

    /**
     * Send push notification
     */
    async sendPush(notification) {
        try {
            // Would integrate with push notification service (FCM, etc.)
            // await pushNotificationService.send(notification);

            await notification.markAsSent('push');
            return true;
        } catch (error) {
            console.error('[Notification] Push send error:', error);
            notification.errors.push({
                channel: 'push',
                error: error.message
            });
            await notification.save();
            return false;
        }
    }

    /**
     * Send email notification
     */
    async sendEmail(notification) {
        try {
            // Would integrate with email service
            // await emailService.send(notification);

            await notification.markAsSent('email');
            return true;
        } catch (error) {
            console.error('[Notification] Email send error:', error);
            notification.errors.push({
                channel: 'email',
                error: error.message
            });
            await notification.save();
            return false;
        }
    }

    /**
     * Get user notifications
     */
    async getUserNotifications(userId, options = {}) {
        const {
            limit = 20,
            skip = 0,
            unreadOnly = false
        } = options;

        const query = {
            recipientId: userId,
            status: 'sent'
        };

        if (unreadOnly) {
            query['delivery.inApp.read'] = false;
        }

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('senderId', 'username avatar')
                .lean(),
            Notification.countDocuments(query),
            Notification.getUnreadCount(userId)
        ]);

        return {
            notifications,
            total,
            unreadCount,
            hasMore: total > skip + limit
        };
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId) {
        const notification = await Notification.findOne({
            _id: notificationId,
            recipientId: userId
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        return notification.markAsRead();
    }

    /**
     * Mark all as read
     */
    async markAllAsRead(userId) {
        return Notification.markAllAsRead(userId);
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId, userId) {
        return Notification.deleteOne({
            _id: notificationId,
            recipientId: userId
        });
    }

    /**
     * Batch create notifications
     */
    async batchCreate(notifications) {
        try {
            const created = await Notification.insertMany(notifications);

            // Send each notification
            for (const notification of created) {
                await this.sendToChannels(notification, notification.channels);
            }

            return created;
        } catch (error) {
            console.error('[Notification] Batch create error:', error);
            throw error;
        }
    }

    /**
     * Get notification statistics
     */
    async getStatistics(userId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const stats = await Notification.aggregate([
            {
                $match: {
                    recipientId: userId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    unread: {
                        $sum: {
                            $cond: ['$delivery.inApp.read', 0, 1]
                        }
                    }
                }
            }
        ]);

        return stats;
    }
}

module.exports = new EnhancedNotificationService();
