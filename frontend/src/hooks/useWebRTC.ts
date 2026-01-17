import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const SOCKET_URL = 'http://localhost:5000/career-expo';

export const useWebRTC = (roomId: string | null) => {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // Initialize Socket
    useEffect(() => {
        if (!token) return;

        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket']
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (peerConnection.current) {
                peerConnection.current.close();
            }
        };
    }, [token]);

    // Handle Signaling
    useEffect(() => {
        if (!socket || !roomId) return;

        socket.emit('join-room', roomId);

        socket.on('offer', async ({ sdp, senderId }) => {
            if (!peerConnection.current) createPeerConnection();
            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await peerConnection.current?.createAnswer();
            await peerConnection.current?.setLocalDescription(answer);
            socket.emit('answer', { sdp: answer, roomId });
        });

        socket.on('answer', async ({ sdp }) => {
            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(sdp));
        });

        socket.on('ice-candidate', async ({ candidate }) => {
            if (candidate) {
                await peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        return () => {
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
        };
    }, [socket, roomId]);

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && socket && roomId) {
                socket.emit('ice-candidate', { candidate: event.candidate, roomId });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        if (localStream) {
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        }

        peerConnection.current = pc;
    };

    const startCall = async (video = true, audio = true) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
            setLocalStream(stream);

            // Add to PeerConnection if exists, else create
            if (!peerConnection.current) createPeerConnection();
            else {
                stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));
            }

            // Create Offer
            const offer = await peerConnection.current?.createOffer();
            await peerConnection.current?.setLocalDescription(offer);
            socket?.emit('offer', { sdp: offer, roomId });

        } catch (err) {
            console.error('Error accessing media devices:', err);
            toast.error('Could not access camera/microphone');
        }
    };

    const endCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
    };

    return {
        socket,
        localStream,
        remoteStream,
        startCall,
        endCall
    };
};
