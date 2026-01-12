const socketIO = require('socket.io');
const authorizeSocket = require('../middleware/authSocket');
const logger = require('../utils/logger');

let io;
const onlineUsers = new Map(); // userId -> Set<socketId>

const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "*", // Allow all origins for now, essentially the client URL
            methods: ["GET", "POST"]
        }
    });

    // Apply Auth Middleware
    io.use(authorizeSocket);

    io.on('connection', (socket) => {
        const userId = socket.userId;
        logger.info(`User connected: ${userId} (Socket ID: ${socket.id})`);

        // Add user to online map
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

        // Join a room named by userId for private notifications/messages
        socket.join(userId);

        // Broadcast user online status
        socket.broadcast.emit('user_status_change', { userId, status: 'online' });

        // Handle disconnected
        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${userId}`);
            if (onlineUsers.has(userId)) {
                const userSockets = onlineUsers.get(userId);
                userSockets.delete(socket.id);

                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                    // Broadcast user offline status
                    socket.broadcast.emit('user_status_change', { userId, status: 'offline' });
                }
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
};

module.exports = {
    initSocket,
    getIO,
    isUserOnline
};
