const express = require('express');
const router = express.Router();

const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

/**
 * ✅ CREATE POST
 * POST /api/v1/posts
 * Access: Any authenticated user
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { caption } = req.body;

    if (!caption) {
      return res.status(400).json({ message: 'Caption is required' });
    }

    const post = await Post.create({
      caption,
      user: req.user.userId
    });

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post' });
  }
});

/**
 * ✅ FEED
 * GET /api/v1/posts/feed
 * Access: Public
 */
router.get('/feed', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'username email');

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feed' });
  }
});

/**
 * ❌ DELETE POST
 * DELETE /api/v1/posts/:id
 *
 * Rules:
 * - Owner → allowed
 * - Admin / Moderator → allowed
 * - Others → denied
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isOwner = post.user.toString() === req.user.userId;
    const isAdminOrModerator =
      req.user.role === 'admin' || req.user.role === 'moderator';

    if (!isOwner && !isAdminOrModerator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

module.exports = router;
