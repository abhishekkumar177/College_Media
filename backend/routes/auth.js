const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const UserMongo = require('../models/User');
const UserMock = require('../mockdb/userDB');
const { validateRegister, validateLogin, checkValidation } = require('../middleware/validationMiddleware');
const { sendPasswordResetOTP } = require('../services/emailService');
const logger = require('../utils/logger');
const { authLimiter, registerLimiter, forgotPasswordLimiter, apiLimiter } = require('../middleware/rateLimitMiddleware');
const { isValidEmail, isValidUsername, isValidPassword, isValidName, isValidOTP } = require('../utils/validators');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "college_media_secret_key";

// ⚠️ In-memory OTP store
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
router.post('/register', registerLimiter, validateRegister, checkValidation, async (req, res, next) => {
  try {
    console.log('\ud83d\udce5 Registration request received:', { 
      ...req.body, 
      password: req.body.password ? '***' : undefined 
    });
    
    const { username, email, password, firstName, lastName } = req.body;

    // Additional validation using custom validators
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid email format'
      });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Username must be 3-30 characters, alphanumeric with underscores/hyphens only'
      });
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        data: null,
        message: passwordValidation.message
      });
    }

    if (firstName && !isValidName(firstName)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid first name format'
      });
    }

    if (lastName && !isValidName(lastName)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid last name format'
      });
    }

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

    const existingUser = dbConnection?.useMongoDB
      ? await UserMongo.findOne({ $or: [{ email }, { username }] })
      : await UserMock.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = dbConnection?.useMongoDB
      ? await UserMongo.create({ username, email, password: hashedPassword, firstName, lastName })
      : await UserMock.create({ username, email, password: hashedPassword, firstName, lastName });

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
    logger.error('Registration error:', error);
    next(error); // Pass to error handler
  }
});

// Login user
router.post('/login', authLimiter, validateLogin, checkValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid email format'
      });
    }

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

      // 🔐 CREATE NEW SESSION
      const sessionId = crypto.randomUUID();

      await Session.create({
        userId: user._id,
        sessionId,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        isActive: true,
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
        {
          userId: user._id,
          sessionId,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        data: { token },
        message: "Login successful",
      });
    } catch (err) {
      next(err);
    }
  } catch (error) {
    logger.error('Login error:', error);
    next(error); // Pass to error handler
  }
);

// Forgot password - Send OTP
router.post('/forgot-password', forgotPasswordLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Email is required'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid email format'
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

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP with expiration (10 minutes)
      otpStore.set(email, {
        otp,
        userId: user._id || user.id,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      // Try to send email if API key is configured
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
        try {
          await sendPasswordResetOTP(email, otp);
          logger.info(`Password reset OTP sent to: ${email}`);
        } catch (emailError) {
          logger.warn(`Failed to send email, logging OTP instead: ${emailError.message}`);
          logger.info('PASSWORD RESET OTP (Development Mode)', { email, otp, expiresIn: '10 minutes' });
        }
      } else {
        // Development mode: Just log the OTP
        logger.info('PASSWORD RESET OTP (Development Mode)', { email, otp, expiresIn: '10 minutes' });
      }
    }

    res.json({
      success: true,
      message: "If an account exists, an OTP has been sent.",
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
});

// Verify OTP
router.post('/verify-otp', authLimiter, async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Email and OTP are required'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid email format'
      });
    }

    // Validate OTP format
    if (!isValidOTP(otp)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'OTP must be a 6-digit code'
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

    const resetToken = jwt.sign(
      { userId: data.userId },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Don't delete OTP yet - will delete after password reset

    res.json({
      success: true,
      data: { resetToken },
      message: "OTP verified successfully",
    });
  } catch (error) {
    logger.error('Verify OTP error:', error);
    next(error);
  }
});

// Reset password with verified token
router.post('/reset-password', authLimiter, async (req, res, next) => {
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const dbConnection = req.app.get("dbConnection");

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
    logger.error('Reset password error:', error);
    next(error);
  }
});

// Logout endpoint
router.post('/logout', apiLimiter, async (req, res, next) => {
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
    logger.error('Logout error:', error);
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
    logger.error('Change password error:', error);
    next(error);
  }
});

// Enable Two-Factor Authentication
router.post('/2fa/enable', verifyToken, async (req, res, next) => {
  try {
    const dbConnection = req.app.get('dbConnection');

    let user;
    if (dbConnection && dbConnection.useMongoDB) {
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

    // Generate secret for 2FA
    const secret = speakeasy.generateSecret({
      name: `College Media (${user.email})`,
      length: 32
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl
      },
      message: '2FA setup initialized. Scan QR code with your authenticator app.'
    });
  } catch (error) {
    logger.error('Enable 2FA error:', error);
    next(error);
  }
});

// Verify and confirm Two-Factor Authentication
router.post('/2fa/verify', verifyToken, async (req, res, next) => {
  try {
    const { secret, token } = req.body;

    if (!secret || !token) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Secret and token are required'
      });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid verification code'
      });
    }

    // Save the secret and enable 2FA
    const dbConnection = req.app.get('dbConnection');

    if (dbConnection && dbConnection.useMongoDB) {
      await UserMongo.findByIdAndUpdate(req.userId, {
        twoFactorEnabled: true,
        twoFactorSecret: secret
      });
    } else {
      const user = await UserMock.findById(req.userId);
      if (user) {
        user.twoFactorEnabled = true;
        user.twoFactorSecret = secret;
        await UserMock.update(user);
      }
    }

    res.json({
      success: true,
      data: null,
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    logger.error('Verify 2FA error:', error);
    next(error);
  }
});

// Disable Two-Factor Authentication
router.post('/2fa/disable', verifyToken, async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Password is required to disable 2FA'
      });
    }

    const dbConnection = req.app.get('dbConnection');

    let user;
    if (dbConnection && dbConnection.useMongoDB) {
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

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Incorrect password'
      });
    }

    // Disable 2FA
    if (dbConnection && dbConnection.useMongoDB) {
      await UserMongo.findByIdAndUpdate(req.userId, {
        twoFactorEnabled: false,
        twoFactorSecret: null
      });
    } else {
      user.twoFactorEnabled = false;
      user.twoFactorSecret = null;
      await UserMock.update(user);
    }

    res.json({
      success: true,
      data: null,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    logger.error('Disable 2FA error:', error);
    next(error);
  }
});

// Get 2FA status
router.get('/2fa/status', verifyToken, async (req, res, next) => {
  try {
    const dbConnection = req.app.get('dbConnection');

    let user;
    if (dbConnection && dbConnection.useMongoDB) {
      user = await UserMongo.findById(req.userId).select('twoFactorEnabled');
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

    res.json({
      success: true,
      message: "Password reset successful. All sessions revoked.",
    });
  } catch (error) {
    logger.error('Get 2FA status error:', error);
    next(error);
  }
});

module.exports = router;
