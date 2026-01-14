const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const User = require('../models/User');
const ModerationService = require('../services/moderationService');
const RecommenderService = require('../services/recommender');
const logger = require('../utils/logger');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');
const { checkPermission, PERMISSIONS } = require('../middleware/rbacMiddleware');

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

// Optional auth - doesn't fail if no token
const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userId = decoded.userId;
        } catch (e) { }
    }
    next();
};

/**
 * @swagger
 * /api/v1/posts/feed/recommended:
 *   get:
 *     summary: Get personalized recommended feed
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.get('/feed/recommended', verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const result = await RecommenderService.getRecommendedFeed(req.userId, {
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: result,
            message: 'Recommended feed retrieved'
        });
    } catch (error) {
        logger.error('Get recommended feed error:', error);
        res.status(500).json({ success: false, message: 'Failed to get feed' });
    }
});

/**
 * @swagger
 * /api/v1/posts/users/recommended:
 *   get:
 *     summary: Get recommended users to follow
 *     tags: [Posts]
 */
router.get('/users/recommended', verifyToken, async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const users = await RecommenderService.getRecommendedUsers(req.userId, parseInt(limit));

        res.json({
            success: true,
            data: users,
            message: 'Recommended users retrieved'
        });
    } catch (error) {
        logger.error('Get recommended users error:', error);
        res.status(500).json({ success: false, message: 'Failed to get users' });
    }
});

/**
 * @swagger
 * /api/v1/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 */
router.post('/', verifyToken, apiLimiter, async (req, res) => {
    try {
        const { content, tags, visibility, images } = req.body;

        // Check content safety asynchronously
        ModerationService.checkAndFlag(content, 'Post', null, req.userId).catch(err =>
            logger.error('Content safety check failed:', err)
        );

        const post = await Post.create({
            author: req.userId,
            content,
            tags,
            visibility,
            images
        });

        // Update targetId for content safety check
        ModerationService.checkAndFlag(content, 'Post', post._id, req.userId);

        res.status(201).json({
            success: true,
            data: post,
            message: 'Post created successfully'
        });
    } catch (error) {
        logger.error('Create post error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/v1/posts/{postId}/like:
 *   post:
 *     summary: Like a post (tracks for recommendations)
 *     tags: [Posts]
 */
router.post('/:postId/like', verifyToken, async (req, res) => {
    try {
        const { postId } = req.params;

        // Track interaction for recommendations
        await RecommenderService.trackInteraction(req.userId, postId, 'post', 'like');

        // Update like count
        await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });

        res.json({ success: true, message: 'Post liked' });
    } catch (error) {
        logger.error('Like post error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/v1/posts/{postId}/report:
 *   post:
 *     summary: Report a post
 *     tags: [Posts]
 */
router.post('/:postId/report', verifyToken, apiLimiter, async (req, res) => {
    try {
        const { reason, description } = req.body;
        const { postId } = req.params;

        const report = await ModerationService.createReport({
            reporterId: req.userId,
            targetType: 'Post',
            targetId: postId,
            reason,
            description
        });

        res.status(201).json({
            success: true,
            data: report,
            message: 'Post reported successfully'
        });
    } catch (error) {
        logger.error('Report post error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: Get feed posts (chronological)
 *     tags: [Posts]
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const posts = await Post.find({ isDeleted: false, visibility: 'public' })
            .populate('author', 'username firstName lastName profilePicture')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
