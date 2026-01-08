const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * LOGIN USER
 */
exports.login = async (req, res, next) => {
  try {
    // ✅ SYSTEM ERROR TEST (YAHAN HOGA)
    throw new Error("GLOBAL ERROR HANDLER WORKING");

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful'
    });

  } catch (error) {
    next(error); // 🔥 GLOBAL ERROR HANDLER
  }
};
