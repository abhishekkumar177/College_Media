const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SearchController = require('../controllers/searchController');
const logger = require('../utils/logger');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

// Apply rate limiter
router.use(apiLimiter);

// Optional auth middleware - allows both authenticated and unauthenticated searches
const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userId = decoded.userId;
        } catch (error) {
            // Token invalid, continue as unauthenticated
        }
    }
    next();
};

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Global search across posts, users, and events
 *     description: Search everything with optional type filter and advanced filters (type:post, date:last_week, etc.)
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: Filter string (e.g., "type:post date:last_week role:moderator")
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [post, user, event]
 *         description: Limit results to specific type
 *     responses:
 *       200:
 *         description: Global search results
 */
router.get('/', optionalAuth, SearchController.globalSearch);

/**
 * @swagger
 * /api/search/advanced:
 *   get:
 *     summary: Advanced search with pagination
 *     description: Full-text search with filtering and pagination support
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: Filter string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Paginated search results
 */
router.get('/advanced', optionalAuth, SearchController.advancedSearch);

/**
 * @swagger
 * /api/search/posts:
 *   get:
 *     summary: Search posts only
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: Filter string (e.g., "date:last_week sort:popular")
 *     responses:
 *       200:
 *         description: Post search results
 */
router.get('/posts', optionalAuth, SearchController.searchPosts);

/**
 * @swagger
 * /api/search/users:
 *   get:
 *     summary: Search users
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: Filter string (e.g., "verified:true role:moderator")
 *     responses:
 *       200:
 *         description: User search results
 */
router.get('/users', optionalAuth, SearchController.searchUsers);

/**
 * @swagger
 * /api/search/events:
 *   get:
 *     summary: Search events
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: Filter string (e.g., "date:last_month sort:upcoming")
 *     responses:
 *       200:
 *         description: Event search results
 */
router.get('/events', optionalAuth, SearchController.searchEvents);

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: Get search suggestions (autocomplete)
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Partial query for suggestions
 *         minLength: 2
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search suggestions for autocomplete
 */
router.get('/suggestions', SearchController.getSuggestions);

module.exports = router;
