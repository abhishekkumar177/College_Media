const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

/**
 * Initialize WebRTC Signaling Socket Handlers
 * @param {SocketIO.Server} io - Socket.io server instance
 */
function initSignalingSockets(io) {
    const signalingNamespace = io.of('/webrtc');

    // Authentication middleware
    signalingNamespace.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication required'));

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.userId;
            socket.username = decoded.username || 'Anonymous';
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    signalingNamespace.on('connection', (socket) => {
        logger.info(`WebRTC: User ${socket.userId} connected`);

        // Join a personal room for 1-on-1 calls (using userId)
        socket.join(socket.userId);

        /**
         * START CALL (1-on-1)
         * Caller initiates call to Callee
         */
        socket.on('call-user', (data) => {
            const { userToCall, signalData, from, name } = data;

            logger.info(`WebRTC: Call initiated from ${from} to ${userToCall}`);

            // Emit to specific user's room
            signalingNamespace.to(userToCall).emit('call-made', {
                signal: signalData,
                from,
                name
            });
        });

        /**
         * ANSWER CALL
         * Callee accepts and sends signal back
         */
        socket.on('answer-call', (data) => {
            const { signal, to } = data;

            logger.info(`WebRTC: Call answered by ${socket.userId} to ${to}`);

            signalingNamespace.to(to).emit('call-answered', {
                signal,
                from: socket.userId
            });
        });

        /**
         * ICE CANDIDATE
         * Exchange network candidates for NAT traversal
         */
        socket.on('ice-candidate', (data) => {
            const { candidate, to } = data;
            signalingNamespace.to(to).emit('ice-candidate', {
                candidate,
                from: socket.userId
            });
        });

        /**
         * END CALL
         */
        socket.on('end-call', (data) => {
            const { to } = data;
            signalingNamespace.to(to).emit('call-ended', {
                from: socket.userId
            });
        });

        /**
         * GROUP CALLS (Room based)
         */
        socket.on('join-room', (roomId) => {
            // Check room capacity (e.g., max 4)
            const room = signalingNamespace.adapter.rooms.get(roomId);
            if (room && room.size >= 4) {
                socket.emit('room-full');
                return;
            }

            socket.join(roomId);
            const users = Array.from(room || []).filter(id => id !== socket.id);

            // Return list of other users to connect to (Mesh topology)
            socket.emit('all-users', users);
        });

        socket.on('sending-signal', (payload) => {
            signalingNamespace.to(payload.userToSignal).emit('user-joined', {
                signal: payload.signal,
                callerID: socket.id
            });
        });

        socket.on('returning-signal', (payload) => {
            signalingNamespace.to(payload.callerID).emit('receiving-returned-signal', {
                signal: payload.signal,
                id: socket.id
            });
        });

        socket.on('disconnect', () => {
            logger.info(`WebRTC: User ${socket.userId} disconnected`);
            // Notify others if in active call...
        });
    });

    return signalingNamespace;
}

module.exports = initSignalingSockets;
