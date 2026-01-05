const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * ✅ CREATE POST
 * POST /api/v1/posts
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { caption } = req.body;

    if (!caption) {
      return res.status(400).json({ message: 'Caption is required' });
    }

    const post = await Post.create({
      caption,
      user: req.user.userId, // JWT se aaya
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post' });
  }
});

/**
 * ✅ FEED
 * GET /api/v1/posts/feed
 */
router.get('/feed', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'username email');

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feed' });
  }
});

/**
 * ✅ DELETE POST (OWNER ONLY)
 * DELETE /api/v1/posts/:id
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // OWNER CHECK
    if (post.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

module.exports = router;
