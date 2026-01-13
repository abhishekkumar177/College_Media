const express = require('express');
const MessageMongo = require('../models/Message');
const MessageMock = require('../mockdb/messageDB');
const UserMongo = require('../models/User');
const UserMock = require('../mockdb/userDB');
const { validateMessage, validateMessageId, checkValidation } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');
const { isValidMessageContent, isValidURL, isValidObjectId } = require('../utils/validators');

const { parsePaginationParams, paginateQuery, paginateArray } = require('../utils/pagination');
const { cacheMiddleware, invalidateCache } = require('../middleware/cacheMiddleware');

const cache = require('../utils/cache');
const { checkPermission, PERMISSIONS } = require('../middleware/rbacMiddleware');

const { hasPermission } = require('../config/roles');
const { getIO, isUserOnline } = require('../socket');
const router = express.Router();
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "college_media_secret_key";

// Apply general rate limiter to all message routes
router.use(apiLimiter);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessageInput'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Message' }
 *                 message: { type: string }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', verifyToken, validateMessage, checkValidation, invalidateCache(['user-conversations::userId', 'user-unread-count::userId']), async (req, res) => {
  try {
    const { receiver, content, messageType, attachmentUrl } = req.body;

    // Validate message content
    if (!isValidMessageContent(content)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Message content must be 1-2000 characters'
      });
    }

    // Validate receiver ID format
    if (!isValidObjectId(receiver)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid receiver ID format'
      });
    }

    // Validate attachment URL if provided
    if (attachmentUrl && !isValidURL(attachmentUrl)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid attachment URL format'
      });
    }

    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

      if (receiver === req.userId) {
        return res.status(400).json({
          success: false,
          message: "Cannot send message to yourself",
        });
      }

      const messageData = {
        sender: req.userId,
        receiver,
        content,
        messageType: messageType || "text",
        attachmentUrl: attachmentUrl || null,
      };

      let message;

      if (useMongoDB) {
        const conversationId =
          MessageMongo.generateConversationId(
            req.userId,
            receiver
          );

        message = await MessageMongo.create({
          ...messageData,
          conversationId,
        });

        message = await message.populate(
          "sender receiver",
          "username firstName lastName profilePicture"
        );
      } else {
        message = await MessageMock.create(messageData);
      }

      /* --------------------------------------------------
         🔌 DEPENDENCY CALL (Notification Service)
         - Failure will NOT break main flow
      -------------------------------------------------- */
      const notificationResult = await req.callDependency(
        {
          method: "POST",
          url: process.env.NOTIFICATION_SERVICE_URL || "https://example.com/notify",
          data: {
            userId: receiver,
            type: "NEW_MESSAGE",
            message: "You have received a new message",
          },
        },
        { delivered: false } // ✅ fallback
      );

    // Invalidate receiver's cache manually
    try {
      await Promise.all([
        cache.del(cache.generateKey('user-conversations', receiver)),
        cache.del(cache.generateKey('user-unread-count', receiver)),
        // Invalidate conversation messages for both
        cache.invalidatePattern(`cache:user-conversation-messages:${req.userId}:*`),
        cache.invalidatePattern(`cache:user-conversation-messages:${receiver}:*`)
      ]);
    } catch (cacheErr) {
      logger.warn('Failed to invalidate receiver cache:', cacheErr);
    }

    // Emit real-time event
    try {
      const io = getIO();
      // Emit to receiver
      io.to(receiver).emit('new_message', message);
      // Emit to sender (for multi-device sync)
      io.to(req.userId).emit('new_message', message);
    } catch (socketErr) {
      logger.warn('Socket emit error:', socketErr.message);
    }

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error sending message'
    });
  }
);

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations for the authenticated user
 * @access  Private
 */
