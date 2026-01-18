import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollab } from '../hooks/useCollab';
import QuillEditor from '../components/Editor/QuillEditor';
import { useAuth } from '../context/AuthContext';
import { collabApi } from '../api/endpoints';
import { toast } from 'react-hot-toast';
import { FaSave, FaUsers, FaArrowLeft, FaHistory, FaShareAlt } from 'react-icons/fa';

const CollabDoc: React.FC = () => {
    const { docId } = useParams<{ docId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { ydoc, isConnected, collaborators, saveDocument } = useCollab(docId || null);
    const [docTitle, setDocTitle] = useState('Loading...');
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (docId) {
            loadDocMeta();
        }
    }, [docId]);

    const loadDocMeta = async () => {
        try {
            const { data } = await collabApi.getDocument(docId!);
            setDocTitle(data.data.title);
        } catch (error) {
            toast.error('Could not load document details');
            navigate('/collab/dashboard');
        }
    };

    if (!docId) return <div>Invalid Document ID</div>;

    return (
        <div className="flex h-screen bg-bg-primary overflow-hidden">
            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 border-b border-border bg-bg-secondary flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/collab/dashboard')}
                            className="p-2 hover:bg-bg-tertiary rounded-full transition-colors"
                        >
                            <FaArrowLeft />
                        </button>
                        <div>
                            <input
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                className="bg-transparent font-bold text-lg text-text-primary focus:outline-none focus:border-b-2 focus:border-brand-primary"
                            />
                            <div className="text-xs text-text-secondary flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                {isConnected ? 'Online' : 'Offline'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2 mr-4">
                            {collaborators.map((c, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs border-2 border-bg-secondary" title={c.username}>
                                    {c.username[0].toUpperCase()}
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-xs border-2 border-bg-secondary text-text-secondary">
                                +{collaborators.length}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="p-2.5 rounded-xl bg-bg-tertiary text-text-primary hover:bg-border transition-all"
                            title="Version History"
                        >
                            <FaHistory />
                        </button>
                        <button
                            className="p-2.5 rounded-xl bg-bg-tertiary text-text-primary hover:bg-border transition-all"
                            title="Share"
                        >
                            <FaShareAlt />
                        </button>
                        <button
                            onClick={saveDocument}
                            className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl shadow-lg hover:shadow-brand-primary/40 transition-all font-bold"
                        >
                            <FaSave /> Save
                        </button>
                    </div>
                </header>

                {/* Editor Container */}
                <div className="flex-1 overflow-hidden p-6">
                    <div className="max-w-4xl mx-auto h-full shadow-xl rounded-xl border border-border bg-white">
                        <QuillEditor ydoc={ydoc} user={user} />
                    </div>
                </div>
            </div>

            {/* Version History Sidebar (Mock) */}
            {showHistory && (
                <div className="w-80 bg-bg-secondary border-l border-border flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-4 border-b border-border font-bold flex justify-between">
                        <span>Version History</span>
                        <button onClick={() => setShowHistory(false)}>x</button>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="p-3 bg-bg-tertiary rounded-lg cursor-pointer hover:bg-border">
                            <div className="text-sm font-bold">Current Version</div>
                            <div className="text-xs text-text-secondary">Just now • {user?.username}</div>
                        </div>
                        <div className="p-3 bg-bg-tertiary/50 rounded-lg cursor-pointer hover:bg-border opacity-60">
                            <div className="text-sm font-bold">Yesterday, 4:20 PM</div>
                            <div className="text-xs text-text-secondary">Autosaved</div>
                        </div>
                        {/* This would be populated by fetching revisions from backend */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollabDoc;
