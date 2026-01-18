/**
 * Recommendations Routes
 * Issue #921: AI-Powered Content Recommendation Engine
 * 
 * API routes for recommendations.
 */

const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Middleware (simplified - use actual auth middleware in production)
const authMiddleware = (req, res, next) => next();
const adminMiddleware = (req, res, next) => next();

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Get personalized recommendations
 *     tags: [Recommendations]
 */
router.get('/', authMiddleware, recommendationController.getRecommendations);

/**
 * @swagger
 * /api/recommendations/users:
 *   get:
 *     summary: Get user-to-follow recommendations
 *     tags: [Recommendations]
 */
router.get('/users', authMiddleware, recommendationController.getUserRecommendations);

/**
 * @swagger
 * /api/recommendations/trending:
 *   get:
 *     summary: Get trending content
 *     tags: [Recommendations]
 */
router.get('/trending', authMiddleware, recommendationController.getTrending);

/**
 * @swagger
 * /api/recommendations/stats:
 *   get:
 *     summary: Get recommendation statistics
 *     tags: [Recommendations]
 */
router.get('/stats', authMiddleware, recommendationController.getStats);

/**
 * @swagger
 * /api/recommendations/similar/:postId:
 *   get:
 *     summary: Get similar posts
 *     tags: [Recommendations]
 */
router.get('/similar/:postId', authMiddleware, recommendationController.getSimilarPosts);

/**
 * @swagger
 * /api/recommendations/interaction:
 *   post:
 *     summary: Track user interaction
 *     tags: [Recommendations]
 */
router.post('/interaction', authMiddleware, recommendationController.trackInteraction);

/**
 * @swagger
 * /api/recommendations/feedback:
 *   post:
 *     summary: Submit recommendation feedback
 *     tags: [Recommendations]
 */
router.post('/feedback', authMiddleware, recommendationController.submitFeedback);

/**
 * @swagger
 * /api/recommendations/cache:
 *   delete:
 *     summary: Clear recommendation cache (admin)
 *     tags: [Recommendations]
 */
router.delete('/cache', authMiddleware, adminMiddleware, recommendationController.clearCache);

module.exports = router;
