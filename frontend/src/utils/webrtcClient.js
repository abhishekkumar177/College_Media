/**
 * WebRTC Client Utility
 * Issue #923: Real-time Collaborative Features
 * 
 * Client-side WebRTC utilities for peer-to-peer connections.
 */

class WebRTCClient {
    constructor() {
        this.peerConnections = new Map();
        this.localStream = null;
        this.socket = null;
        this.sessionId = null;
        this.userId = null;

        // ICE servers configuration
        this.iceServers = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
    }

    /**
     * Initialize WebRTC client
     */
    initialize(socket, sessionId, userId) {
        this.socket = socket;
        this.sessionId = sessionId;
        this.userId = userId;

        this.setupSocketListeners();
    }

    /**
     * Setup socket event listeners
     */
    setupSocketListeners() {
        if (!this.socket) return;

        // Handle WebRTC offer
        this.socket.on('webrtc:offer', async (data) => {
            await this.handleOffer(data);
        });

        // Handle WebRTC answer
        this.socket.on('webrtc:answer', async (data) => {
            await this.handleAnswer(data);
        });

        // Handle ICE candidate
        this.socket.on('webrtc:ice-candidate', async (data) => {
            await this.handleICECandidate(data);
        });

        // Handle peer joined
        this.socket.on('webrtc:peer-joined', async (data) => {
            await this.createPeerConnection(data.userId);
        });

        // Handle peer left
        this.socket.on('webrtc:peer-left', (data) => {
            this.closePeerConnection(data.userId);
        });
    }

    /**
     * Get user media (audio/video)
     */
    async getUserMedia(constraints = { audio: true, video: true }) {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            return this.localStream;
        } catch (error) {
            console.error('Get user media error:', error);
            throw error;
        }
    }

    /**
     * Get screen share stream
     */
    async getScreenShare() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: false
            });

            // Notify others
            this.socket.emit('webrtc:screen-share-start', {
                sessionId: this.sessionId,
                userId: this.userId
            });

            return stream;
        } catch (error) {
            console.error('Get screen share error:', error);
            throw error;
        }
    }

    /**
     * Create peer connection
     */
    async createPeerConnection(peerId) {
        if (this.peerConnections.has(peerId)) {
            return this.peerConnections.get(peerId);
        }

        const peerConnection = new RTCPeerConnection(this.iceServers);

        // Add local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, this.localStream);
            });
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('webrtc:ice-candidate', {
                    sessionId: this.sessionId,
                    targetUserId: peerId,
                    candidate: event.candidate
                });
            }
        };

        // Handle remote stream
        peerConnection.ontrack = (event) => {
            this.handleRemoteStream(peerId, event.streams[0]);
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log(`Peer ${peerId} connection state:`, peerConnection.connectionState);
        };

        this.peerConnections.set(peerId, peerConnection);

        // Create and send offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        this.socket.emit('webrtc:offer', {
            sessionId: this.sessionId,
            targetUserId: peerId,
            offer
        });

        return peerConnection;
    }

    /**
     * Handle incoming offer
     */
    async handleOffer(data) {
        const { fromUserId, offer } = data;

        let peerConnection = this.peerConnections.get(fromUserId);
        if (!peerConnection) {
            peerConnection = new RTCPeerConnection(this.iceServers);
            this.peerConnections.set(fromUserId, peerConnection);

            // Add local stream tracks
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, this.localStream);
                });
            }

            // Setup event handlers
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socket.emit('webrtc:ice-candidate', {
                        sessionId: this.sessionId,
                        targetUserId: fromUserId,
                        candidate: event.candidate
                    });
                }
            };

            peerConnection.ontrack = (event) => {
                this.handleRemoteStream(fromUserId, event.streams[0]);
            };
        }

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        this.socket.emit('webrtc:answer', {
            sessionId: this.sessionId,
            targetUserId: fromUserId,
            answer
        });
    }

    /**
     * Handle incoming answer
     */
    async handleAnswer(data) {
        const { fromUserId, answer } = data;

        const peerConnection = this.peerConnections.get(fromUserId);
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    /**
     * Handle incoming ICE candidate
     */
    async handleICECandidate(data) {
        const { fromUserId, candidate } = data;

        const peerConnection = this.peerConnections.get(fromUserId);
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    /**
     * Handle remote stream
     */
    handleRemoteStream(peerId, stream) {
        // Emit event for UI to handle
        const event = new CustomEvent('webrtc:remote-stream', {
            detail: { peerId, stream }
        });
        window.dispatchEvent(event);
    }

    /**
     * Close peer connection
     */
    closePeerConnection(peerId) {
        const peerConnection = this.peerConnections.get(peerId);
        if (peerConnection) {
            peerConnection.close();
            this.peerConnections.delete(peerId);
        }
    }

    /**
     * Close all connections
     */
    closeAllConnections() {
        for (const [peerId, peerConnection] of this.peerConnections.entries()) {
            peerConnection.close();
        }
        this.peerConnections.clear();

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
    }

    /**
     * Toggle audio
     */
    toggleAudio(enabled) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }

    /**
     * Toggle video
     */
    toggleVideo(enabled) {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }
}

export default new WebRTCClient();
