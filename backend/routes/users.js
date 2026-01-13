const express = require("express");
const UserMongo = require("../models/User");
const UserMock = require("../mockdb/userDB");
const {
  validateProfileUpdate,
  checkValidation,
} = require("../middleware/validationMiddleware");
const router = express.Router();
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

const { isValidName, isValidBio, isValidEmail } = require('../utils/validators');
const { checkPermission, PERMISSIONS } = require('../middleware/rbacMiddleware');
const { parsePaginationParams, paginateQuery } = require('../utils/pagination');
const { cacheMiddleware, invalidateCache } = require('../middleware/cacheMiddleware');

const { uploadProfilePicture, handleUploadError, getUploadedFileUrl } = require('../middleware/upload');
const { deleteImage, getPublicIdFromUrl, isCloudinaryConfigured } = require('../config/cloudinary');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

/* ------------------
   🔐 AUTH MIDDLEWARE
------------------ */
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
const authorizeSelfOrAdmin = (paramKey = "userId") => {
  return (req, res, next) => {
    const targetId = req.params[paramKey];

    // Admin override
    if (req.currentUser.role === "admin") return next();

    // Owner-only access
    if (targetId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to access this resource",
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};



/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/User' }
 *                 message: { type: string }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/profile', verifyToken, cacheMiddleware({ prefix: 'user-profile', ttl: 300 }), async (req, res, next) => {
  try {
    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');

    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB
      const user = await UserMongo.findById(req.userId).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user,
        message: 'Profile retrieved successfully'
      });
    } else {
      // Use mock database
      const user = await UserMock.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user,
        message: 'Profile retrieved successfully'
      });
    }
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
});

// Update user profile
router.put('/profile', verifyToken, validateProfileUpdate, checkValidation, invalidateCache(['user-profile::userId']), async (req, res, next) => {
  try {
    const { firstName, lastName, bio } = req.body;

    // Validate inputs
    if (firstName && !isValidName(firstName)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid first name format (1-50 characters, letters only)'
      });
    }

    if (lastName && !isValidName(lastName)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid last name format (1-50 characters, letters only)'
      });
    }

    if (bio && !isValidBio(bio)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Bio must be 500 characters or less'
      });
    }

    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');

    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB
      const updatedUser = await UserMongo.findByIdAndUpdate(
        req.userId,
        { firstName, lastName, bio },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } else {
      // Use mock database
      const updatedUser = await UserMock.update(
        req.userId,
        { firstName, lastName, bio }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    }
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
});

