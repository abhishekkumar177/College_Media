const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserMongo = require('../models/User');
const UserMock = require('../mockdb/userDB');
const MessageMongo = require('../models/Message');
const MessageMock = require('../mockdb/messageDB');
const { validateAccountDeletion, checkValidation } = require('../middleware/validationMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      data: null,
      message: 'Invalid token.'
    });
  }
};

/**
 * @route   DELETE /api/account
 * @desc    Delete user account (soft delete)
 * @access  Private
 */
router.delete('/', verifyToken, validateAccountDeletion, checkValidation, async (req, res) => {
  try {
    const { password, reason } = req.body;
    console.log('Delete account request received:', { 
      userId: req.userId, 
      hasPassword: !!password, 
      passwordLength: password?.length 
    });
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    // Get user
    let user;
    if (useMongoDB) {
      user = await UserMongo.findById(req.userId);
    } else {
      user = await UserMock.findById(req.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found'
      });
    }

    // Check if already deleted - return idempotent response
    if (user.isDeleted) {
      return res.status(200).json({
        success: true,
        data: {
          isDeleted: true,
          deletedAt: user.deletedAt,
          scheduledDeletionDate: user.scheduledDeletionDate,
          message: 'Account is already scheduled for deletion'
        },
        message: 'Account deletion already scheduled'
      });
    }

    // Verify password
    console.log('Verifying password for user:', user.email);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password verification result:', isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Incorrect password'
      });
    }

    // Soft delete user account
    if (useMongoDB) {
      await user.softDelete(reason);
    } else {
      await UserMock.softDelete(req.userId, reason);
    }

    // Anonymize or delete user's messages
    if (useMongoDB) {
      // Delete all messages where user is sender or receiver
      await MessageMongo.updateMany(
        { $or: [{ sender: req.userId }, { receiver: req.userId }] },
        { $push: { deletedBy: req.userId } }
      );
    } else {
      // Handle mock database message cleanup
      const messages = await MessageMock.find({});
      for (const msg of messages) {
        if (msg.sender === req.userId || msg.receiver === req.userId) {
          if (!msg.deletedBy.includes(req.userId)) {
            await MessageMock.updateOne(
              { _id: msg._id },
              { $push: { deletedBy: req.userId } }
            );
          }
        }
      }
    }

    // Log deletion for audit
    console.log(`User account deleted: ${req.userId} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      data: {
        scheduledDeletionDate: user.scheduledDeletionDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        message: 'Your account has been scheduled for deletion. You have 30 days to restore it.'
      },
      message: 'Account deletion initiated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error deleting account'
    });
  }
});

/**
 * @route   POST /api/account/restore
 * @desc    Restore a deleted account
 * @access  Private
 */
router.post('/restore', verifyToken, async (req, res) => {
  try {
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    // Get user
    let user;
    if (useMongoDB) {
      user = await UserMongo.findById(req.userId);
    } else {
      user = await UserMock.findById(req.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found'
      });
    }

    // Check if account is deleted
    if (!user.isDeleted) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Account is not deleted'
      });
    }

    // Check if permanent deletion deadline has passed
    if (user.scheduledDeletionDate && new Date() > user.scheduledDeletionDate) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Account deletion deadline has passed. Cannot restore.'
      });
    }

    // Restore account
    if (useMongoDB) {
      await user.restore();
    } else {
      await UserMock.restore(req.userId);
    }

    // Log restoration for audit
    console.log(`User account restored: ${req.userId} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      data: null,
      message: 'Account restored successfully'
    });
  } catch (error) {
    console.error('Restore account error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error restoring account'
    });
  }
});

/**
 * @route   DELETE /api/account/permanent
 * @desc    Permanently delete user account (admin only or after grace period)
 * @access  Private/Admin
 */
router.delete('/permanent', verifyToken, async (req, res) => {
  try {
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    // Get user
    let user;
    if (useMongoDB) {
      user = await UserMongo.findById(req.userId);
    } else {
      user = await UserMock.findById(req.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found'
      });
    }

    // Check if account is soft-deleted
    if (!user.isDeleted) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Account must be soft-deleted first'
      });
    }

    // Permanently delete user's messages
    if (useMongoDB) {
      await MessageMongo.deleteMany({
        $or: [{ sender: req.userId }, { receiver: req.userId }]
      });
    } else {
      const messages = await MessageMock.find({});
      for (const msg of messages) {
        if (msg.sender === req.userId || msg.receiver === req.userId) {
          await MessageMock.deleteOne({ _id: msg._id });
        }
      }
    }

    // TODO: Delete user's posts, comments, likes, etc.

    // Remove user from followers/following lists
    if (useMongoDB) {
      await UserMongo.updateMany(
        { followers: req.userId },
        { $pull: { followers: req.userId } }
      );
      await UserMongo.updateMany(
        { following: req.userId },
        { $pull: { following: req.userId } }
      );
    }

    // Permanently delete user account
    if (useMongoDB) {
      await UserMongo.findByIdAndDelete(req.userId);
    } else {
      await UserMock.permanentDelete(req.userId);
    }

    // Log permanent deletion for audit
    console.log(`User account permanently deleted: ${req.userId} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      data: null,
      message: 'Account permanently deleted'
    });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error permanently deleting account'
    });
  }
});

/**
 * @route   GET /api/account/deletion-status
 * @desc    Get account deletion status
 * @access  Private
 */
router.get('/deletion-status', verifyToken, async (req, res) => {
  try {
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    // Get user
    let user;
    if (useMongoDB) {
      user = await UserMongo.findById(req.userId).select('isDeleted deletedAt scheduledDeletionDate deletionReason');
    } else {
      user = await UserMock.findById(req.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found'
      });
    }

    const status = {
      isDeleted: user.isDeleted || false,
      deletedAt: user.deletedAt || null,
      scheduledDeletionDate: user.scheduledDeletionDate || null,
      deletionReason: user.deletionReason || null,
      canRestore: user.isDeleted && user.scheduledDeletionDate && new Date() < new Date(user.scheduledDeletionDate),
      daysUntilPermanentDeletion: user.scheduledDeletionDate 
        ? Math.ceil((new Date(user.scheduledDeletionDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null
    };

    res.json({
      success: true,
      data: status,
      message: 'Deletion status retrieved successfully'
    });
  } catch (error) {
    console.error('Get deletion status error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error retrieving deletion status'
    });
  }
});

/**
 * @route   POST /api/account/export-data
 * @desc    Export user's data (GDPR compliance)
 * @access  Private
 */
router.post('/export-data', verifyToken, async (req, res) => {
  try {
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    // Get user
    let user;
    if (useMongoDB) {
      user = await UserMongo.findById(req.userId).select('-password');
    } else {
      user = await UserMock.findById(req.userId);
      if (user) {
        delete user.password;
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found'
      });
    }

    // Get user's messages
    let messages;
    if (useMongoDB) {
      messages = await MessageMongo.find({
        $or: [{ sender: req.userId }, { receiver: req.userId }]
      }).select('-deletedBy');
    } else {
      messages = await MessageMock.find({});
      messages = messages.filter(m => 
        m.sender === req.userId || m.receiver === req.userId
      );
    }

    // TODO: Get user's posts, comments, likes, etc.

    const exportData = {
      exportDate: new Date().toISOString(),
      user: user,
      messages: messages,
      posts: [], // TODO: Add posts
      comments: [], // TODO: Add comments
      likes: [] // TODO: Add likes
    };

    res.json({
      success: true,
      data: exportData,
      message: 'Data exported successfully'
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error exporting data'
    });
  }
});

module.exports = router;
