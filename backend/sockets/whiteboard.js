const WhiteboardSession = require('../models/WhiteboardSession');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

/**
 * Initialize Whiteboard Socket Handlers
 * @param {SocketIO.Server} io - Socket.io server instance
 */
function initWhiteboardSockets(io) {
    const whiteboardNamespace = io.of('/whiteboard');

    // Authentication middleware
    whiteboardNamespace.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication required'));

        try {
            const decoded = jwt.verifyUnsafe ? jwt.verifyUnsafe(token) : jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.userId || decoded.id;
            socket.username = decoded.username || 'Anonymous';
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    whiteboardNamespace.on('connection', (socket) => {
        logger.info(`Whiteboard: User ${socket.userId} connected`);

        // Join a whiteboard room
        socket.on('join-session', async (roomId) => {
            try {
                let session = await WhiteboardSession.findOne({ roomId });

                if (!session) {
                    session = await WhiteboardSession.create({
                        roomId,
                        createdBy: socket.userId,
                        participants: [{ user: socket.userId }]
                    });
                } else {
                    // Add participant if not already in
                    const isIn = session.participants.some(p => p.user.toString() === socket.userId);
                    if (!isIn) {
                        session.participants.push({ user: socket.userId });
                        await session.save();
                    }
                }

                socket.join(roomId);
                socket.roomId = roomId;

                // Send current board state
                socket.emit('session-init', {
                    canvasData: session.canvasData,
                    participants: session.participants,
                    topic: session.topic
                });

                // Notify others
                socket.to(roomId).emit('user-joined', {
                    userId: socket.userId,
                    username: socket.username
                });

            } catch (error) {
                logger.error('Whiteboard join-session error:', error);
                socket.emit('error', { message: 'Failed to join session' });
            }
        });

        // Handle path/line/shape creation
        socket.on('draw-action', async (data) => {
            try {
                const { roomId, element } = data;

                // Broadcast for real-time (no DB wait)
                socket.to(roomId).emit('draw-action', {
                    element,
                    userId: socket.userId
                });

                // Persist
                await WhiteboardSession.updateOne(
                    { roomId },
                    { $push: { canvasData: element } }
                );
            } catch (error) {
                logger.error('Draw action error:', error);
            }
        });

        // Handle element updates (move/resize)
        socket.on('update-element', async (data) => {
            try {
                const { roomId, elementId, updates } = data;

                socket.to(roomId).emit('update-element', {
                    elementId,
                    updates,
                    userId: socket.userId
                });

                // Update in DB
                const setObj = {};
                for (const key in updates) {
                    setObj[`canvasData.$.${key}`] = updates[key];
                }

                await WhiteboardSession.updateOne(
                    { roomId, 'canvasData.id': elementId },
                    { $set: setObj }
                );
            } catch (error) {
                logger.error('Update element error:', error);
            }
        });

        // Clear Board
        socket.on('clear-board', async (roomId) => {
            try {
                await WhiteboardSession.updateOne(
                    { roomId },
                    { $set: { canvasData: [] } }
                );
                whiteboardNamespace.to(roomId).emit('board-cleared');
            } catch (error) {
                logger.error('Clear board error:', error);
            }
        });

        // Cursor synchronization
        socket.on('cursor-move', (data) => {
            const { roomId, x, y } = data;
            socket.to(roomId).emit('cursor-move', {
                userId: socket.userId,
                username: socket.username,
                x, y
            });
        });

        socket.on('disconnect', () => {
            if (socket.roomId) {
                socket.to(socket.roomId).emit('user-left', {
                    userId: socket.userId,
                    username: socket.username
                });
            }
        });
    });

    return whiteboardNamespace;
}

module.exports = initWhiteboardSockets;
