/**
 * Collaboration Routes
 * Issue #923: Real-time Collaborative Features
 * 
 * API routes for collaborative features.
 */

const express = require('express');
const router = express.Router();
const collaborationController = require('../controllers/collaborationController');

// Middleware (simplified - use actual auth middleware in production)
const authMiddleware = (req, res, next) => {
    // In production, verify JWT and attach user to req.user
    next();
};

/**
 * @swagger
 * /api/collaboration/sessions:
 *   post:
 *     summary: Create new collaborative session
 *     tags: [Collaboration]
 */
router.post('/sessions', authMiddleware, collaborationController.createSession);

/**
 * @swagger
 * /api/collaboration/sessions:
 *   get:
 *     summary: Get user sessions
 *     tags: [Collaboration]
 */
router.get('/sessions', authMiddleware, collaborationController.getUserSessions);

/**
 * @swagger
 * /api/collaboration/sessions/:sessionId:
 *   get:
 *     summary: Get session state
 *     tags: [Collaboration]
 */
router.get('/sessions/:sessionId', authMiddleware, collaborationController.getSessionState);

/**
 * @swagger
 * /api/collaboration/sessions/:sessionId/join:
 *   post:
 *     summary: Join collaborative session
 *     tags: [Collaboration]
 */
router.post('/sessions/:sessionId/join', authMiddleware, collaborationController.joinSession);

/**
 * @swagger
 * /api/collaboration/sessions/:sessionId/leave:
 *   post:
 *     summary: Leave collaborative session
 *     tags: [Collaboration]
 */
router.post('/sessions/:sessionId/leave', authMiddleware, collaborationController.leaveSession);

/**
 * @swagger
 * /api/collaboration/sessions/:sessionId/operations:
 *   post:
 *     summary: Apply operation to document
 *     tags: [Collaboration]
 */
router.post('/sessions/:sessionId/operations', authMiddleware, collaborationController.applyOperation);

/**
 * @swagger
 * /api/collaboration/sessions/:sessionId/history:
 *   get:
 *     summary: Get session operation history
 *     tags: [Collaboration]
 */
router.get('/sessions/:sessionId/history', authMiddleware, collaborationController.getSessionHistory);

/**
 * @swagger
 * /api/collaboration/sessions/:sessionId/snapshot:
 *   post:
 *     summary: Create document snapshot
 *     tags: [Collaboration]
 */
router.post('/sessions/:sessionId/snapshot', authMiddleware, collaborationController.createSnapshot);

/**
 * @swagger
 * /api/collaboration/sessions/:sessionId/statistics:
 *   get:
 *     summary: Get session statistics
 *     tags: [Collaboration]
 */
router.get('/sessions/:sessionId/statistics', authMiddleware, collaborationController.getSessionStatistics);

/**
 * @swagger
 * /api/collaboration/sessions/:sessionId/presence:
 *   get:
 *     summary: Get session presence
 *     tags: [Collaboration]
 */
router.get('/sessions/:sessionId/presence', authMiddleware, collaborationController.getSessionPresence);

/**
 * @swagger
 * /api/collaboration/sessions/:sessionId:
 *   delete:
 *     summary: End collaborative session
 *     tags: [Collaboration]
 */
router.delete('/sessions/:sessionId', authMiddleware, collaborationController.endSession);

/**
 * @swagger
 * /api/collaboration/documents:
 *   post:
 *     summary: Create collaborative document
 *     tags: [Collaboration]
 */
router.post('/documents', authMiddleware, collaborationController.createDocument);

/**
 * @swagger
 * /api/collaboration/documents/:documentId:
 *   get:
 *     summary: Get collaborative document
 *     tags: [Collaboration]
 */
router.get('/documents/:documentId', authMiddleware, collaborationController.getDocument);

module.exports = router;
