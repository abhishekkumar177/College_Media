"use strict";

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const crypto = require("crypto");

const UserMongo = require("../models/User");
const UserMock = require("../mockdb/userDB");
const Session = require("../models/Session");
const EventPublisher = require("../events/publisher");
const MFAService = require("../services/mfaService");

const {
  validateRegister,
  validateLogin,
  checkValidation,
} = require("../middleware/validationMiddleware");

const {
  authLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  apiLimiter,
} = require("../middleware/rateLimitMiddleware");

const {
  isValidEmail,
  isValidUsername,
  isValidPassword,
  isValidName,
  isValidOTP,
} = require("../utils/validators");

const logger = require("../utils/logger");
const passport = require("../config/passport");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "college_media_secret_key";

/* ============================================================
   🔐 SESSION HELPERS
============================================================ */
async function revokeOldSessions(userId, reason = "concurrency_limit") {
  await Session.updateMany(
    { userId, isActive: true },
    {
      $set: {
        isActive: false,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    }
  );
}

async function createSession(userId, req) {
  const sessionId = crypto.randomUUID();

  await Session.create({
    userId,
    sessionId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    isActive: true,
    lastActiveAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    correlationId: req.correlationId,
  });

  return sessionId;
}

/* ============================================================
   🔑 JWT VERIFY (SINGLE SOURCE)
============================================================ */
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.sessionId = decoded.sessionId;

    const session = await Session.findOne({
      sessionId: decoded.sessionId,
      isActive: true,
    });

    if (!session) {
      return res
        .status(401)
        .json({ success: false, message: "Session expired" });
    }

    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid token" });
  }
};

/* ============================================================
   📝 REGISTER
============================================================ */
router.post(
  "/register",
  registerLimiter,
  validateRegister,
  checkValidation,
  async (req, res, next) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      if (!isValidEmail(email)) throw new Error("Invalid email");
      if (!isValidUsername(username)) throw new Error("Invalid username");

      const pwdCheck = isValidPassword(password);
      if (!pwdCheck.valid) throw new Error(pwdCheck.message);

      const existing = await UserMongo.findOne({
        $or: [{ email }, { username }],
      });

      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      const hashed = await bcrypt.hash(password, 12);
      const user = await UserMongo.create({
        username,
        email,
        password: hashed,
        firstName,
        lastName,
      });

      // Publish Event
      EventPublisher.publish('USER_REGISTERED', {
        userId: user._id,
        email: user.email,
        name: `${firstName} ${lastName}`
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { id: user._id },
      });
    } catch (err) {
      next(err);
    }
  }
);

/* ============================================================
   🔓 LOGIN (PASSWORD)
============================================================ */
router.post(
  "/login",
  authLimiter,
  validateLogin,
  checkValidation,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await UserMongo.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }

      if (user.lockUntil && user.lockUntil > Date.now()) {
        return res.status(423).json({
          success: false,
          message: "Account locked due to too many failed attempts",
        });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        await user.incLoginAttempts();
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }

      await user.resetLoginAttempts();

      // 🔐 2FA check
      if (user.twoFactorEnabled) {
        return res.json({
          success: true,
          requiresTwoFactor: true,
          userId: user._id,
        });
      }

      // 🔒 Enforce single session
      await revokeOldSessions(user._id);

      const sessionId = await createSession(user._id, req);

      const token = jwt.sign(
        { userId: user._id, sessionId },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        message: "Login successful",
        data: { token },
      });
    } catch (err) {
      next(err);
    }
  }
);

/* ============================================================
   � FORGOT PASSWORD
============================================================ */
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await UserMongo.findOne({ email });
      if (!user) {
        return res.status(200).json({
          success: true,
          message: "If an account with that email exists, a password reset link has been sent.",
        });
      }

      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send email (implement later)
      res.json({
        success: true,
        message: "Password reset token generated",
        resetToken, // Remove in production
      });
    } catch (err) {
      next(err);
    }
  }
);

/* ============================================================
   🔄 RESET PASSWORD
============================================================ */
router.post(
  "/reset-password",
  async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await UserMongo.findOne({
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
      next(err);
    }
  }
);

/* ============================================================
   �🔐 2FA VERIFY LOGIN
============================================================ */
/* ============================================================
   🔐 2FA SETUP (GENERATE QR)
   ============================================================ */
router.post("/2fa/setup", verifyToken, async (req, res, next) => {
  try {
    const user = await UserMongo.findById(req.userId);
    const { secret, qrCodeUrl } = await MFAService.generateSecret(user._id, user.email);

    // We don't save secret yet, client must verify first
    res.json({
      success: true,
      secret,
      qrCodeUrl
    });
  } catch (err) {
    next(err);
  }
});

/* ============================================================
   ✅ 2FA ENABLE (VERIFY & SAVE)
   ============================================================ */
router.post("/2fa/enable", verifyToken, async (req, res, next) => {
  try {
    const { secret, token } = req.body;
    const { backupCodes } = await MFAService.enableMFA(req.userId, secret, token);

    res.json({
      success: true,
      message: "2FA enabled successfully",
      backupCodes
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ============================================================
   🚫 2FA DISABLE
   ============================================================ */
router.post("/2fa/disable", verifyToken, async (req, res, next) => {
  try {
    const { token } = req.body; // Require OTP to disable
    await MFAService.disableMFA(req.userId, token);

    res.json({ success: true, message: "2FA disabled" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ============================================================
   📊 2FA STATUS
   ============================================================ */
router.get("/2fa/status", verifyToken, async (req, res, next) => {
  try {
    const status = await MFAService.getMFAStatus(req.userId);

    res.json({
      success: true,
      data: status
    });
  } catch (err) {
    next(err);
  }
});

/* ============================================================
   🔄 2FA REGENERATE BACKUP CODES
   ============================================================ */
router.post("/2fa/regenerate-codes", verifyToken, async (req, res, next) => {
  try {
    const { token } = req.body;
    const backupCodes = await MFAService.regenerateBackupCodes(req.userId, token);

    res.json({
      success: true,
      backupCodes,
      message: "Backup codes regenerated successfully"
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ============================================================
   🔐 2FA VERIFY LOGIN (OTP OR BACKUP CODE)
   ============================================================ */
router.post("/2fa/verify-login", async (req, res, next) => {
  try {
    const { userId, token } = req.body;

    const user = await UserMongo.findById(userId).select('+twoFactorSecret +backupCodes');
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: "2FA not enabled" });
    }

    const isAuthenticated = await MFAService.authenticate(user, token);

    if (!isAuthenticated) {
      return res.status(401).json({ success: false, message: "Invalid code" });
    }

    await revokeOldSessions(user._id);
    const sessionId = await createSession(user._id, req);

    const jwtToken = jwt.sign(
      { userId: user._id, sessionId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "2FA login successful",
      data: { token: jwtToken },
    });
  } catch (err) {
    next(err);
  }
});

/* ============================================================
   🚪 LOGOUT
============================================================ */
router.post("/logout", verifyToken, apiLimiter, async (req, res) => {
  await Session.updateOne(
    { sessionId: req.sessionId },
    {
      $set: {
        isActive: false,
        revokedAt: new Date(),
        revokedReason: "logout",
      },
    }
  );

  res.json({ success: true, message: "Logged out successfully" });
});

/* ============================================================
   📤 EXPORT
============================================================ */
module.exports = router;
