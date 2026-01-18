/**
 * Real-Time Notification Service with WebSocket support
 * Handles real-time delivery, aggregation, and multi-device sync
 */

const Notification = require('../models/Notification');
const NotificationPreferences = require('../models/NotificationPreferences');

class RealtimeNotificationService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> Set of socket IDs
  }

  /**
   * Initialize Socket.IO
   */
  initialize(io) {
    this.io = io;
    
    const notificationNamespace = io.of('/notifications');
    
    notificationNamespace.on('connection', (socket) => {
      console.log('[Notifications] Client connected:', socket.id);
      
      socket.on('authenticate', async (data) => {
        try {
          const { userId } = data;
          if (!userId) return;
          
          if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
          }
          this.userSockets.get(userId).add(socket.id);
          
          socket.join(`user:${userId}`);
          socket.userId = userId;
          
          const unreadCount = await Notification.getUnreadCount(userId);
          socket.emit('unread_count', { count: unreadCount });
          
          console.log(`[Notifications] User ${userId} authenticated`);
        } catch (error) {
          console.error('[Notifications] Auth error:', error);
        }
      });
      
      socket.on('mark_read', async (data) => {
        try {
          const { notificationId } = data;
          const notification = await Notification.findOne({
            _id: notificationId,
            recipient: socket.userId
          });
          
          if (notification) {
            await notification.markAsRead();
            const unreadCount = await Notification.getUnreadCount(socket.userId);
            notificationNamespace.to(`user:${socket.userId}`).emit('unread_count', { count: unreadCount });
          }
        } catch (error) {
          console.error('[Notifications] Mark read error:', error);
        }
      });
      
      socket.on('mark_all_read', async () => {
        try {
          if (!socket.userId) return;
          await Notification.markAllAsRead(socket.userId);
          notificationNamespace.to(`user:${socket.userId}`).emit('unread_count', { count: 0 });
          notificationNamespace.to(`user:${socket.userId}`).emit('all_marked_read');
        } catch (error) {
          console.error('[Notifications] Mark all read error:', error);
        }
      });
      
      socket.on('disconnect', () => {
        console.log('[Notifications] Client disconnected:', socket.id);
        
        if (socket.userId) {
          const sockets = this.userSockets.get(socket.userId);
          if (sockets) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
              this.userSockets.delete(socket.userId);
            }
          }
        }
      });
    });
  }

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
        content,
        resourceType,
        resourceId,
        actionUrl,
        metadata = {},
        priority = 'normal',
        groupKey = null
      } = data;

      const prefs = await NotificationPreferences.getOrCreate(recipientId);

      if (groupKey) {
        const aggregated = await this.aggregateNotification(data);
        if (aggregated) return aggregated;
      }

      const notification = await Notification.create({
        recipient: recipientId,
        sender: senderId,
        type,
        title,
        content,
        resourceType,
        resourceId,
        actionUrl,
        metadata,
        priority,
        groupKey,
        status: 'pending'
      });

      await notification.populate('sender', 'name profilePicture');

      await this.deliverNotification(notification, prefs);

      return notification;
    } catch (error) {
      console.error('[Notifications] Create error:', error);
      throw error;
    }
  }

  /**
   * Aggregate similar notifications
   */
  async aggregateNotification(data) {
    const { groupKey, recipientId, type } = data;
    
    const recentNotification = await Notification.findOne({
      recipient: recipientId,
      groupKey,
      type,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    }).sort({ createdAt: -1 });

    if (recentNotification) {
      recentNotification.aggregatedCount += 1;
      if (data.senderId && !recentNotification.aggregatedUsers.includes(data.senderId)) {
        recentNotification.aggregatedUsers.push(data.senderId);
      }
      
      if (recentNotification.aggregatedCount === 2) {
        recentNotification.title = recentNotification.title.replace(/^(\w+)/, '$1 and 1 other');
      } else {
        recentNotification.title = recentNotification.title.replace(
          /and \d+ other/,
          `and ${recentNotification.aggregatedCount - 1} others`
        );
      }
      
      await recentNotification.save();
      await recentNotification.populate('sender aggregatedUsers', 'name profilePicture');
      
      this.emitToUser(recipientId, 'notification_updated', recentNotification);
      
      return recentNotification;
    }

    return null;
  }

  /**
   * Deliver notification through enabled channels
   */
  async deliverNotification(notification, prefs) {
    const promises = [];

    if (prefs.isChannelEnabled(notification.type, 'inApp')) {
      promises.push(this.deliverInApp(notification));
    }

    await Promise.allSettled(promises);
    
    notification.status = 'sent';
    await notification.save();
  }

  /**
   * Deliver via WebSocket
   */
  async deliverInApp(notification) {
    try {
      const userId = notification.recipient.toString();
      
      notification.channels.inApp.sent = true;
      notification.channels.inApp.sentAt = new Date();
      
      if (this.io) {
        const notificationNamespace = this.io.of('/notifications');
        notificationNamespace.to(`user:${userId}`).emit('new_notification', notification);
        
        const unreadCount = await Notification.getUnreadCount(userId);
        notificationNamespace.to(`user:${userId}`).emit('unread_count', { count: unreadCount });
        
        if (this.userSockets.has(userId) && this.userSockets.get(userId).size > 0) {
          notification.channels.inApp.delivered = true;
          notification.channels.inApp.deliveredAt = new Date();
        }
      }
      
      await notification.save();
    } catch (error) {
      console.error('[Notifications] In-app delivery error:', error);
    }
  }

  /**
   * Emit event to specific user
   */
  emitToUser(userId, event, data) {
    if (this.io) {
      const notificationNamespace = this.io.of('/notifications');
      notificationNamespace.to(`user:${userId}`).emit(event, data);
    }
  }

  /**
   * Batch create notifications
   */
  async batchCreate(notifications) {
    const promises = notifications.map(data => this.createNotification(data));
    return await Promise.allSettled(promises);
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return this.userSockets.has(userId) && this.userSockets.get(userId).size > 0;
  }

  /**
   * Get user device count
   */
  getUserDeviceCount(userId) {
    return this.userSockets.has(userId) ? this.userSockets.get(userId).size : 0;
  }
}

const realtimeNotificationService = new RealtimeNotificationService();

module.exports = realtimeNotificationService;