router.get('/conversations', verifyToken, cacheMiddleware({ prefix: 'user-conversations', ttl: 60 }), async (req, res) => {
  try {
    const useMongoDB = req.app.get("dbConnection")?.useMongoDB;
    let conversations = [];

    if (useMongoDB) {
      const messages = await MessageMongo.find({
        $or: [{ sender: req.userId }, { receiver: req.userId }],
        deletedBy: { $nin: [req.userId] },
      })
        .populate(
          "sender receiver",
          "username firstName lastName profilePicture"
        )
        .sort({ createdAt: -1 });

      const map = new Map();

      messages.forEach((msg) => {
        if (!map.has(msg.conversationId)) {
          map.set(msg.conversationId, {
            conversationId: msg.conversationId,
            lastMessage: msg,
            unreadCount: 0,
          });
        }
        if (
          msg.receiver._id.toString() === req.userId &&
          !msg.isRead
        ) {
          map.get(msg.conversationId).unreadCount++;
        }

        const conv = conversationMap.get(conversationId);
        conv.messages.push(msg);

        if (msg.receiver === req.userId && !msg.isRead) {
          conv.unreadCount++;
        }
      });

      conversations = Array.from(conversationMap.values());
    }

    res.json({
      success: true,
      data: conversations,
      message: 'Conversations retrieved successfully'
    });
  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error retrieving conversations'
    });
  }
});

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    Get all messages in a conversation with a specific user
 * @access  Private
 */
router.get('/conversation/:userId', verifyToken, cacheMiddleware({ prefix: 'user-conversation-messages', ttl: 30 }), async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    let messages;
    let totalMessages;

    if (useMongoDB) {
      const conversationId = MessageMongo.generateConversationId(req.userId, userId);

      totalMessages = await MessageMongo.countDocuments({
        conversationId,
        deletedBy: { $nin: [req.userId] }
      });

      messages = await MessageMongo.find({
        conversationId,
        deletedBy: { $nin: [req.userId] }
      })
        .populate('sender', 'username firstName lastName profilePicture')
        .populate('receiver', 'username firstName lastName profilePicture')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    } else {
      const conversationId = MessageMock.generateConversationId(req.userId, userId);
      const allMessages = await MessageMock.find({ conversationId });

      messages = allMessages
        .filter(msg => !msg.deletedBy.includes(req.userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice((page - 1) * limit, page * limit);

      totalMessages = messages.length;
    }

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          limit: parseInt(limit)
        }
      },
      message: 'Messages retrieved successfully'
    });
  } catch (error) {
    logger.error('Get conversation messages error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error retrieving messages'
    });
  }
});

/**
 * @route   PUT /api/messages/:messageId/read
 * @desc    Mark a message as read
 * @access  Private
 */
