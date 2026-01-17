import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { credentialsApi } from '../api/endpoints';
import { FaCheckCircle, FaTimesCircle, FaFingerprint, FaShieldAlt } from 'react-icons/fa';

const Verifier: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const verify = async () => {
            try {
                if (id) {
                    const response = await credentialsApi.verify(id);
                    setData(response.data.data);
                    setStatus('valid');
                } else {
                    setStatus('invalid');
                }
            } catch (err) {
                setStatus('invalid');
            }
        };
        verify();
    }, [id]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden text-center p-8 border border-gray-100">

                <div className="mb-8 flex justify-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-inner ${status === 'loading' ? 'bg-gray-100 animate-pulse' : status === 'valid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {status === 'loading' ? <FaShieldAlt className="text-gray-300" /> : status === 'valid' ? <FaCheckCircle /> : <FaTimesCircle />}
                    </div>
                </div>

                {status === 'loading' && (
                    <h2 className="text-2xl font-black text-gray-800 animate-pulse">Verifying Blockchain Proof...</h2>
                )}

                {status === 'invalid' && (
                    <div>
                        <h2 className="text-2xl font-black text-red-600 mb-2">Verification Failed</h2>
                        <p className="text-gray-500">This credential ID does not match any record on the ledger or has been revoked.</p>
                    </div>
                )}

                {status === 'valid' && data && (
                    <div className="animate-fade-in-up">
                        <h2 className="text-2xl font-black text-gray-900 mb-1">Verified Credential</h2>
                        <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-6">Cryptographically Signed</div>

                        <div className="text-left bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Recipient</label>
                                <div className="font-bold text-gray-800 text-lg">{data.recipient.username}</div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Achievement</label>
                                <div className="font-bold text-gray-800 leading-tight">{data.title}</div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Issue Date</label>
                                <div className="font-bold text-gray-800">{new Date(data.issueDate).toLocaleDateString()}</div>
                            </div>
                            <div className="pt-4 border-t border-gray-200">
                                <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                                    <FaFingerprint /> Merkle Root (Partial)
                                </label>
                                <div className="font-mono text-[10px] text-gray-500 break-all mt-1">
                                    {data.proof.root}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-xs text-center text-gray-400">
                    Secured by College Media Ledger
                </div>
            </div>
        </div>
    );
};

export default Verifier;
