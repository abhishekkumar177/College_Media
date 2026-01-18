/**
 * ModerationQueue Page
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * Dashboard for moderators to review flagged content.
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import useModeration from '../../hooks/useModeration';
import ContentReviewCard from '../../components/moderation/ContentReviewCard';

const ModerationQueue = () => {
    const { queue, loading, fetchQueue, takeAction, bulkAction } = useModeration();
    const [filter, setFilter] = useState({
        status: 'pending',
        category: '',
        priority: ''
    });
    const [selectedItems, setSelectedItems] = useState([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchQueue({ ...filter, page, limit: 20 });
    }, [fetchQueue, filter, page]);

    const handleFilterChange = (key, value) => {
        setFilter(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === queue.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(queue.map(item => item._id));
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedItems.length === 0) return;

        const reason = prompt(`Enter reason for ${action}:`);
        if (!reason) return;

        await bulkAction(selectedItems, action, reason);
        setSelectedItems([]);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Moderation Queue
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Review flagged content and take action
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {queue.length} items pending
                        </span>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <select
                            value={filter.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="pending">Pending</option>
                            <option value="in_review">In Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <select
                            value={filter.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">All Categories</option>
                            <option value="profanity">Profanity</option>
                            <option value="spam">Spam</option>
                            <option value="hate_speech">Hate Speech</option>
                            <option value="nsfw">NSFW</option>
                        </select>

                        <select
                            value={filter.priority}
                            onChange={(e) => handleFilterChange('priority', e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">All Priorities</option>
                            <option value="1">Critical (1)</option>
                            <option value="2">High (2)</option>
                            <option value="3">Medium (3)</option>
                            <option value="5">Low (5)</option>
                        </select>

                        {selectedItems.length > 0 && (
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedItems.length} selected
                                </span>
                                <button
                                    onClick={() => handleBulkAction('approve')}
                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                >
                                    Approve All
                                </button>
                                <button
                                    onClick={() => handleBulkAction('remove')}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                                >
                                    Remove All
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Queue Items */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 dark:text-gray-400 mt-4">Loading queue...</p>
                    </div>
                ) : queue.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl">
                        <Icon icon="mdi:check-circle" className="w-20 h-20 text-green-500 mx-auto" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
                            Queue is Empty!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            All content has been reviewed.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Select All */}
                        <div className="flex items-center gap-2 px-4">
                            <input
                                type="checkbox"
                                checked={selectedItems.length === queue.length}
                                onChange={handleSelectAll}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Select All
                            </span>
                        </div>

                        {/* Items */}
                        {queue.map((item) => (
                            <ContentReviewCard
                                key={item._id}
                                item={item}
                                selected={selectedItems.includes(item._id)}
                                onSelect={() => handleSelectItem(item._id)}
                                onAction={takeAction}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {queue.length > 0 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-gray-600 dark:text-gray-400">Page {page}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={queue.length < 20}
                            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModerationQueue;
