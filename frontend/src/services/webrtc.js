import { io } from 'socket.io-client';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

class WebRTCService {
    constructor() {
        this.socket = null;
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
        this.userId = null;

        // Callback hooks for UI updates
        this.onLocalStream = null;
        this.onRemoteStream = null;
        this.onIncomingCall = null;
        this.onCallEnded = null;
    }

    /**
     * Initialize Socket connection
     */
    connect(token, userId) {
        this.userId = userId;
        this.socket = io('http://localhost:5000/webrtc', {
            auth: { token },
            transports: ['websocket']
        });

        this.setupSocketListeners();
    }

    setupSocketListeners() {
        this.socket.on('call-made', async (data) => {
            if (this.onIncomingCall) {
                this.onIncomingCall(data);
            }
        });

        this.socket.on('call-answered', async (data) => {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal));
        });

        this.socket.on('ice-candidate', async (data) => {
            if (this.peerConnection) {
                try {
                    await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    console.error('Error adding received ice candidate', e);
                }
            }
        });

        this.socket.on('call-ended', () => {
            this.endCall();
        });
    }

    /**
     * Get Local Media Stream (Cams/Mic)
     */
    async getLocalStream(video = true, audio = true) {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ video, audio });
            if (this.onLocalStream) this.onLocalStream(this.localStream);
            return this.localStream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    }

    /**
     * Initialize Peer Connection
     */
    createPeerConnection(targetUserId) {
        this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
        }

        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            this.remoteStream = event.streams[0];
            if (this.onRemoteStream) this.onRemoteStream(this.remoteStream);
        };

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    to: targetUserId
                });
            }
        };

        this.peerConnection.onconnectionstatechange = () => {
            console.log('WebRTC Connection State:', this.peerConnection.connectionState);
            if (this.peerConnection.connectionState === 'disconnected') {
                this.endCall();
            }
        };
    }

    /**
     * Start a Call (Caller Side)
     */
    async callUser(targetUserId, fromName) {
        this.createPeerConnection(targetUserId);

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.socket.emit('call-user', {
            userToCall: targetUserId,
            signalData: offer,
            from: this.userId,
            name: fromName
        });
    }

    /**
     * Answer a Call (Callee Side)
     */
    async answerCall(data) {
        this.createPeerConnection(data.from);

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal));

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        this.socket.emit('answer-call', {
            signal: answer,
            to: data.from
        });
    }

    /**
     * End Call
     */
    endCall(targetUserId) {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (targetUserId) {
            this.socket.emit('end-call', { to: targetUserId });
        }

        if (this.onCallEnded) this.onCallEnded();
    }
}

export default new WebRTCService();
