/**
 * Real-time Notifications Socket Handler
 * Enhanced with delivery tracking, read receipts, and multi-device sync
 */

const realtimeNotificationService = require('../services/realtimeNotificationService');

module.exports = (io) => {
    // Initialize realtime notification service with Socket.IO
    realtimeNotificationService.initialize(io);
    
    console.log('[Notifications] Socket service initialized');
};