// Upload profile picture
router.post('/profile-picture', verifyToken, uploadProfilePicture.single('profilePicture'), handleUploadError, invalidateCache(['user-profile::userId']), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'No file uploaded'
      });
    }

    // Get the uploaded file URL (works for both Cloudinary and local)
    const profilePictureUrl = getUploadedFileUrl(req, req.file);

    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');

    if (dbConnection && dbConnection.useMongoDB) {
      // Get old profile picture URL to delete from Cloudinary
      const user = await UserMongo.findById(req.userId);
      const oldPictureUrl = user?.profilePicture;

      // Update user with new profile picture
      const updatedUser = await UserMongo.findByIdAndUpdate(
        req.userId,
        { profilePicture: profilePictureUrl },
        { new: true, runValidators: true }
      ).select('-password');

/* =====================================================
   👤 GET CURRENT USER PROFILE

      // Delete old image from Cloudinary (if it was a Cloudinary URL)
      if (oldPictureUrl && isCloudinaryConfigured()) {
        const oldPublicId = getPublicIdFromUrl(oldPictureUrl);
        if (oldPublicId) {
          deleteImage(oldPublicId).catch(err => logger.error('Failed to delete old image:', err));
        }
      }

      res.json({
        success: true,
        data: {
          profilePicture: updatedUser.profilePicture
        },
        message: 'Profile picture uploaded successfully'
      });
    } else {
      // Use mock database
      const updatedUser = await UserMock.updateProfilePicture(
        req.userId,
        profilePictureUrl
      );
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          profilePicture: updatedUser.profilePicture
        },
        message: 'Profile picture uploaded successfully'
      });
    }
  } catch (error) {
    logger.error('Upload profile picture error:', error);
    next(error);
  }
});

// Get user by username (for viewing other profiles)
router.get('/profile/:username', verifyToken, cacheMiddleware({
  prefix: 'user-profile-public',
  ttl: 300,
  keyGenerator: (req) => `cache:user-profile-public:${req.params.username}`
}), async (req, res, next) => {
  try {
    const { username } = req.params;

    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');

    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB
      const user = await UserMongo.findOne({ username }).select('-password -email');
      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user,
      });
    }

// Get user's posts
router.get('/profile/:username/posts', verifyToken, cacheMiddleware({
  prefix: 'user-posts-public',
  ttl: 60,
  keyGenerator: (req) => `cache:user-posts-public:${req.params.username}`
}), async (req, res, next) => {
  try {
    const { username } = req.params;

    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');

    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB - You'll need to create a Post model
      const user = await UserMongo.findOne({ username });
      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      // TODO: Implement Post model and fetch posts
      res.json({
        success: true,
        data: [],
        message: 'Posts retrieved successfully'
      });
    } else {
      // Use mock database - return mock posts
      const mockPosts = [
        {
          _id: 1,
          imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop',
          likes: 234,
          commentCount: 45,
          createdAt: new Date()
        },
        {
          _id: 2,
          imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop',
          likes: 189,
          commentCount: 32,
          createdAt: new Date()
        }
      ];

      res.json({
        success: true,
        data: mockPosts,
        message: 'Posts retrieved successfully'
      });
    }
  } catch (error) {
    logger.error('Get user posts error:', error);
    next(error);
  }
});

// Update profile settings (email, privacy, etc.)
router.put('/profile/settings', verifyToken, invalidateCache(['user-profile::userId']), async (req, res, next) => {
  try {
    const { email, isPrivate, notificationSettings } = req.body;

    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');

    const updateData = {};
    if (email) updateData.email = email;
    if (typeof isPrivate !== 'undefined') updateData.isPrivate = isPrivate;
    if (notificationSettings) updateData.notificationSettings = notificationSettings;

    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB
      const updatedUser = await UserMongo.findByIdAndUpdate(
        req.userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      const updatedUser = await UserMock.update(req.userId, {
        firstName,
        lastName,
        bio,
      });

      res.json({
        success: true,
        data: updatedUser,
        message: "Profile updated successfully",
      });
    } catch (err) {
      next(err); // 409 conflict handled globally
    }
  }
);

// Get profile stats (followers, following, posts count)
router.get('/profile/stats', verifyToken, cacheMiddleware({ prefix: 'user-stats', ttl: 300 }), async (req, res, next) => {
  try {
    const { email, isPrivate, notificationSettings } = req.body;
    const db = req.app.get("dbConnection");

    if (db?.useMongoDB) {
      const user = await UserMongo.findById(req.userId);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      if (email) user.email = email;
      if (typeof isPrivate !== "undefined")
        user.isPrivate = isPrivate;
      if (notificationSettings)
        user.notificationSettings = notificationSettings;

      const updatedUser = await user.safeSave();

      return res.json({
        success: true,
        data: updatedUser,
        message: "Settings updated successfully",
      });
    } catch (err) {
      next(err);
    }
router.put("/profile/settings", verifyToken, async (req, res, next) => {
  try {
    const { email, isPrivate, notificationSettings } = req.body;

    if (email) req.currentUser.email = email;
    if (typeof isPrivate !== "undefined")
      req.currentUser.isPrivate = isPrivate;
    if (notificationSettings)
      req.currentUser.notificationSettings = notificationSettings;

    const updatedUser =
      typeof req.currentUser.safeSave === "function"
        ? await req.currentUser.safeSave()
        : await UserMock.update(req.userId, req.body);

    const updatedUser = await UserMock.update(req.userId, req.body);
    res.json({
      success: true,
      data: updatedUser,
      message: "Settings updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// Delete profile picture
router.delete('/profile-picture', verifyToken, invalidateCache(['user-profile::userId']), async (req, res, next) => {
  try {
    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');

        // 🔥 BOTH VERSION CHECKED
        await currentUser.safeSave();
        await targetUser.safeSave();

        return res.json({
          success: true,
          data: { isFollowing: !isFollowing },
          message: isFollowing ? "Unfollowed" : "Followed",
        });
      }

      res.json({
        success: true,
        data: { isFollowing: true },
        message: "Follow action completed",
      });
    } catch (err) {
      next(err);
    }
  }
});

// ADMIN/MODERATOR ROUTES

/**
 * @route   GET /api/users
 * @desc    Get all users (paginated)
 * @access  Private (Admin/Moderator)
 */
router.get('/', verifyToken, checkPermission(PERMISSIONS.VIEW_USERS), async (req, res, next) => {
  try {
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    if (useMongoDB) {
      const { page, limit, skip, sort } = parsePaginationParams(req.query);

      const query = { isDeleted: false };
      // Optional: Filter by role if provided
      if (req.query.role) query.role = req.query.role;
      // Optional: Search by username/name
      if (req.query.search) {
        query.$text = { $search: req.query.search };
      }

      const result = await paginateQuery(UserMongo, query, {
        page,
        limit,
        sort,
        select: '-password'
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Users retrieved successfully'
      });
    } else {
      // Mock DB implementation (simple list)
      const users = await UserMock.findAll(); // Assuming this exists or returns mocked list
      const publicUsers = users.map(u => {
        const { password, ...rest } = u;
        return rest;
      });

      res.json({
        success: true,
        data: publicUsers,
        message: 'Users retrieved successfully (Mock)'
      });
    }
  } catch (error) {
    logger.error('Get users error:', error);
    next(error);
  }
});

/**
 * @route   DELETE /api/users/:userId
 * @desc    Delete a user (Admin only)
 * @access  Private (Admin)
 */
router.delete('/:userId', verifyToken, checkPermission(PERMISSIONS.DELETE_USER), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    if (useMongoDB) {
      const user = await UserMongo.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      // Prevent deleting yourself or other admins (optional safeguard)
      if (user._id.toString() === req.userId) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Cannot delete your own admin account through this endpoint'
        });
      }

      await user.softDelete('Deleted by Admin');

      // Invalidate cache
      await invalidateCache([`user-profile:${userId}`, `user-profile-public:${user.username}`])(req, res, () => { });

      res.json({
        success: true,
        data: null,
        message: 'User deleted successfully'
      });
    } else {
      // Mock DB
      const result = await UserMock.delete(userId);
      if (!result) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: null,
        message: 'User deleted successfully'
      });
    }
  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads/')) {
  fs.mkdirSync('uploads/');
}

module.exports = router;
