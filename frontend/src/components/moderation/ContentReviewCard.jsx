/**
 * ContentReviewCard Component
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * Card component for reviewing content in the moderation queue.
 */

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const ContentReviewCard = ({ item, selected, onSelect, onAction }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [actionReason, setActionReason] = useState('');
    const [showActionModal, setShowActionModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const getPriorityColor = (priority) => {
        if (priority <= 2) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        if (priority <= 3) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
        if (priority <= 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    };

    const getConfidenceColor = (score) => {
        if (score >= 0.8) return 'text-red-600';
        if (score >= 0.5) return 'text-orange-600';
        return 'text-green-600';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    const handleAction = (action) => {
        if (['warn', 'hide', 'remove', 'ban_user'].includes(action)) {
            setPendingAction(action);
            setShowActionModal(true);
        } else {
            onAction(item._id, action, 'Approved by moderator');
        }
    };

    const confirmAction = () => {
        if (!actionReason.trim()) return;
        onAction(item._id, pendingAction, actionReason);
        setShowActionModal(false);
        setActionReason('');
        setPendingAction(null);
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all ${selected ? 'border-blue-500' : 'border-transparent'
            }`}>
            {/* Header */}
            <div className="flex items-start p-4 border-b border-gray-100 dark:border-gray-700">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={onSelect}
                    className="w-4 h-4 mt-1 rounded border-gray-300"
                />

                <div className="ml-4 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <img
                            src={item.userId?.avatar || '/default-avatar.png'}
                            alt={item.userId?.username || 'User'}
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                {item.userId?.username || 'Unknown User'}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.contentType} • {formatDate(item.createdAt)}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            Priority {item.priority}
                        </span>
                        {item.aiAnalysis?.detectedCategories?.map((cat, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                                {cat}
                            </span>
                        ))}
                        {item.reportCount > 0 && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-xs">
                                {item.reportCount} reports
                            </span>
                        )}
                    </div>
                </div>

                {/* AI Score */}
                <div className="text-right">
                    <div className={`text-2xl font-bold ${getConfidenceColor(item.aiAnalysis?.overallConfidence || 0)}`}>
                        {Math.round((item.aiAnalysis?.overallConfidence || 0) * 100)}%
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI Confidence</p>
                </div>
            </div>

            {/* Content Preview */}
            <div className="p-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {item.contentSnapshot?.text || 'No text content'}
                    </p>

                    {item.contentSnapshot?.imageUrls?.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                            {item.contentSnapshot.imageUrls.map((url, idx) => (
                                <img
                                    key={idx}
                                    src={url}
                                    alt={`Attachment ${idx + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                    onClick={() => window.open(url, '_blank')}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Analysis Details */}
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    <Icon icon={showDetails ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
                    {showDetails ? 'Hide' : 'Show'} AI Analysis
                </button>

                {showDetails && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Profanity</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500"
                                        style={{ width: `${(item.aiAnalysis?.profanityScore || 0) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium">{Math.round((item.aiAnalysis?.profanityScore || 0) * 100)}%</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Spam</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500"
                                        style={{ width: `${(item.aiAnalysis?.spamScore || 0) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium">{Math.round((item.aiAnalysis?.spamScore || 0) * 100)}%</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hate Speech</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500"
                                        style={{ width: `${(item.aiAnalysis?.hateSpeechScore || 0) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium">{Math.round((item.aiAnalysis?.hateSpeechScore || 0) * 100)}%</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Toxicity</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500"
                                        style={{ width: `${(item.aiAnalysis?.toxicityScore || 0) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium">{Math.round((item.aiAnalysis?.toxicityScore || 0) * 100)}%</span>
                            </div>
                        </div>

                        {item.aiAnalysis?.flaggedPhrases?.length > 0 && (
                            <div className="col-span-full">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Flagged Phrases:</p>
                                <div className="flex flex-wrap gap-2">
                                    {item.aiAnalysis.flaggedPhrases.map((phrase, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded text-sm">
                                            "{phrase}"
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={() => handleAction('approve')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Icon icon="mdi:check" />
                    Approve
                </button>
                <button
                    onClick={() => handleAction('warn')}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                    <Icon icon="mdi:alert" />
                    Warn
                </button>
                <button
                    onClick={() => handleAction('hide')}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                    <Icon icon="mdi:eye-off" />
                    Hide
                </button>
                <button
                    onClick={() => handleAction('remove')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    <Icon icon="mdi:delete" />
                    Remove
                </button>
                <button
                    onClick={() => handleAction('ban_user')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-900 transition-colors ml-auto"
                >
                    <Icon icon="mdi:account-cancel" />
                    Ban User
                </button>
            </div>

            {/* Action Modal */}
            {showActionModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={() => setShowActionModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Confirm Action: {pendingAction?.toUpperCase()}
                            </h3>
                            <textarea
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                placeholder="Enter reason for this action..."
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-24"
                                required
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setShowActionModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAction}
                                    disabled={!actionReason.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ContentReviewCard;
