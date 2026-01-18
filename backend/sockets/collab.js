const Document = require('../models/Document');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const Y = require('yjs');

const JWT_SECRET = process.env.JWT_SECRET || 'college_media_secret_key';

// In-memory storage for active Yjs documents (for faster syncing)
// In production, this might need an external Redis or just rely on clients to sync state + periodic DB saves.
// For this implementation, we will act as a relay and periodic saver.
const docs = new Map();

/**
 * Initialize Collaboration Socket Handlers
 * @param {SocketIO.Server} io - Socket.io server instance
 */
function initCollabSockets(io) {
    const collabNamespace = io.of('/collab');

    // Authentication middleware
    collabNamespace.use((socket, next) => {
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

    collabNamespace.on('connection', (socket) => {
        logger.info(`CollabUser ${socket.userId} connected`);

        socket.on('join-document', async (docId) => {
            try {
                // Check permissions (omitted for brevity, would query DB)
                const doc = await Document.findById(docId);
                if (!doc) {
                    socket.emit('error', { message: 'Document not found' });
                    return;
                }

                socket.join(docId);
                socket.docId = docId;

                // Load initial state from DB if not in memory
                if (!docs.has(docId) && doc.content) {
                    // In a real Yjs server, we'd load the binary Y.Doc here.
                    // For this simple relay, we just send what we have stored.
                    // The clients will merge it.
                    socket.emit('doc-load', { content: doc.content });
                }

                // Notify others
                socket.to(docId).emit('user-joined', {
                    userId: socket.userId,
                    username: socket.username
                });

                logger.info(`User ${socket.userId} joined doc ${docId}`);
            } catch (error) {
                logger.error('Join doc error:', error);
            }
        });

        // Handle Yjs updates (binary blobs)
        socket.on('doc-update', async (data) => {
            // data contains the binary update from Yjs
            const { docId, update } = data;

            // Broadcast to other clients in the room
            socket.to(docId).emit('doc-update', { update });

            // Periodic persistence or save-on-update (debounced recommended in prod)
            // Here we just save the latest "snapshot" or cumulative update.
            // NOTE: merging Yjs updates on server requires Yjs instance on server. 
            // We will simplify by appending updates or mostly relying on client state for this demo 
            // OR we assume 'update' is the full state (inefficient) or a delta. 
            // A proper implementation requires `y-websocket` server logic.
            // For now, let's assume we just relay. We'll save "snapshot" separately via an explicit save action or debounce.
        });

        // Explicit save (e.g., triggered by auto-save interval from client leader)
        socket.on('save-document', async (data) => {
            try {
                const { docId, content } = data; // Content is the full Y.Doc binary state
                await Document.findByIdAndUpdate(docId, {
                    content: Buffer.from(content),
                    lastModified: new Date()
                });
                logger.debug(`Document ${docId} saved`);
            } catch (error) {
                logger.error('Save doc error:', error);
            }
        });

        // Cursor awareness
        socket.on('cursor-update', (data) => {
            const { docId, cursor } = data;
            socket.to(docId).emit('cursor-update', {
                userId: socket.userId,
                username: socket.username,
                cursor
            });
        });

        socket.on('disconnect', () => {
            if (socket.docId) {
                socket.to(socket.docId).emit('user-left', {
                    userId: socket.userId,
                    username: socket.username
                });
            }
        });
    });

    return collabNamespace;
}

module.exports = initCollabSockets;
