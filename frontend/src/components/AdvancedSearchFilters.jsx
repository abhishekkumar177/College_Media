/**
 * AdvancedSearchFilters Component
 * Issue #408: Implement Advanced Search with Filters and Voice Search Support
 * 
 * Provides advanced filtering options for search results including content type,
 * date range, and sorting preferences with localStorage persistence.
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

const FILTER_STORAGE_KEY = 'search_filters_preferences';

const AdvancedSearchFilters = ({ onFilterChange, onClose }) => {
    const [filters, setFilters] = useState(() => {
        // Load saved preferences from localStorage
        const saved = localStorage.getItem(FILTER_STORAGE_KEY);
        return saved ? JSON.parse(saved) : {
            contentType: 'all',
            dateRange: 'all',
            sortBy: 'relevance'
        };
    });

    // Save filters to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
        if (onFilterChange) {
            onFilterChange(filters);
        }
    }, [filters, onFilterChange]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleReset = () => {
        const defaultFilters = {
            contentType: 'all',
            dateRange: 'all',
            sortBy: 'relevance'
        };
        setFilters(defaultFilters);
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Advanced Filters
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Close filters"
                >
                    <Icon icon="mdi:close" width={20} className="text-gray-600 dark:text-gray-400" />
                </button>
            </div>

            {/* Filter Options */}
            <div className="p-4 space-y-4">
                {/* Content Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content Type
                    </label>
                    <select
                        value={filters.contentType}
                        onChange={(e) => handleFilterChange('contentType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Content</option>
                        <option value="posts">Posts Only</option>
                        <option value="users">Users Only</option>
                        <option value="tags">Tags Only</option>
                    </select>
                </div>

                {/* Date Range Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date Range
                    </label>
                    <select
                        value={filters.dateRange}
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                </div>

                {/* Sort By Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sort By
                    </label>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="relevance">Most Relevant</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleReset}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                    Reset Filters
                </button>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    Apply
                </button>
            </div>
        </div>
    );
};

export default AdvancedSearchFilters;
