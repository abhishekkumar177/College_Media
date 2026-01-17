import React, { useEffect, useState } from 'react';
import { credentialsApi } from '../api/endpoints';
import { FaAward, FaDownload, FaCheckCircle, FaFingerprint, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const CredentialsWallet: React.FC = () => {
    const [credentials, setCredentials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCredentials = async () => {
            try {
                const { data } = await credentialsApi.getMy();
                setCredentials(data.data || []);
            } catch (err) {
                toast.error('Failed to load credentials');
            } finally {
                setLoading(false);
            }
        };
        fetchCredentials();
    }, []);

    const handleDownload = async (id: string, title: string) => {
        try {
            const response = await credentialsApi.download(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate-${title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Download failed');
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-text-primary mb-2 flex items-center gap-2">
                            <FaFingerprint className="text-brand-primary" /> Credentials Wallet
                        </h1>
                        <p className="text-text-secondary text-lg">Your blockchain-verified academic achievements.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                        {[1, 2].map(i => <div key={i} className="h-64 bg-bg-secondary rounded-3xl" />)}
                    </div>
                ) : credentials.length === 0 ? (
                    <div className="text-center py-20 bg-bg-secondary rounded-3xl border border-border">
                        <FaAward className="text-6xl text-bg-tertiary mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-text-secondary">No credentials yet</h3>
                        <p className="text-sm text-text-secondary mt-2">Complete courses or win hackathons to earn badges.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {credentials.map(cred => (
                            <div key={cred._id} className="bg-bg-secondary rounded-3xl p-1 border border-border shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all group">
                                <div className="bg-white rounded-[20px] p-6 h-full flex flex-col relative overflow-hidden">
                                    {/* Background Pattern */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-[100px]" />

                                    <div className="relative z-10 mb-6">
                                        <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                                            <FaAward className="text-brand-primary" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 leading-tight mb-2">
                                            {cred.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">{cred.description}</p>
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex justify-between items-center text-xs mb-1">
                                                <span className="font-bold text-gray-400 uppercase tracking-widest">Issuer</span>
                                                <span className="font-bold text-gray-700">{cred.issuer}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-gray-400 uppercase tracking-widest">Date</span>
                                                <span className="font-bold text-gray-700">{new Date(cred.issueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDownload(cred._id, cred.title)}
                                                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-colors"
                                            >
                                                <FaDownload /> PDF
                                            </button>
                                            <a
                                                href={`/verify/${cred._id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                                                title="Verify Publicly"
                                            >
                                                <FaExternalLinkAlt />
                                            </a>
                                        </div>

                                        <div className="flex items-center justify-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 py-1 rounded-lg">
                                            <FaCheckCircle /> Blockchain Verified
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CredentialsWallet;
