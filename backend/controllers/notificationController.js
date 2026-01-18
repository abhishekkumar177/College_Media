/**
 * Enhanced Notification Controller
 * Real-time notifications with filtering, pagination, and preferences
 */

const Notification = require('../models/Notification');
const NotificationPreferences = require('../models/NotificationPreferences');
const realtimeNotificationService = require('../services/realtimeNotificationService');

/**
 * @desc    Get user notifications with pagination and filters
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, unread, priority } = req.query;
        
        const query = {
            recipient: req.user._id,
            isDeleted: false
        };
        
        if (type) query.type = type;
        if (unread === 'true') query.isRead = false;
        if (priority) query.priority = priority;
        
        const notifications = await Notification.find(query)
            .populate('sender', 'name username profilePicture')
            .populate('aggregatedUsers', 'name profilePicture')
            .populate('post', 'caption imageUrl')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.getUnreadCount(req.user._id);
        
        res.json({
            success: true,
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            unreadCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.user._id);
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user._id
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        
        await notification.markAsRead();
        
        res.json({
            success: true,
            notification
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.markAllAsRead(req.user._id);
        
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Delete notification (soft delete)
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user._id
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        
        await notification.softDelete();
        
        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Batch mark notifications as read
 * @route   PUT /api/notifications/batch-read
 * @access  Private
 */
exports.batchMarkAsRead = async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notification IDs'
            });
        }
        
        await Notification.updateMany(
            {
                _id: { $in: ids },
                recipient: req.user._id
            },
            {
                $set: { isRead: true, readAt: new Date() }
            }
        );
        
        res.json({
            success: true,
            message: `${ids.length} notifications marked as read`
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get notification preferences
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
exports.getPreferences = async (req, res) => {
    try {
        const prefs = await NotificationPreferences.getOrCreate(req.user._id);
        res.json({ success: true, preferences: prefs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update notification preferences
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
exports.updatePreferences = async (req, res) => {
    try {
        const prefs = await NotificationPreferences.getOrCreate(req.user._id);
        
        Object.assign(prefs, req.body);
        await prefs.save();
        
        res.json({
            success: true,
            preferences: prefs
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Register device for push notifications
 * @route   POST /api/notifications/devices
 * @access  Private
 */
exports.registerDevice = async (req, res) => {
    try {
        const { deviceId, token, platform } = req.body;
        
        if (!deviceId || !token || !platform) {
            return res.status(400).json({
                success: false,
                message: 'Device ID, token, and platform are required'
            });
        }
        
        const prefs = await NotificationPreferences.getOrCreate(req.user._id);
        await prefs.addDevice({ deviceId, token, platform });
        
        res.json({
            success: true,
            message: 'Device registered successfully'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Unregister device
 * @route   DELETE /api/notifications/devices/:deviceId
 * @access  Private
 */
exports.unregisterDevice = async (req, res) => {
    try {
        const prefs = await NotificationPreferences.getOrCreate(req.user._id);
        await prefs.removeDevice(req.params.deviceId);
        
        res.json({
            success: true,
            message: 'Device unregistered successfully'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Create notification (internal/admin)
 * @route   POST /api/notifications
 * @access  Private/Admin
 */
exports.createNotification = async (req, res) => {
    try {
        const notification = await realtimeNotificationService.createNotification(req.body);
        
        res.status(201).json({
            success: true,
            notification
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Helper function for creating notifications (used by other controllers)
 */
exports.createNotificationHelper = async (data) => {
    try {
        return await realtimeNotificationService.createNotification(data);
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};
