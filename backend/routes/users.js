const express = require("express");
const UserMongo = require("../models/User");
const UserMock = require("../mockdb/userDB");
const {
  validateProfileUpdate,
  checkValidation,
} = require("../middleware/validationMiddleware");
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const logger = require('../utils/logger');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');
const { isValidName, isValidBio, isValidEmail } = require('../utils/validators');

const JWT_SECRET =
  process.env.JWT_SECRET || "college_media_secret_key";

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

/* ------------------
   📦 MULTER SETUP
------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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
    logger.error('Get profile error:', error);
    next(error);
  }
});

// Update user profile
router.put('/profile', verifyToken, validateProfileUpdate, checkValidation, async (req, res, next) => {
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

if (!fs.existsSync("uploads/")) fs.mkdirSync("uploads/");

/* =====================================================
   👤 GET CURRENT USER PROFILE

    if (db?.useMongoDB) {
      const user = await UserMongo.findById(req.userId).select(
        "-password"
      );
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      return res.json({
        success: true,
        data: user,
      });
    }

    const user = await UserMock.findById(req.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

/* =====================================================
   ✏️ UPDATE PROFILE (CONCURRENT SAFE)
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

/* =====================================================
   ⚙️ UPDATE SETTINGS (CONCURRENT SAFE)
router.put("/profile/settings", verifyToken, async (req, res, next) => {
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

/* =====================================================
   🤝 FOLLOW / UNFOLLOW (CONCURRENT SAFE)
===================================================== */
router.post(
  "/profile/:username/follow",
  verifyToken,
  async (req, res, next) => {
    try {
      const { username } = req.params;
      const db = req.app.get("dbConnection");

      if (db?.useMongoDB) {
        const targetUser = await UserMongo.findOne({ username });
        if (!targetUser)
          return res
            .status(404)
            .json({ success: false, message: "User not found" });

        const currentUser = await UserMongo.findById(req.userId);
        const isFollowing = currentUser.following.includes(
          targetUser._id
        );

        if (isFollowing) {
          currentUser.following.pull(targetUser._id);
          targetUser.followers.pull(req.userId);
        } else {
          currentUser.following.addToSet(targetUser._id);
          targetUser.followers.addToSet(req.userId);
        }

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
);

module.exports = router;
