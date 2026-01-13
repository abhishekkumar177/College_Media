const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const UserMongo = require('../models/User');
const UserMock = require('../mockdb/userDB');
const { initDB } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

/**
 * Middleware to authenticate Socket.io connections
 * Expects token in auth.token or query.token
 */
const authorizeSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
            logger.warn('Socket connection attempt without token');
            return next(new Error('Authentication error: No token provided'));
        }

        // Verify token
        // If token starts with "Bearer ", strip it.
        const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;

        const decoded = jwt.verify(tokenString, JWT_SECRET);

        // Attach user info to socket
        socket.userId = decoded.userId;

        // Optional: Verify user exists in DB and fetch username/details if needed
        // This adds a DB call per connection, which might be heavy, but safer.
        // We can skip this if we trust the JWT signature for basic auth.
        // Let's verify existence to ensure user isn't banned/deleted.

        // We need to know if we are using Real or Mock DB.
        // The socket server usually has access to the main app setup, but here we are in a module.
        // We can rely on the fact that DB is likely initialized by server.js before this middleware runs.

        // Check if user exists (lightweight check)
        // We'll rely on global dbConnection or just try-catch safe access if possible.
        // Since we don't have easy access to `app.get('dbConnection')` from here without passing it,
        // we'll rely on the JWT for now. If stricter checks are needed, we can implement them.

        socket.user = { userId: decoded.userId };

        next();
    } catch (error) {
        logger.error('Socket authentication error:', error.message);
        next(new Error('Authentication error: Invalid token'));
    }
};

module.exports = authorizeSocket;
