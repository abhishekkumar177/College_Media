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

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads/')) {
  fs.mkdirSync('uploads/');
}

module.exports = router;