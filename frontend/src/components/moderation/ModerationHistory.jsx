/**
 * ModerationHistory Component
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * Timeline view of moderation actions for a user or content.
 */

import React from 'react';
import { Icon } from '@iconify/react';

const ModerationHistory = ({ history = [], loading = false }) => {

    const getActionIcon = (action) => {
        switch (action) {
            case 'approve': return 'mdi:check-circle';
            case 'warn': return 'mdi:alert';
            case 'hide': return 'mdi:eye-off';
            case 'remove': return 'mdi:delete';
            case 'ban_user': return 'mdi:account-cancel';
            case 'shadow_ban': return 'mdi:ghost';
            case 'restore': return 'mdi:restore';
            default: return 'mdi:information';
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'approve': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
            case 'warn': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
            case 'hide': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
            case 'remove': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
            case 'ban_user': return 'text-gray-800 bg-gray-200 dark:bg-gray-700';
            case 'shadow_ban': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
            case 'restore': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    if (loading) {
        return (
            <div className="py-10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading history...</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="py-10 text-center">
                <Icon icon="mdi:history" className="w-16 h-16 text-gray-400 mx-auto" />
                <p className="text-gray-600 dark:text-gray-400 mt-4">No moderation history</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            {/* Timeline items */}
            <div className="space-y-6">
                {history.map((item, index) => (
                    <div key={item._id || index} className="relative flex gap-4">
                        {/* Icon */}
                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${getActionColor(item.action)}`}>
                            <Icon icon={getActionIcon(item.action)} className="w-6 h-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                                        {item.action?.replace('_', ' ')}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {item.contentType} • {formatDate(item.createdAt)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {item.appealable && !item.appealed && (
                                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                            Appealable
                                        </span>
                                    )}
                                    {item.appealed && (
                                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                                            Appealed
                                        </span>
                                    )}
                                    {item.reversed && (
                                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                                            Reversed
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-700 dark:text-gray-300">
                                {item.reason}
                            </p>

                            {item.moderatorNotes && (
                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong>Moderator Notes:</strong> {item.moderatorNotes}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                {item.moderatorId && (
                                    <span className="flex items-center gap-1">
                                        <Icon icon="mdi:shield-account" />
                                        {item.moderatorId.username || 'Moderator'}
                                    </span>
                                )}
                                {item.isAutomated && (
                                    <span className="flex items-center gap-1">
                                        <Icon icon="mdi:robot" />
                                        Auto-moderated
                                    </span>
                                )}
                                {item.aiConfidenceScore && (
                                    <span className="flex items-center gap-1">
                                        <Icon icon="mdi:brain" />
                                        AI: {Math.round(item.aiConfidenceScore * 100)}%
                                    </span>
                                )}
                            </div>

                            {/* Reversal info */}
                            {item.reversed && (
                                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="text-sm text-green-700 dark:text-green-400">
                                        <Icon icon="mdi:undo" className="inline mr-1" />
                                        <strong>Reversed</strong> on {formatDate(item.reversedAt)}
                                    </p>
                                    {item.reversalReason && (
                                        <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                                            Reason: {item.reversalReason}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModerationHistory;
