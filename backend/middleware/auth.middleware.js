/**
 * ============================================================
 * Auth Middleware – Production Hardened
 * ------------------------------------------------------------
 * ✔ JWT Verification
 * ✔ Password Change Invalidation
 * ✔ Old Token Auto-Reject
 * ✔ Clean Error Responses
 * ============================================================
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    /* ========================================================
       🔐 EXTRACT TOKEN
    ======================================================== */
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    /* ========================================================
       🔍 VERIFY JWT
    ======================================================== */
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired token",
      });
    }

    /* ========================================================
       👤 LOAD USER
    ======================================================== */
    const user = await User.findById(decoded.userId);

    if (!user || user.isDeleted || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found or inactive",
      });
    }

    /* ========================================================
       🔥 PASSWORD CHANGE INVALIDATION (CORE FIX)
    ======================================================== */
    if (
      user.passwordChangedAt &&
      decoded.iat * 1000 < user.passwordChangedAt.getTime()
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Session expired. Password was changed. Please login again.",
      });
    }

    /* ========================================================
       ✅ ATTACH USER TO REQUEST
    ======================================================== */
    req.user = {
      id: user._id,
      role: user.role,
    };

    next(); // ✅ VERY IMPORTANT
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
