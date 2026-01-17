import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { careerExpoApi } from '../api/endpoints';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import VideoRoom from '../components/VideoRoom';
import { FaBuilding, FaUserTie, FaUsers, FaClock, FaCheckCircle, FaBriefcase } from 'react-icons/fa';

const SOCKET_URL = 'http://localhost:5000/career-expo';

const CareerFair: React.FC = () => {
    const { user, token } = useAuth();
    const [booths, setBooths] = useState<any[]>([]);
    const [socket, setSocket] = useState<any>(null);
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [remoteUser, setRemoteUser] = useState<string>('');
    const [queueStatus, setQueueStatus] = useState<{ boothId: string, position: number } | null>(null);

    // Fetch Booths
    useEffect(() => {
        const fetchBooths = async () => {
            try {
                const { data } = await careerExpoApi.getBooths();
                setBooths(data.data || []);
            } catch (err) { console.error(err); }
        };
        fetchBooths();
    }, []);

    // Socket Connection
    useEffect(() => {
        if (!token) return;
        const newSocket = io(SOCKET_URL, { auth: { token } });
        setSocket(newSocket);

        newSocket.on('queue-update', ({ position }) => {
            toast('Queue updated: You are position ' + position);
            setQueueStatus(prev => prev ? { ...prev, position } : null);
        });

        newSocket.on('call-candidate', ({ roomId, recruiterName }) => {
            // Incoming call invitation
            if (window.confirm(`Start interview with ${recruiterName}?`)) {
                setActiveRoom(roomId);
                setRemoteUser(recruiterName);
            }
        });

        newSocket.on('queue-changed', (data: any) => {
            // Recruiter side updates
            // Refresh specific booth queue count
        });

        return () => { newSocket.close(); };
    }, [token]);

    const joinQueue = (boothId: string) => {
        socket.emit('join-queue', boothId);
        setQueueStatus({ boothId, position: -1 }); // Waiting for server confirm
        toast.success('Joined queue');
    };

    const handleEndCall = () => {
        setActiveRoom(null);
        // Implement socket emit end-interview
    };

    if (activeRoom) {
        return (
            <div className="h-screen p-6 bg-gray-900">
                <VideoRoom
                    roomId={activeRoom}
                    currentUser={user}
                    remoteUserName={remoteUser}
                    onEndCall={handleEndCall}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-text-primary mb-3">Virtual Career Expo</h1>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto">Connect with alumni recruiters from top companies. Join queues, network, and crack your dream job—live.</p>
                </div>

                {queueStatus && (
                    <div className="fixed bottom-6 right-6 bg-brand-primary text-white p-4 rounded-2xl shadow-2xl z-50 animate-bounce-subtle">
                        <div className="text-xs font-bold uppercase opacity-80 mb-1">Queue Status</div>
                        <div className="font-bold text-lg flex items-center gap-2">
                            <FaClock /> Position: {queueStatus.position > 0 ? queueStatus.position : 'Processing...'}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {booths.map((booth, idx) => (
                        <div key={idx} className="bg-bg-secondary rounded-3xl p-6 border border-border hover:shadow-xl transition-all relative group">
                            <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live
                            </div>

                            <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-2xl">
                                {/* Placeholder Logo */}
                                {booth.logoUrl ? <img src={booth.logoUrl} className="w-10" /> : <FaBriefcase />}
                            </div>

                            <h3 className="text-xl font-black text-text-primary mb-1">{booth.companyName}</h3>
                            <div className="text-sm font-bold text-text-secondary mb-4 flex items-center gap-2">
                                <FaUserTie /> {booth.recruiter?.username || 'Alumnus'}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {booth.rolesHiring?.map((role: string) => (
                                    <span key={role} className="px-2 py-1 bg-bg-tertiary rounded-lg text-xs font-medium text-text-secondary">
                                        {role}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="text-xs font-bold text-text-secondary flex items-center gap-1">
                                    <FaUsers /> {booth.currentQueueLength || 0} Waiting
                                </div>
                                <button
                                    onClick={() => joinQueue(booth._id)}
                                    disabled={queueStatus !== null}
                                    className="px-5 py-2.5 bg-brand-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {queueStatus?.boothId === booth._id ? 'Queued' : 'Join Queue'}
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Mock Booths for Visual if Empty */}
                    {booths.length === 0 && [1, 2, 3].map(i => (
                        <div key={i} className="bg-bg-secondary rounded-3xl p-6 border border-border opacity-60">
                            <div className="h-10 w-10 bg-bg-tertiary rounded-lg mb-4" />
                            <div className="h-6 w-3/4 bg-bg-tertiary rounded mb-2" />
                            <div className="h-4 w-1/2 bg-bg-tertiary rounded mb-6" />
                            <div className="text-center font-bold text-text-secondary">No active booths</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CareerFair;
