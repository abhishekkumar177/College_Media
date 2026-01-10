const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserMongo = require('../models/User');
const UserMock = require('../mockdb/userDB');
const { validateRegister, validateLogin, checkValidation } = require('../middleware/validationMiddleware');
const { sendPasswordResetOTP } = require('../services/emailService');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

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

// Register a new user
router.post('/register', validateRegister, checkValidation, async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');
    
    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB
      const existingUser = await UserMongo.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          data: null,
          message: 'User with this email or username already exists' 
        });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new UserMongo({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName
      });

      await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser._id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        data: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          token
        },
        message: 'User registered successfully'
      });
    } else {
      // Use mock database
      try {
        const newUser = await UserMock.create({
          username,
          email,
          password, // password will be hashed in the create function
          firstName,
          lastName
        });

        // Generate JWT token
        const token = jwt.sign(
          { userId: newUser._id },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(201).json({
          success: true,
          data: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            token
          },
          message: 'User registered successfully'
        });
      } catch (error) {
        if (error.message.includes('already exists')) {
          return res.status(400).json({ 
            success: false,
            data: null,
            message: error.message 
          });
        }
        throw error; // Re-throw other errors
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    next(error); // Pass to error handler
  }
});

// Login user
router.post('/login', validateLogin, checkValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');
    
    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB
      const user = await UserMongo.findOne({ email });
      if (!user) {
        return res.status(400).json({ 
          success: false,
          data: null,
          message: 'Invalid credentials' 
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false,
          data: null,
          message: 'Invalid credentials' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          bio: user.bio,
          token
        },
        message: 'Login successful'
      });
    } else {
      // Use mock database
      const user = await UserMock.findByEmail(email);
      if (!user) {
        return res.status(400).json({ 
          success: false,
          data: null,
          message: 'Invalid credentials' 
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false,
          data: null,
          message: 'Invalid credentials' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          bio: user.bio,
          token
        },
        message: 'Login successful'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    next(error); // Pass to error handler
  }
});

// Forgot password - Send OTP
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'Email is required' 
      });
    }

    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');
    
    let user;
    if (dbConnection && dbConnection.useMongoDB) {
      user = await UserMongo.findOne({ email });
    } else {
      user = await UserMock.findByEmail(email);
    }

    // Always return success to prevent user enumeration
    if (user) {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with expiration (10 minutes)
      otpStore.set(email, {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        userId: user._id || user.id
      });
      
      // Try to send email if API key is configured
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
        try {
          await sendPasswordResetOTP(email, otp);
          console.log('✅ Password reset OTP sent to:', email);
        } catch (emailError) {
          console.error('⚠️  Failed to send email, logging OTP instead:', emailError.message);
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📧 PASSWORD RESET OTP (Development Mode)');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('Email:', email);
          console.log('OTP Code:', otp);
          console.log('Expires in: 10 minutes');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }
      } else {
        // Development mode: Just log the OTP
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 PASSWORD RESET OTP (Development Mode)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:', email);
        console.log('OTP Code:', otp);
        console.log('Expires in: 10 minutes');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
    }

    res.json({
      success: true,
      data: null,
      message: 'If an account exists with this email, an OTP has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    next(error);
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'Email and OTP are required' 
      });
    }

    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'OTP not found or expired. Please request a new one.' 
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'Invalid OTP. Please try again.' 
      });
    }

    // OTP is valid - generate a temporary token for password reset
    const resetToken = jwt.sign(
      { userId: storedData.userId, email },
      JWT_SECRET,
      { expiresIn: '15m' } // 15 minutes to complete password reset
    );

    // Don't delete OTP yet - will delete after password reset
    
    res.json({
      success: true,
      data: { resetToken },
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    next(error);
  }
});

// Reset password with verified token
router.post('/reset-password', async (req, res, next) => {
  try {
    const { resetToken, newPassword, email } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'Reset token and new password are required' 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');
    
    if (dbConnection && dbConnection.useMongoDB) {
      await UserMongo.findByIdAndUpdate(decoded.userId, { 
        password: hashedPassword 
      });
    } else {
      await UserMock.updatePassword(decoded.userId, hashedPassword);
    }

    // Clear OTP from store
    if (email) {
      otpStore.delete(email);
    }

    res.json({
      success: true,
      data: null,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    next(error);
  }
});

// Logout endpoint
router.post('/logout', async (req, res, next) => {
  try {
    // In a production environment with refresh tokens, you would:
    // 1. Invalidate the refresh token in the database
    // 2. Add the access token to a blacklist (Redis recommended)
    // 3. Clear any server-side session data
    
    // For now, we'll send a success response
    // The client will clear the token from localStorage
    res.json({
      success: true,
      data: null,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
});

// Change password endpoint (requires authentication)
router.post('/change-password', verifyToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'Current password and new password are required' 
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Get database connection from app
    const dbConnection = req.app.get('dbConnection');
    
    let user;
    if (dbConnection && dbConnection.useMongoDB) {
      // Use MongoDB
      user = await UserMongo.findById(req.userId);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          data: null,
          message: 'User not found' 
        });
      }
    } else {
      // Use Mock DB
      user = await UserMock.findById(req.userId);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          data: null,
          message: 'User not found' 
        });
      }
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'Current password is incorrect' 
      });
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'New password must be different from current password' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in database
    if (dbConnection && dbConnection.useMongoDB) {
      await UserMongo.findByIdAndUpdate(req.userId, { 
        password: hashedPassword 
      });
    } else {
      await UserMock.updatePassword(req.userId, hashedPassword);
    }

    res.json({
      success: true,
      data: null,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    next(error);
  }
});

module.exports = router;
