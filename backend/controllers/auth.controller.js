const User = require("../models/User");
const crypto = require('crypto');
const RefreshToken = require("../models/RefreshToken");
const MFAService = require("../services/mfaService");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/token.util");

/**
 * REGISTER
 */
exports.register = async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * LOGIN - Updated for MFA support
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        success: false,
        message: "Account locked due to too many failed attempts",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    await user.resetLoginAttempts();

    // Check if MFA is enabled
    if (user.twoFactorEnabled) {
      return res.json({
        success: true,
        requiresMFA: true,
        userId: user._id,
        message: "MFA verification required",
      });
    }

    // Normal login flow (no MFA)
    const accessToken = generateAccessToken({
      userId: user._id,
      role: user.role,
      mfaVerified: false,
    });

    const refreshToken = await generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        mfaEnabled: false,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * VERIFY MFA - Complete login with MFA token
 */
exports.verifyMFA = async (req, res) => {
  const { userId, token } = req.body;

  try {
    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        message: "User ID and token are required",
      });
    }

    const user = await User.findById(userId).select('+twoFactorSecret +backupCodes');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "MFA is not enabled for this user",
      });
    }

    // Authenticate with MFA service
    const isAuthenticated = await MFAService.authenticate(user, token);

    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "Invalid MFA code",
      });
    }

    // Generate tokens with MFA verified flag
    const accessToken = generateAccessToken({
      userId: user._id,
      role: user.role,
      mfaVerified: true,
    });

    const refreshToken = await generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        mfaEnabled: true,
      },
      message: "MFA verification successful",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * SETUP MFA - Generate QR code
 */
exports.setupMFA = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate secret and QR code
    const { secret, qrCodeUrl } = await MFAService.generateSecret(userId, user.email);

    res.json({
      success: true,
      secret,
      qrCodeUrl,
      message: "Scan QR code with your authenticator app",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * ENABLE MFA - Verify and save
 */
exports.enableMFA = async (req, res) => {
  try {
    const { secret, token } = req.body;
    const userId = req.user?.id || req.userId;

    if (!secret || !token) {
      return res.status(400).json({
        success: false,
        message: "Secret and verification token are required",
      });
    }

    const { backupCodes } = await MFAService.enableMFA(userId, secret, token);

    res.json({
      success: true,
      backupCodes,
      message: "MFA enabled successfully. Save your backup codes in a safe place!",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * DISABLE MFA
 */
exports.disableMFA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user?.id || req.userId;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    await MFAService.disableMFA(userId, token);

    res.json({
      success: true,
      message: "MFA disabled successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET MFA STATUS
 */
exports.getMFAStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    const status = await MFAService.getMFAStatus(userId);

    res.json({
      success: true,
      data: status,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * REGENERATE BACKUP CODES
 */
exports.regenerateBackupCodes = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user?.id || req.userId;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const backupCodes = await MFAService.regenerateBackupCodes(userId, token);

    res.json({
      success: true,
      backupCodes,
      message: "Backup codes regenerated successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
      userId: user._id,
      role: user.role,
    });

    const refreshToken = await generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * REFRESH TOKEN
 */
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing",
    });
  }

  try {
    const decoded = await verifyRefreshToken(token);

    // ROTATE refresh token
    await RefreshToken.updateOne(
      { token },
      { revoked: true }
    );

    const newRefreshToken = await generateRefreshToken(decoded.userId);
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * LOGOUT
 */
exports.logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await RefreshToken.updateOne(
      { token },
      { revoked: true }
    );
  }

  res.clearCookie("refreshToken");

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * FORGOT PASSWORD
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send email with reset token (implement email service)
    // For now, just return the token
    res.json({
      success: true,
      message: "Password reset token generated",
      resetToken, // Remove in production
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * RESET PASSWORD
 */
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
