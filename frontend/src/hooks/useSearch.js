/**
 * useSearch Hook
 * Issue #910: Advanced Search with Elasticsearch Integration
 * 
 * React hook for managing advanced search state and operations.
 */

import { useState, useCallback, useEffect } from 'react';
import { searchApi } from '../api/endpoints';
import toast from 'react-hot-toast';

const useSearch = () => {
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        type: 'all',
        tags: [],
        author: '',
        dateRange: {},
        sortBy: 'relevance'
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [aggregations, setAggregations] = useState({});

    /**
     * Perform search
     */
    const search = useCallback(async (query = searchQuery, page = 1) => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await searchApi.advancedSearch({
                query,
                type: filters.type,
                filters,
                page,
                limit: pagination.limit,
                sortBy: filters.sortBy
            });

            setResults(response.data.data.results);
            setPagination({
                page: response.data.data.page,
                limit: response.data.data.limit,
                total: response.data.data.total,
                totalPages: response.data.data.totalPages
            });
            setAggregations(response.data.data.aggregations || {});
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Search failed');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filters, pagination.limit]);

    /**
     * Get autocomplete suggestions
     */
    const getAutocomplete = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await searchApi.autocomplete(query, filters.type);
            setSuggestions(response.data.data.suggestions || []);
        } catch (error) {
            console.error('Autocomplete error:', error);
            setSuggestions([]);
        }
    }, [filters.type]);

    /**
     * Update search query
     */
    const updateQuery = useCallback((query) => {
        setSearchQuery(query);
        if (query.length >= 2) {
            getAutocomplete(query);
        } else {
            setSuggestions([]);
        }
    }, [getAutocomplete]);

    /**
     * Update filters
     */
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    /**
     * Clear filters
     */
    const clearFilters = useCallback(() => {
        setFilters({
            type: 'all',
            tags: [],
            author: '',
            dateRange: {},
            sortBy: 'relevance'
        });
    }, []);

    /**
     * Go to next page
     */
    const nextPage = useCallback(() => {
        if (pagination.page < pagination.totalPages) {
            search(searchQuery, pagination.page + 1);
        }
    }, [pagination, search, searchQuery]);

    /**
     * Go to previous page
     */
    const prevPage = useCallback(() => {
        if (pagination.page > 1) {
            search(searchQuery, pagination.page - 1);
        }
    }, [pagination, search, searchQuery]);

    /**
     * Go to specific page
     */
    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            search(searchQuery, page);
        }
    }, [pagination.totalPages, search, searchQuery]);

    /**
     * Clear search
     */
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setResults([]);
        setSuggestions([]);
        setPagination({
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
        });
    }, []);

    return {
        // State
        results,
        suggestions,
        loading,
        searchQuery,
        filters,
        pagination,
        aggregations,

        // Actions
        search,
        updateQuery,
        updateFilters,
        clearFilters,
        nextPage,
        prevPage,
        goToPage,
        clearSearch,
        getAutocomplete
    };
};

export default useSearch;