router.put('/:messageId/read', verifyToken, validateMessageId, checkValidation, invalidateCache(['user-conversations::userId', 'user-unread-count::userId']), async (req, res) => {
  try {
    const { messageId } = req.params;
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    let message;

    if (useMongoDB) {
      message = await MessageMongo.findById(messageId);

      if (!message) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Message not found'
        });
      }

      // Only receiver can mark as read
      if (message.receiver.toString() !== req.userId) {
        return res.status(403).json({
          success: false,
          data: null,
          message: 'Not authorized to mark this message as read'
        });
      }

      if (!message.isRead) {
        await message.markAsRead();
      }
    } else {
      message = await MessageMock.findById(messageId);

      if (!message) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Message not found'
        });
      }

      if (message.receiver !== req.userId) {
        return res.status(403).json({
          success: false,
          data: null,
          message: 'Not authorized to mark this message as read'
        });
      }

      if (!message.isRead) {
        await MessageMock.updateOne(
          { _id: messageId },
          { $set: { isRead: true, readAt: new Date().toISOString() } }
        );
        message = await MessageMock.findById(messageId);
      }
    }

    res.json({
      success: true,
      data: conversations,
      payload: conversations,
      meta: { apiVersion: req.apiVersion },
      message: "Conversations retrieved successfully",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message (soft delete for user)
 * @access  Private
 */
router.delete('/:messageId', verifyToken, validateMessageId, checkValidation, invalidateCache(['user-conversations::userId']), async (req, res) => {
  try {
    const { messageId } = req.params;
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    let message;

    if (useMongoDB) {
      message = await MessageMongo.findById(messageId);

      if (!message) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Message not found'
        });
      }

      // Obtain user role if not already present (verifyToken + fetch or middleware)
      let userRole = req.userRole;
      // If verifyToken doesn't attach role, we might need to fetch it or rely on a preceding middleware
      // For now, let's fetch if missing, but ideally rbacMiddleware's checkRole or verifyToken handles this.
      // Since we want to allow owner OR admin, we do a manual check here or use a flexible logic.
      if (!userRole) {
        const user = await UserMongo.findById(req.userId);
        userRole = user ? user.role : 'student';
      }

      // Check if user is owner of the message
      const isOwner = message.sender.toString() === req.userId || message.receiver.toString() === req.userId;

      // Check if user has admin permission to delete any message
      const canDeleteAny = hasPermission(userRole, PERMISSIONS.DELETE_ANY_MESSAGE);

      if (!isOwner && !canDeleteAny) {
        return res.status(403).json({
          success: false,
          data: null,
          message: 'Not authorized to delete this message'
        });
      }

      // Add user to deletedBy array (soft delete)
      if (!message.deletedBy.includes(req.userId)) {
        message.deletedBy.push(req.userId);
        await message.save();
      }

      // If both users deleted, permanently delete
      if (message.deletedBy.length === 2) {
        await MessageMongo.deleteOne({ _id: messageId });
      }
    } else {
      message = await MessageMock.findById(messageId);

      if (!message) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Message not found'
        });
      }

      if (message.sender !== req.userId && message.receiver !== req.userId) {
        // Mock DB RBAC simulation (simplified)
        // In a real scenario, we'd check the mock user's role too
        return res.status(403).json({
          success: false,
          data: null,
          message: 'Not authorized to delete this message'
        });
      }

      if (!message.deletedBy.includes(req.userId)) {
        await MessageMock.updateOne(
          { _id: messageId },
          { $push: { deletedBy: req.userId } }
        );
        message = await MessageMock.findById(messageId);
      }

      // If both users deleted, permanently delete
      if (message.deletedBy.length === 2) {
        await MessageMock.deleteOne({ _id: messageId });
      }
    }

    res.json({
      success: true,
      data: null,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error deleting message'
    });
  }
});

/**
 * @route   GET /api/messages/unread/count
 * @desc    Get count of unread messages
 * @access  Private
 */
router.get('/unread/count', verifyToken, cacheMiddleware({ prefix: 'user-unread-count', ttl: 300 }), async (req, res) => {
  try {
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    let unreadCount;

    if (useMongoDB) {
      unreadCount = await MessageMongo.countDocuments({
        receiver: req.userId,
        isRead: false,
        deletedBy: { $nin: [req.userId] }
      });
    } else {
      unreadCount = await MessageMock.countDocuments({
        receiver: req.userId,
        isRead: false,
        deletedBy: { $nin: [req.userId] }
      });
    }

    res.json({
      success: true,
      data: { unreadCount },
      message: 'Unread count retrieved successfully'
    });
  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error retrieving unread count'
    });
  }
});

/**
 * @route   PUT /api/messages/conversation/:userId/read-all
 * @desc    Mark all messages in a conversation as read
 * @access  Private
 */
router.put('/conversation/:userId/read-all', verifyToken, invalidateCache(['user-conversations::userId', 'user-unread-count::userId']), async (req, res) => {
  try {
    const { userId } = req.params;
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    if (useMongoDB) {
      const conversationId = MessageMongo.generateConversationId(req.userId, userId);

      await MessageMongo.updateMany(
        {
          conversationId,
          receiver: req.userId,
          isRead: false
        },
        {
          $set: {
            isRead: true,
            readAt: new Date()
          }
        }
      );
    } else {
      const conversationId = MessageMock.generateConversationId(req.userId, userId);
      const messages = await MessageMock.find({ conversationId });

      for (const msg of messages) {
        if (msg.receiver === req.userId && !msg.isRead) {
          await MessageMock.updateOne(
            { _id: msg._id },
            { $set: { isRead: true, readAt: new Date().toISOString() } }
          );
        }
      }
    }

    res.json({
      success: true,
      data: { unreadCount },
      payload: { unreadCount },
      meta: { apiVersion: req.apiVersion },
      message: "Unread count retrieved successfully",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
