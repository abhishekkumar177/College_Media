const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const UserMongo = require('../models/User');
const UserMock = require('../mockdb/userDB');
const MessageMongo = require('../models/Message');
const MessageMock = require('../mockdb/messageDB');
const { validateAccountDeletion, checkValidation } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');
const { sensitiveLimiter, apiLimiter } = require('../middleware/rateLimitMiddleware');
const { isValidPassword } = require('../utils/validators');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

/* ---------------- VERIFY TOKEN ---------------- */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(400).json({ success: false, message: 'Invalid token' });
  }
};

/* =====================================================
   GET USER PROFILE
  try {
    const { password, reason } = req.body;
    logger.info('Delete account request received:', {
      userId: req.userId,
      hasPassword: !!password,
      passwordLength: password?.length
    });
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    /* -------- MOCK DB -------- */
    if (!useMongoDB) {
      const user = await UserMock.findById(req.userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(401).json({ success: false, message: 'Incorrect password' });

      await UserMock.softDelete(req.userId, reason);
      await MessageMock.softDeleteByUser(req.userId);

    // Verify password
    logger.info('Verifying password for user:', { email: user.email });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    logger.info('Password verification result:', { isPasswordValid });
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Incorrect password'
      });
    }

    /* -------- MONGODB TRANSACTION -------- */
    await session.withTransaction(async () => {
      const user = await UserMongo.findOne({
        _id: req.userId,
        __v: version,          // 🔐 OPTIMISTIC LOCK CHECK
        isDeleted: false
      }).session(session);

      if (!user) {
        throw new Error('VERSION_CONFLICT');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('INVALID_PASSWORD');
      }

      user.isDeleted = true;
      user.deletedAt = new Date();
      user.deletionReason = reason;
      user.scheduledDeletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await user.save({ session }); // increments __v

      await MessageMongo.updateMany(
        { $or: [{ sender: req.userId }, { receiver: req.userId }] },
        { $addToSet: { deletedBy: req.userId } },
        { session }
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
    logger.info(`User account deleted: ${req.userId} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Account deletion initiated successfully'
    });
  } catch (error) {
    logger.error('Delete account error:', error);
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
router.post('/restore', verifyToken, apiLimiter, async (req, res) => {
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

  } catch (error) {
    if (error.message === 'INVALID_PASSWORD') {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    if (error.message === 'VERSION_CONFLICT') {
      return res.status(409).json({
        success: false,
        message: 'Account data was modified by another request. Please refresh and try again.'
      });
    }

    // Restore account
    if (useMongoDB) {
      await user.restore();
    } else {
      await UserMock.restore(req.userId);
    }

    // Log restoration for audit
    logger.info(`User account restored: ${req.userId} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      data: null,
      message: 'Account restored successfully'
    });
  } catch (error) {
    logger.error('Restore account error:', error);
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
router.delete('/permanent', verifyToken, sensitiveLimiter, async (req, res) => {
  try {
    const { version } = req.body;
    const { useMongoDB } = req.app.get('dbConnection');

    if (!useMongoDB) {
      const restored = await UserMock.restore(req.userId);
      if (!restored) {
        return res.status(400).json({ success: false, message: 'Cannot restore account' });
      }
      return res.json({ success: true, message: 'Account restored successfully' });
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
    logger.info(`User account permanently deleted: ${req.userId} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      data: null,
      message: 'Account permanently deleted'
    });
  } catch (error) {
    logger.error('Permanent delete error:', error);
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
router.get('/deletion-status', verifyToken, apiLimiter, async (req, res) => {
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
      return res.status(409).json({
        success: false,
        message: 'Account was modified elsewhere. Please refresh.'
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
    logger.error('Get deletion status error:', error);
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
router.post('/export-data', verifyToken, sensitiveLimiter, async (req, res) => {
  try {
    const { useMongoDB } = req.app.get('dbConnection');

    if (!useMongoDB) {
      await UserMock.permanentDelete(req.userId);
      return res.json({ success: true, message: 'Account permanently deleted' });
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

    await MessageMongo.deleteMany({
      $or: [{ sender: req.userId }, { receiver: req.userId }]
    });

    await UserMongo.findByIdAndDelete(req.userId);

    res.json({ success: true, message: 'Account permanently deleted' });
  } catch (error) {
    logger.error('Export data error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error exporting data'
    });
  }
});

/* =====================================================
   GET USER SETTINGS
===================================================== */
router.get('/settings', verifyToken, async (req, res) => {
  try {
    const { useMongoDB } = req.app.get('dbConnection');

    const user = useMongoDB
      ? await UserMongo.findById(req.userId).select('settings')
      : await UserMock.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return default settings if none exist
    const settings = user.settings || {
      fontSize: 'medium',
      theme: 'auto',
      notifications: {
        email: true,
        push: true,
        inApp: true
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false
      }
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
});

/* =====================================================
   UPDATE USER SETTINGS
===================================================== */
router.put('/settings', verifyToken, async (req, res) => {
  try {
    const { useMongoDB } = req.app.get('dbConnection');
    const { fontSize, theme, notifications, privacy } = req.body;

    const updateData = {};
    if (fontSize) updateData['settings.fontSize'] = fontSize;
    if (theme) updateData['settings.theme'] = theme;
    if (notifications) updateData['settings.notifications'] = notifications;
    if (privacy) updateData['settings.privacy'] = privacy;

    if (useMongoDB) {
      const user = await UserMongo.findByIdAndUpdate(
        req.userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('settings');

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({
        success: true,
        data: user.settings,
        message: 'Settings updated successfully'
      });
    } else {
      const user = await UserMock.findById(req.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      user.settings = { ...user.settings, ...req.body };
      await UserMock.update(req.userId, user);

      res.json({
        success: true,
        data: user.settings,
        message: 'Settings updated successfully'
      });
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Error updating settings' });
  }
});

module.exports = router;
