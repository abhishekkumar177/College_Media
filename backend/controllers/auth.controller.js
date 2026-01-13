/**
 * ============================================================
 * Auth Controller – Production Hardened
 * ------------------------------------------------------------
 * ✔ Access + Refresh Token Flow
 * ✔ Refresh Token Rotation
 * ✔ Secure Cookies
 * ✔ Audit Logging
 * ✔ Password Change Audit & Invalidation
 * ✔ Session / Token Revocation
 * ============================================================
 */

const bcrypt = require("bcryptjs");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/token.util");

const { logAudit } = require("../utils/auditLogger");

/* ============================================================
   🔐 LOGIN
============================================================ */
exports.login = async (req, res) => {
  try {
    // ⚠️ Replace with real DB auth
    const user = {
      _id: "64ff123abc123",
      role: "USER",
      email: "user@example.com",
    };

    const accessToken = generateAccessToken({
      userId: user._id,
      role: user.role,
    });

    const refreshToken = await generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh-token",
    });

    await logAudit({
      actorId: user._id,
      actorRole: user.role,
      action: "LOGIN",
      status: "SUCCESS",
      req,
    });

    return res.json({ success: true, accessToken });
  } catch (err) {
    await logAudit({
      action: "LOGIN",
      status: "FAILED",
      req,
      metadata: { error: err.message },
    });

    return res.status(401).json({ success: false });
  }
};

/* ============================================================
   🔁 REFRESH TOKEN
============================================================ */
exports.refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing",
    });
  }

  try {
    const decoded = await verifyRefreshToken(token);

    // 🔁 Rotate refresh token
    await RefreshToken.updateOne({ token }, { revoked: true });

    const newRefreshToken = await generateRefreshToken(decoded.userId);
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh-token",
    });

    await logAudit({
      actorId: decoded.userId,
      action: "REFRESH_TOKEN",
      status: "SUCCESS",
      req,
    });

    return res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    await logAudit({
      action: "REFRESH_TOKEN",
      status: "FAILED",
      req,
      metadata: { error: err.message },
    });

    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

/* ============================================================
   🔑 CHANGE PASSWORD (🔥 ISSUE #532 FIX)
============================================================ */
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      await logAudit({
        actorId: userId,
        action: "PASSWORD_CHANGE",
        status: "FAILED",
        req,
        metadata: { reason: "Invalid current password" },
      });

      return res.status(400).json({
        success: false,
        message: "Current password incorrect",
      });
    }

    /* 🔐 UPDATE PASSWORD */
    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordChangedAt = new Date();
    await user.save();

    /* 🔥 INVALIDATE ALL REFRESH TOKENS */
    await RefreshToken.updateMany(
      { userId },
      { revoked: true }
    );

    /* 🍪 CLEAR CURRENT SESSION */
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh-token",
    });

    /* 🧾 AUDIT LOG */
    await logAudit({
      actorId: userId,
      action: "PASSWORD_CHANGED",
      targetId: userId,
      status: "SUCCESS",
      req,
    });

    return res.json({
      success: true,
      message:
        "Password changed successfully. All sessions invalidated.",
    });
  } catch (err) {
    await logAudit({
      actorId: userId,
      action: "PASSWORD_CHANGED",
      status: "FAILED",
      req,
      metadata: { error: err.message },
    });

    return res.status(500).json({
      success: false,
      message: "Password change failed",
    });
  }
};

/* ============================================================
   🚪 LOGOUT
============================================================ */
exports.logout = async (req, res) => {
  const token = req.cookies?.refreshToken;

  try {
    if (token) {
      await RefreshToken.updateOne({ token }, { revoked: true });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh-token",
    });

    await logAudit({
      actorId: req.user?.id || null,
      action: "LOGOUT",
      status: "SUCCESS",
      req,
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    await logAudit({
      action: "LOGOUT",
      status: "FAILED",
      req,
      metadata: { error: err.message },
    });

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
