import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collabApi } from '../api/endpoints';
import { toast } from 'react-hot-toast';
import { FaPlus, FaFileAlt, FaClock, FaTrash } from 'react-icons/fa';
import { Document } from '../types';

const CollabDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        try {
            const { data } = await collabApi.getDocuments();
            setDocs(data.data);
        } catch (error) {
            toast.error('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const createNewDoc = async () => {
        try {
            const { data } = await collabApi.createDocument({ title: 'New Study Note' });
            navigate(`/collab/docs/${data.data._id}`);
        } catch (error) {
            toast.error('Failed to create document');
        }
    };

    const deleteDoc = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure?')) return;
        try {
            await collabApi.deleteDocument(id);
            setDocs(docs.filter(d => d._id !== id));
            toast.success('Deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary">StudyDocs</h1>
                    <p className="text-text-secondary">Collaborative notes for your study groups.</p>
                </div>
                <button
                    onClick={createNewDoc}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
                >
                    <FaPlus /> New Document
                </button>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-bg-secondary rounded-2xl" />)}
                </div>
            ) : docs.length === 0 ? (
                <div className="text-center py-20 bg-bg-secondary rounded-3xl border-2 border-dashed border-border">
                    <FaFileAlt className="text-4xl text-text-secondary mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-text-primary">No documents yet</h3>
                    <button onClick={createNewDoc} className="text-brand-primary font-bold mt-2">Create one now</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {docs.map(doc => (
                        <div
                            key={doc._id}
                            onClick={() => navigate(`/collab/docs/${doc._id}`)}
                            className="bg-bg-secondary p-6 rounded-2xl border border-border hover:border-brand-primary transition-all cursor-pointer group hover:shadow-xl"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
                                    <FaFileAlt className="text-xl" />
                                </div>
                                <button
                                    onClick={(e) => deleteDoc(e, doc._id)}
                                    className="p-2 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                            <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-1">{doc.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                                <FaClock />
                                <span>Edited {new Date(doc.lastModified).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CollabDashboard;
