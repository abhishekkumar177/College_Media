const express = require('express');
const UserMongo = require('../models/User');
const UserMock = require('../mockdb/userDB');
const { validateProfileUpdate, checkValidation } = require('../middleware/validationMiddleware');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get current user profile
router.get('/profile', verifyToken, async (req, res, next) => {
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
    console.error('Get profile error:', error);
    next(error);
  }
});

// Update user profile
router.put('/profile', verifyToken, validateProfileUpdate, checkValidation, async (req, res, next) => {
  try {
    const { firstName, lastName, bio } = req.body;
    
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
    console.error('Update profile error:', error);
    next(error);
  }
});

// Upload profile picture
router.post('/profile-picture', verifyToken, upload.single('profilePicture'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'No file uploaded'
      });
    }
    
    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');
    
    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB
      const updatedUser = await UserMongo.findByIdAndUpdate(
        req.userId,
        { profilePicture: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` },
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
        data: {
          profilePicture: updatedUser.profilePicture
        },
        message: 'Profile picture uploaded successfully'
      });
    } else {
      // Use mock database
      const updatedUser = await UserMock.updateProfilePicture(
        req.userId,
        `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
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
        data: {
          profilePicture: updatedUser.profilePicture
        },
        message: 'Profile picture uploaded successfully'
      });
    }
  } catch (error) {
    console.error('Upload profile picture error:', error);
    next(error);
  }
});

// Get user by username (for viewing other profiles)
router.get('/profile/:username', verifyToken, async (req, res, next) => {
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
        message: 'Profile retrieved successfully'
      });
    } else {
      // Use mock database
      const user = await UserMock.findByUsername(username);
      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      // Remove sensitive fields
      const { password, email, ...publicProfile } = user;

      res.json({
        success: true,
        data: publicProfile,
        message: 'Profile retrieved successfully'
      });
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    next(error);
  }
});

// Get user's posts
router.get('/profile/:username/posts', verifyToken, async (req, res, next) => {
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
    console.error('Get user posts error:', error);
    next(error);
  }
});

// Update profile settings (email, privacy, etc.)
router.put('/profile/settings', verifyToken, async (req, res, next) => {
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

      res.json({
        success: true,
        data: updatedUser,
        message: 'Settings updated successfully'
      });
    } else {
      // Use mock database
      const updatedUser = await UserMock.update(req.userId, updateData);

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
        message: 'Settings updated successfully'
      });
    }
  } catch (error) {
    console.error('Update settings error:', error);
    next(error);
  }
});

// Get profile stats (followers, following, posts count)
router.get('/profile/stats', verifyToken, async (req, res, next) => {
  try {
    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');
    
    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB
      const user = await UserMongo.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      // TODO: Implement actual counts from relationships and posts
      const stats = {
        posts: 0,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0
      };

      res.json({
        success: true,
        data: stats,
        message: 'Stats retrieved successfully'
      });
    } else {
      // Use mock database
      const mockStats = {
        posts: 6,
        followers: 1247,
        following: 543
      };

      res.json({
        success: true,
        data: mockStats,
        message: 'Stats retrieved successfully'
      });
    }
  } catch (error) {
    console.error('Get stats error:', error);
    next(error);
  }
});

// Follow/Unfollow user
router.post('/profile/:username/follow', verifyToken, async (req, res, next) => {
  try {
    const { username } = req.params;
    
    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');
    
    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB
      const targetUser = await UserMongo.findOne({ username });
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      // Check if already following
      const currentUser = await UserMongo.findById(req.userId);
      const isFollowing = currentUser.following?.includes(targetUser._id);

      if (isFollowing) {
        // Unfollow
        await UserMongo.findByIdAndUpdate(req.userId, {
          $pull: { following: targetUser._id }
        });
        await UserMongo.findByIdAndUpdate(targetUser._id, {
          $pull: { followers: req.userId }
        });

        res.json({
          success: true,
          data: { isFollowing: false },
          message: 'Unfollowed successfully'
        });
      } else {
        // Follow
        await UserMongo.findByIdAndUpdate(req.userId, {
          $addToSet: { following: targetUser._id }
        });
        await UserMongo.findByIdAndUpdate(targetUser._id, {
          $addToSet: { followers: req.userId }
        });

        res.json({
          success: true,
          data: { isFollowing: true },
          message: 'Followed successfully'
        });
      }
    } else {
      // Use mock database
      res.json({
        success: true,
        data: { isFollowing: true },
        message: 'Follow action completed'
      });
    }
  } catch (error) {
    console.error('Follow/Unfollow error:', error);
    next(error);
  }
});

// Delete profile picture
router.delete('/profile-picture', verifyToken, async (req, res, next) => {
  try {
    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');
    
    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB
      const updatedUser = await UserMongo.findByIdAndUpdate(
        req.userId,
        { $unset: { profilePicture: "" } },
        { new: true }
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
        data: null,
        message: 'Profile picture removed successfully'
      });
    } else {
      // Use mock database
      const updatedUser = await UserMock.updateProfilePicture(req.userId, null);

      res.json({
        success: true,
        data: null,
        message: 'Profile picture removed successfully'
      });
    }
  } catch (error) {
    console.error('Delete profile picture error:', error);
    next(error);
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads/')) {
  fs.mkdirSync('uploads/');
}

module.exports = router;