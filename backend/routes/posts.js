const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const User = require('../models/User');
const ModerationService = require('../services/moderationService');
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

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
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

        // Update targetId for content safety check if we wanted to link it precisely in the catch above
        // But checkAndFlag creates a report if needed. Ideally we pass the post ID.
        // Let's rerun check with ID. Ideally we check BEFORE create, but for "flagging" we create then flag.
        // If we want to block, we check before.
        // Let's do async flag update.
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
 * /api/posts/{postId}/report:
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
 * /api/posts:
 *   get:
 *     summary: Get feed posts
 *     tags: [Posts]
 */
router.get('/', async (req, res) => {
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
