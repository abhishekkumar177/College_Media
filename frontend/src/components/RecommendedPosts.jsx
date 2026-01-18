/**
 * RecommendedPosts Component
 * Issue #921: AI-Powered Content Recommendation Engine
 * 
 * Displays personalized post recommendations.
 */

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import useRecommendations from '../../hooks/useRecommendations';

const RecommendedPosts = ({ onPostClick, className = '' }) => {
    const [activeTab, setActiveTab] = useState('forYou');

    const {
        recommendations,
        trending,
        loading,
        error,
        dismissRecommendation,
        markClicked,
        refresh
    } = useRecommendations({ type: 'post', limit: 20 });

    const tabs = [
        { id: 'forYou', label: 'For You', icon: 'mdi:sparkles' },
        { id: 'trending', label: 'Trending', icon: 'mdi:fire' }
    ];

    const displayPosts = activeTab === 'forYou' ? recommendations : trending;

    /**
     * Handle post click
     */
    const handlePostClick = (rec) => {
        markClicked(rec.itemId);
        if (onPostClick) {
            onPostClick(rec);
        }
    };

    /**
     * Get reason badge
     */
    const getReasonBadge = (reason) => {
        const badges = {
            'liked_by_similar_users': { icon: 'mdi:account-group', text: 'Similar users liked', color: 'bg-blue-100 text-blue-700' },
            'similar_to_liked_content': { icon: 'mdi:heart', text: 'Similar to your likes', color: 'bg-pink-100 text-pink-700' },
            'trending': { icon: 'mdi:trending-up', text: 'Trending', color: 'bg-orange-100 text-orange-700' },
            'related_to_interests': { icon: 'mdi:star', text: 'Based on interests', color: 'bg-purple-100 text-purple-700' }
        };

        return badges[reason] || { icon: 'mdi:lightbulb', text: 'Recommended', color: 'bg-gray-100 text-gray-700' };
    };

    if (loading) {
        return (
            <div className={`recommended-posts ${className}`}>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`recommended-posts ${className} p-4 bg-red-50 dark:bg-red-900/20 rounded-xl`}>
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                    onClick={refresh}
                    className="mt-2 text-sm text-red-700 dark:text-red-300 underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className={`recommended-posts ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icon icon="mdi:sparkles" className="w-5 h-5 text-purple-500" />
                    Recommended
                </h3>
                <button
                    onClick={refresh}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Refresh"
                >
                    <Icon icon="mdi:refresh" className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${activeTab === tab.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
            `}
                    >
                        <Icon icon={tab.icon} className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Posts list */}
            <div className="space-y-3">
                {displayPosts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Icon icon="mdi:inbox-outline" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No recommendations yet</p>
                        <p className="text-sm">Interact with more content to get personalized suggestions</p>
                    </div>
                ) : (
                    displayPosts.map((rec) => {
                        const badge = getReasonBadge(rec.reasons?.[0] || rec.reason);

                        return (
                            <div
                                key={rec.itemId}
                                className="group relative bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
                                onClick={() => handlePostClick(rec)}
                            >
                                {/* Dismiss button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dismissRecommendation(rec.itemId);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
                                    title="Not interested"
                                >
                                    <Icon icon="mdi:close" className="w-4 h-4 text-gray-500" />
                                </button>

                                {/* Reason badge */}
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color} mb-2`}>
                                    <Icon icon={badge.icon} className="w-3 h-3" />
                                    {badge.text}
                                </div>

                                {/* Post preview */}
                                <div className="flex gap-3">
                                    {/* Thumbnail placeholder */}
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex-shrink-0">
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                            Post content preview...
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                            <span>@username</span>
                                            <span>•</span>
                                            <span>2h ago</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Confidence score */}
                                {rec.explanation?.confidence && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                style={{ width: `${rec.explanation.confidence}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {rec.explanation.confidence}% match
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Load more */}
            {displayPosts.length > 0 && (
                <button
                    onClick={refresh}
                    className="w-full mt-4 py-3 text-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors"
                >
                    Load more recommendations
                </button>
            )}
        </div>
    );
};

export default RecommendedPosts;
