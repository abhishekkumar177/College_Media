const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const scheduler = require('../jobs/scheduler');
const { checkPermission, PERMISSIONS } = require('../middleware/rbacMiddleware');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

/**
 * @swagger
 * /api/admin/tasks:
 *   get:
 *     summary: Get all scheduled tasks status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/tasks', verifyToken, checkPermission(PERMISSIONS.MANAGE_SETTINGS), (req, res) => {
    try {
        const status = scheduler.getStatus();
        res.json({
            success: true,
            data: status,
            message: 'Task status retrieved'
        });
    } catch (error) {
        logger.error('Get tasks error:', error);
        res.status(500).json({ success: false, message: 'Failed to get tasks' });
    }
});

/**
 * @swagger
 * /api/admin/tasks/{name}/trigger:
 *   post:
 *     summary: Manually trigger a task
 *     tags: [Admin]
 */
router.post('/tasks/:name/trigger', verifyToken, checkPermission(PERMISSIONS.MANAGE_SETTINGS), async (req, res) => {
    try {
        const { name } = req.params;
        const result = await scheduler.trigger(name);

        res.json({
            success: true,
            data: result,
            message: `Task ${name} triggered successfully`
        });
    } catch (error) {
        logger.error('Trigger task error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/admin/tasks/{name}/enable:
 *   post:
 *     summary: Enable a scheduled task
 *     tags: [Admin]
 */
router.post('/tasks/:name/enable', verifyToken, checkPermission(PERMISSIONS.MANAGE_SETTINGS), (req, res) => {
    try {
        const task = scheduler.enable(req.params.name);
        res.json({
            success: true,
            data: { name: task.name, enabled: task.enabled },
            message: `Task ${req.params.name} enabled`
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/admin/tasks/{name}/disable:
 *   post:
 *     summary: Disable a scheduled task
 *     tags: [Admin]
 */
router.post('/tasks/:name/disable', verifyToken, checkPermission(PERMISSIONS.MANAGE_SETTINGS), (req, res) => {
    try {
        const task = scheduler.disable(req.params.name);
        res.json({
            success: true,
            data: { name: task.name, enabled: task.enabled },
            message: `Task ${req.params.name} disabled`
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
