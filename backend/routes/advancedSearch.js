/**
 * Advanced Search Routes
 * Issue #910: Advanced Search with Elasticsearch Integration
 * 
 * API routes for Elasticsearch-powered search.
 */

const express = require('express');
const router = express.Router();
const advancedSearchController = require('../controllers/advancedSearchController');

// Middleware (simplified - use actual auth middleware in production)
const authMiddleware = (req, res, next) => {
    // In production, verify JWT and attach user to req.user
    next();
};

const adminMiddleware = (req, res, next) => {
    // In production, check if user is admin
    next();
};

/**
 * @swagger
 * /api/search/advanced:
 *   post:
 *     summary: Perform advanced search with Elasticsearch
 *     tags: [Advanced Search]
 */
router.post('/advanced', authMiddleware, advancedSearchController.advancedSearch);

/**
 * @swagger
 * /api/search/advanced/autocomplete:
 *   get:
 *     summary: Get autocomplete suggestions
 *     tags: [Advanced Search]
 */
router.get('/advanced/autocomplete', authMiddleware, advancedSearchController.autocomplete);

/**
 * @swagger
 * /api/search/advanced/sync:
 *   post:
 *     summary: Trigger manual Elasticsearch sync (Admin only)
 *     tags: [Advanced Search]
 */
router.post('/advanced/sync', authMiddleware, adminMiddleware, advancedSearchController.triggerSync);

/**
 * @swagger
 * /api/search/advanced/analytics:
 *   get:
 *     summary: Get search analytics (Admin only)
 *     tags: [Advanced Search]
 */
router.get('/advanced/analytics', authMiddleware, adminMiddleware, advancedSearchController.getAnalytics);

module.exports = router;
