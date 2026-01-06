const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // 1️⃣ Authorization header check
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // 2️⃣ Token extract
    const token = authHeader.split(' ')[1];

    // 3️⃣ Token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ User info + ROLE attach to request (IMPORTANT FOR RBAC)
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = authMiddleware;
