import React, { useEffect, useState, useRef } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaExpand, FaDesktop } from 'react-icons/fa';

interface VideoRoomProps {
    roomId: string;
    currentUser: any;
    remoteUserName?: string;
    onEndCall: () => void;
}

const VideoRoom: React.FC<VideoRoomProps> = ({ roomId, currentUser, remoteUserName, onEndCall }) => {
    const { localStream, remoteStream, startCall, endCall } = useWebRTC(roomId);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const [muted, setMuted] = useState(false);
    const [videoOff, setVideoOff] = useState(false);

    useEffect(() => {
        startCall();
        return () => endCall();
    }, []); // Start on mount

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setMuted(!muted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setVideoOff(!videoOff);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black rounded-3xl overflow-hidden relative shadow-2xl">
            {/* Remote Video (Main View) */}
            <div className={`flex-1 relative ${!remoteStream ? 'flex items-center justify-center bg-gray-900' : ''}`}>
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
                {!remoteStream && (
                    <div className="text-center animate-pulse">
                        <div className="text-xl font-bold text-gray-500">Waiting for {remoteUserName || 'participant'}...</div>
                    </div>
                )}
                <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-white text-xs font-bold backdrop-blur-sm">
                    {remoteUserName || 'Remote User'}
                </div>
            </div>

            {/* Local Video (PiP) */}
            <div className="absolute top-4 right-4 w-32 h-48 bg-gray-800 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${videoOff ? 'hidden' : ''}`}
                />
                {videoOff && (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs">
                        Camera Off
                    </div>
                )}
                <div className="absolute bottom-2 left-2 text-[10px] font-bold text-white drop-shadow-md">You</div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-800/80 backdrop-blur px-6 py-3 rounded-2xl border border-white/10">
                <button
                    onClick={toggleMute}
                    className={`p-3 rounded-full ${muted ? 'bg-red-500 text-white' : 'bg-gray-600/50 text-white hover:bg-gray-600'} transition-all`}
                >
                    {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </button>
                <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-full ${videoOff ? 'bg-red-500 text-white' : 'bg-gray-600/50 text-white hover:bg-gray-600'} transition-all`}
                >
                    {videoOff ? <FaVideoSlash /> : <FaVideo />}
                </button>
                <button
                    onClick={onEndCall}
                    className="p-3 px-6 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center gap-2"
                >
                    <FaPhoneSlash /> End
                </button>
                <button className="p-3 rounded-full bg-gray-600/50 text-white hover:bg-gray-600">
                    <FaDesktop />
                </button>
            </div>
        </div>
    );
};

export default VideoRoom;
