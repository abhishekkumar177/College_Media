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
   DELETE ACCOUNT (SOFT DELETE)
   ✔ Transaction
   ✔ Optimistic Locking
   ✔ Data Consistency
===================================================== */
router.delete('/', verifyToken, validateAccountDeletion, checkValidation, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { password, reason, version } = req.body;
    const { useMongoDB } = req.app.get('dbConnection');

    /* -------- MOCK DB -------- */
    if (!useMongoDB) {
      const user = await UserMock.findById(req.userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(401).json({ success: false, message: 'Incorrect password' });

      await UserMock.softDelete(req.userId, reason);
      await MessageMock.softDeleteByUser(req.userId);

      return res.json({ success: true, message: 'Account deletion initiated successfully' });
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
    });

    res.json({
      success: true,
      message: 'Account deletion initiated successfully'
    });

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

    console.error(error);
    res.status(500).json({ success: false, message: 'Error deleting account' });
  } finally {
    session.endSession();
  }
});

/* =====================================================
   RESTORE ACCOUNT (OPTIMISTIC LOCK SAFE)
===================================================== */
router.post('/restore', verifyToken, async (req, res) => {
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

    const user = await UserMongo.findOneAndUpdate(
      {
        _id: req.userId,
        __v: version,      // 🔐 optimistic lock
        isDeleted: true,
        scheduledDeletionDate: { $gt: new Date() }
      },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          deletionReason: null,
          scheduledDeletionDate: null
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(409).json({
        success: false,
        message: 'Account was modified elsewhere. Please refresh.'
      });
    }

    res.json({ success: true, message: 'Account restored successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error restoring account' });
  }
});

/* =====================================================
   PERMANENT DELETE (SAFE)
===================================================== */
router.delete('/permanent', verifyToken, async (req, res) => {
  try {
    const { useMongoDB } = req.app.get('dbConnection');

    if (!useMongoDB) {
      await UserMock.permanentDelete(req.userId);
      return res.json({ success: true, message: 'Account permanently deleted' });
    }

    const user = await UserMongo.findById(req.userId);
    if (!user || !user.isDeleted) {
      return res.status(400).json({ success: false, message: 'Account not eligible' });
    }

    await MessageMongo.deleteMany({
      $or: [{ sender: req.userId }, { receiver: req.userId }]
    });

    await UserMongo.findByIdAndDelete(req.userId);

    res.json({ success: true, message: 'Account permanently deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error deleting account permanently' });
  }
});

module.exports = router;
