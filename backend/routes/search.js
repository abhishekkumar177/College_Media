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
 *     summary: Unified search across users and posts
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per category
 *     responses:
 *       200:
 *         description: Search results from all categories
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Search query must be at least 2 characters'
            });
        }

        const results = await SearchController.searchAll(q, { limit: parseInt(limit) });

        res.json({
            success: true,
            data: results,
            message: 'Search completed successfully'
        });
    } catch (error) {
        logger.error('Search error:', error);
        res.status(500).json({
            success: false,
            data: null,
            message: 'Search failed'
        });
    }
});

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
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevance, recent, followers]
 *     responses:
 *       200:
 *         description: User search results
 */
router.get('/users', optionalAuth, async (req, res) => {
    try {
        const { q, page = 1, limit = 20, sortBy = 'relevance', role } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const results = await SearchController.searchUsers(q, {
            limit: parseInt(limit),
            skip,
            sortBy,
            filters: { role }
        });

        res.json({
            success: true,
            data: results,
            message: 'User search completed'
        });
    } catch (error) {
        logger.error('User search error:', error);
        res.status(500).json({
            success: false,
            data: null,
            message: 'User search failed'
        });
    }
});

/**
 * @swagger
 * /api/search/posts:
 *   get:
 *     summary: Search posts
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevance, recent, popular]
 *     responses:
 *       200:
 *         description: Post search results
 */
router.get('/posts', optionalAuth, async (req, res) => {
    try {
        const { q, page = 1, limit = 20, sortBy = 'relevance', tag, author, dateFrom, dateTo } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const results = await SearchController.searchPosts(q, {
            limit: parseInt(limit),
            skip,
            sortBy,
            filters: { tag, author, dateFrom, dateTo }
        });

        res.json({
            success: true,
            data: results,
            message: 'Post search completed'
        });
    } catch (error) {
        logger.error('Post search error:', error);
        res.status(500).json({
            success: false,
            data: null,
            message: 'Post search failed'
        });
    }
});

/**
 * @swagger
 * /api/search/trending:
 *   get:
 *     summary: Get trending tags
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of trending tags with counts
 */
router.get('/trending', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const tags = await SearchController.getTrendingTags(parseInt(limit));

        res.json({
            success: true,
            data: tags,
            message: 'Trending tags retrieved'
        });
    } catch (error) {
        logger.error('Trending tags error:', error);
        res.status(500).json({
            success: false,
            data: null,
            message: 'Failed to get trending tags'
        });
    }
});

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
 *     responses:
 *       200:
 *         description: Search suggestions
 */
router.get('/suggestions', async (req, res) => {
    try {
        const { q, limit = 5 } = req.query;

        if (!q || q.length < 2) {
            return res.json({
                success: true,
                data: { users: [], tags: [] },
                message: 'Query too short'
            });
        }

        const suggestions = await SearchController.getSuggestions(q, parseInt(limit));

        res.json({
            success: true,
            data: suggestions,
            message: 'Suggestions retrieved'
        });
    } catch (error) {
        logger.error('Suggestions error:', error);
        res.status(500).json({
            success: false,
            data: null,
            message: 'Failed to get suggestions'
        });
    }
});

module.exports = router;
