
import express from 'express';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all comments by the current user
router.get('/my', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ user: req.userId })
      .populate('post', 'content')
      .sort({ createdAt: -1 });
    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all comments for a post (with nested replies)
router.get('/post/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get total count of top-level comments
    const total = await Comment.countDocuments({ post: postId, parentComment: null });

    // Get paginated top-level comments (no parent)
    const comments = await Comment.find({ 
      post: postId, 
      parentComment: null 
    })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    // Get all replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('user', 'name email avatar')
          .sort({ createdAt: 1 })
          .lean();
        return {
          ...comment,
          replies,
          replyCount: replies.length
        };
      })
    );

    res.json({
      comments: commentsWithReplies,
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get replies for a specific comment
router.get('/:commentId/replies', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const replies = await Comment.find({ parentComment: commentId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json({
      replies,
      total: replies.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a comment (or reply)
router.post('/', auth, async (req, res) => {
  try {
    const { postId, text, parentCommentId } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If replying to a comment, verify it exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = new Comment({
      post: postId,
      user: req.userId,
      text: text.trim(),
      parentComment: parentCommentId || null
    });

    await comment.save();
    await comment.populate('user', 'name email avatar');

    res.status(201).json({
      comment,
      message: 'Comment created successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a comment
router.put('/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.text = text.trim();
    await comment.save();
    await comment.populate('user', 'name email avatar');

    res.json({
      comment,
      message: 'Comment updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a comment
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: commentId });
    
    // Delete the comment itself
    await Comment.findByIdAndDelete(commentId);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike a comment
router.put('/:commentId/like', auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userIndex = comment.likes.indexOf(req.userId);
    
    if (userIndex !== -1) {
      // Unlike: remove user from likes
      comment.likes.splice(userIndex, 1);
    } else {
      // Like: add user to likes
      comment.likes.push(req.userId);
    }

    await comment.save();
    await comment.populate('user', 'name email avatar');

    res.json({
      comment,
      isLiked: userIndex === -1,
      likesCount: comment.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get comment count for a post
router.get('/post/:postId/count', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const count = await Comment.countDocuments({ post: postId });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
