/**
 * WebRTC Signaling Service
 * Issue #923: Real-time Collaborative Features
 * 
 * Handles WebRTC signaling for peer-to-peer connections.
 */

class WebRTCSignalingService {

    constructor() {
        this.peers = new Map(); // sessionId -> Map(userId -> peer info)
        this.socketService = null;
    }

    /**
     * Initialize with socket service
     */
    initialize(socketService) {
        this.socketService = socketService;
        this.setupSignalingHandlers();
    }

    /**
     * Setup signaling event handlers
     */
    setupSignalingHandlers() {
        if (!this.socketService || !this.socketService.io) {
            console.warn('[WebRTC] Socket service not initialized');
            return;
        }

        this.socketService.io.on('connection', (socket) => {
            // Join session
            socket.on('webrtc:join', (data) => {
                this.handleJoin(socket, data);
            });

            // Offer
            socket.on('webrtc:offer', (data) => {
                this.handleOffer(socket, data);
            });

            // Answer
            socket.on('webrtc:answer', (data) => {
                this.handleAnswer(socket, data);
            });

            // ICE candidate
            socket.on('webrtc:ice-candidate', (data) => {
                this.handleICECandidate(socket, data);
            });

            // Leave session
            socket.on('webrtc:leave', (data) => {
                this.handleLeave(socket, data);
            });

            // Screen share
            socket.on('webrtc:screen-share-start', (data) => {
                this.handleScreenShareStart(socket, data);
            });

            socket.on('webrtc:screen-share-stop', (data) => {
                this.handleScreenShareStop(socket, data);
            });

            // Disconnect
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    /**
     * Handle user joining session
     */
    handleJoin(socket, data) {
        const { sessionId, userId, mediaConstraints } = data;

        if (!this.peers.has(sessionId)) {
            this.peers.set(sessionId, new Map());
        }

        const sessionPeers = this.peers.get(sessionId);
        sessionPeers.set(userId, {
            socketId: socket.id,
            userId,
            mediaConstraints,
            joinedAt: new Date()
        });

        // Notify existing peers
        const existingPeers = Array.from(sessionPeers.entries())
            .filter(([id]) => id !== userId)
            .map(([id, peer]) => ({
                userId: id,
                mediaConstraints: peer.mediaConstraints
            }));

        socket.emit('webrtc:peers', { peers: existingPeers });

        // Notify others about new peer
        socket.to(`session:${sessionId}`).emit('webrtc:peer-joined', {
            userId,
            mediaConstraints
        });

        // Join session room
        socket.join(`session:${sessionId}`);

        console.log(`[WebRTC] User ${userId} joined session ${sessionId}`);
    }

    /**
     * Handle WebRTC offer
     */
    handleOffer(socket, data) {
        const { sessionId, targetUserId, offer } = data;

        const sessionPeers = this.peers.get(sessionId);
        if (!sessionPeers) {
            return;
        }

        const targetPeer = sessionPeers.get(targetUserId);
        if (!targetPeer) {
            return;
        }

        // Forward offer to target peer
        this.socketService.io.to(targetPeer.socketId).emit('webrtc:offer', {
            fromUserId: socket.userId,
            offer
        });

        console.log(`[WebRTC] Offer sent from ${socket.userId} to ${targetUserId}`);
    }

    /**
     * Handle WebRTC answer
     */
    handleAnswer(socket, data) {
        const { sessionId, targetUserId, answer } = data;

        const sessionPeers = this.peers.get(sessionId);
        if (!sessionPeers) {
            return;
        }

        const targetPeer = sessionPeers.get(targetUserId);
        if (!targetPeer) {
            return;
        }

        // Forward answer to target peer
        this.socketService.io.to(targetPeer.socketId).emit('webrtc:answer', {
            fromUserId: socket.userId,
            answer
        });

        console.log(`[WebRTC] Answer sent from ${socket.userId} to ${targetUserId}`);
    }

    /**
     * Handle ICE candidate
     */
    handleICECandidate(socket, data) {
        const { sessionId, targetUserId, candidate } = data;

        const sessionPeers = this.peers.get(sessionId);
        if (!sessionPeers) {
            return;
        }

        const targetPeer = sessionPeers.get(targetUserId);
        if (!targetPeer) {
            return;
        }

        // Forward ICE candidate to target peer
        this.socketService.io.to(targetPeer.socketId).emit('webrtc:ice-candidate', {
            fromUserId: socket.userId,
            candidate
        });
    }

    /**
     * Handle user leaving session
     */
    handleLeave(socket, data) {
        const { sessionId, userId } = data;

        const sessionPeers = this.peers.get(sessionId);
        if (!sessionPeers) {
            return;
        }

        sessionPeers.delete(userId);

        // Notify others
        socket.to(`session:${sessionId}`).emit('webrtc:peer-left', { userId });

        // Leave session room
        socket.leave(`session:${sessionId}`);

        // Clean up empty sessions
        if (sessionPeers.size === 0) {
            this.peers.delete(sessionId);
        }

        console.log(`[WebRTC] User ${userId} left session ${sessionId}`);
    }

    /**
     * Handle screen share start
     */
    handleScreenShareStart(socket, data) {
        const { sessionId, userId } = data;

        socket.to(`session:${sessionId}`).emit('webrtc:screen-share-started', {
            userId
        });

        console.log(`[WebRTC] User ${userId} started screen sharing in session ${sessionId}`);
    }

    /**
     * Handle screen share stop
     */
    handleScreenShareStop(socket, data) {
        const { sessionId, userId } = data;

        socket.to(`session:${sessionId}`).emit('webrtc:screen-share-stopped', {
            userId
        });

        console.log(`[WebRTC] User ${userId} stopped screen sharing in session ${sessionId}`);
    }

    /**
     * Handle socket disconnection
     */
    handleDisconnect(socket) {
        // Find and remove user from all sessions
        for (const [sessionId, sessionPeers] of this.peers.entries()) {
            for (const [userId, peer] of sessionPeers.entries()) {
                if (peer.socketId === socket.id) {
                    sessionPeers.delete(userId);

                    // Notify others
                    socket.to(`session:${sessionId}`).emit('webrtc:peer-left', { userId });

                    // Clean up empty sessions
                    if (sessionPeers.size === 0) {
                        this.peers.delete(sessionId);
                    }

                    console.log(`[WebRTC] User ${userId} disconnected from session ${sessionId}`);
                }
            }
        }
    }

    /**
     * Get session peers
     */
    getSessionPeers(sessionId) {
        const sessionPeers = this.peers.get(sessionId);
        if (!sessionPeers) {
            return [];
        }

        return Array.from(sessionPeers.entries()).map(([userId, peer]) => ({
            userId,
            mediaConstraints: peer.mediaConstraints,
            joinedAt: peer.joinedAt
        }));
    }

    /**
     * Get active sessions count
     */
    getActiveSessionsCount() {
        return this.peers.size;
    }

    /**
     * Get total peers count
     */
    getTotalPeersCount() {
        let count = 0;
        for (const sessionPeers of this.peers.values()) {
            count += sessionPeers.size;
        }
        return count;
    }
}

module.exports = new WebRTCSignalingService();
