const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Protect routes - Verify JWT token and attach user to request
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      res.status(401);
      const message = error.name === 'TokenExpiredError' 
        ? 'Not authorized, token expired' 
        : 'Not authorized, token failed';
      
      res.json({ message: message, stack: process.env.NODE_ENV === 'production' ? null : error.stack });
    }
  }

  if (!token) {
    res.status(401);
    res.json({ message: 'Not authorized, no token' });
  }
};

// @desc    Admin middleware - Check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    res.json({ message: 'Not authorized as an admin' });
  }
};

// @desc    Alumni middleware - Check if user is alumni
const alumni = (req, res, next) => {
  if (req.user && (req.user.role === 'alumni' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    res.json({ message: 'Not authorized as an alumni' });
  }
};

module.exports = { protect, admin, alumni };