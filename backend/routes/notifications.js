/**
 * Enhanced Notification Routes
 * Real-time notifications with comprehensive management
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Get notifications with filters and pagination
router.get('/', protect, notificationController.getNotifications);

// Get unread count
router.get('/unread-count', protect, notificationController.getUnreadCount);

// Preferences
router.get('/preferences', protect, notificationController.getPreferences);
router.put('/preferences', protect, notificationController.updatePreferences);

// Device management
router.post('/devices', protect, notificationController.registerDevice);
router.delete('/devices/:deviceId', protect, notificationController.unregisterDevice);

// Mark as read
router.put('/:id/read', protect, notificationController.markAsRead);
router.put('/read-all', protect, notificationController.markAllAsRead);
router.put('/batch-read', protect, notificationController.batchMarkAsRead);

// Delete notification
router.delete('/:id', protect, notificationController.deleteNotification);

// Create notification (admin/internal)
router.post('/', protect, notificationController.createNotification);

module.exports = router;
