import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

const FILTER_STORAGE_KEY = 'search_filters_preferences';

interface AdvancedSearchFiltersProps {
    onFilterChange: (filters: any) => void;
    onClose: () => void;
}

const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({ onFilterChange, onClose }) => {
    const { t } = useTranslation();
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

    const handleFilterChange = (filterType: string, value: string) => {
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
        <div className="absolute top-full right-0 mt-2 w-80 bg-bg-secondary rounded-lg shadow-xl border border-border z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text-primary">
                    {t('searchFilterBar.advancedFilters.title')}
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-bg-tertiary rounded-full transition-colors"
                    aria-label={t('searchFilterBar.advancedFilters.close')}
                >
                    <Icon icon="mdi:close" width={20} className="text-text-muted" />
                </button>
            </div>

            {/* Filter Options */}
            <div className="p-4 space-y-4">
                {/* Content Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        {t('searchFilterBar.advancedFilters.contentType')}
                    </label>
                    <select
                        value={filters.contentType}
                        onChange={(e) => handleFilterChange('contentType', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                        <option value="all">{t('searchFilterBar.advancedFilters.allContent')}</option>
                        <option value="posts">{t('searchFilterBar.advancedFilters.postsOnly')}</option>
                        <option value="users">{t('searchFilterBar.advancedFilters.usersOnly')}</option>
                        <option value="tags">{t('searchFilterBar.advancedFilters.tagsOnly')}</option>
                    </select>
                </div>

                {/* Date Range Filter */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        {t('searchFilterBar.advancedFilters.dateRange')}
                    </label>
                    <select
                        value={filters.dateRange}
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                        <option value="all">{t('searchFilterBar.advancedFilters.allTime')}</option>
                        <option value="today">{t('searchFilterBar.advancedFilters.today')}</option>
                        <option value="week">{t('searchFilterBar.advancedFilters.week')}</option>
                        <option value="month">{t('searchFilterBar.advancedFilters.month')}</option>
                        <option value="year">{t('searchFilterBar.advancedFilters.year')}</option>
                    </select>
                </div>

                {/* Sort By Filter */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        {t('searchFilterBar.advancedFilters.sortBy')}
                    </label>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                        <option value="relevance">{t('searchFilterBar.advancedFilters.relevance')}</option>
                        <option value="semantic">{t('searchFilterBar.advancedFilters.semantic') || '🧠 AI Semantic Match'}</option>
                        <option value="newest">{t('searchFilterBar.advancedFilters.newest')}</option>
                        <option value="oldest">{t('searchFilterBar.advancedFilters.oldest')}</option>
                        <option value="popular">{t('searchFilterBar.advancedFilters.popular')}</option>
                    </select>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-4 border-t border-border">
                <button
                    onClick={handleReset}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                    {t('searchFilterBar.advancedFilters.reset')}
                </button>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg font-medium transition-colors"
                >
                    {t('searchFilterBar.advancedFilters.apply')}
                </button>
            </div>
        </div>
    );
};

export default AdvancedSearchFilters;

