const express = require('express');
const router = express.Router();

// Mock notifications data
const mockNotifications = [];

/**
 * GET /api/notifications
 * Fetch user notifications
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Return empty array for now
    res.json({
      success: true,
      data: mockNotifications.slice(0, parseInt(limit)),
      unreadCount: 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read
 */
router.patch('/mark-all-read', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

module.exports = router;
