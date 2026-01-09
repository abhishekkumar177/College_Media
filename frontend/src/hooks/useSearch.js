import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { searchApi } from '../api/endpoints';
import { addToSearchHistory, getSearchHistory } from '../utils/searchHistory';

/**
 * Custom hook for managing search functionality
 * Handles debouncing, suggestions, history, and results
 */
export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all', // all, posts, users, comments
    dateRange: 'all', // all, today, week, month, year
    sortBy: 'relevance', // relevance, recent, popular
  });
  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions for auto-complete
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const data = await searchApi.getSuggestions(searchQuery);
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  // Fetch search results
  const fetchResults = useCallback(async (searchQuery, searchFilters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await searchApi.search(searchQuery, searchFilters);
      setResults(data);
      addToSearchHistory(searchQuery);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, fetchSuggestions]);

  // Execute search
  const executeSearch = useCallback((searchQuery = query) => {
    fetchResults(searchQuery, filters);
  }, [query, filters, fetchResults]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setResults([]);
  }, []);

  // Get search history
  const history = getSearchHistory();

  return {
    query,
    setQuery,
    suggestions,
    results,
    loading,
    filters,
    updateFilters,
    executeSearch,
    clearSearch,
    history,
  };
};

export default useSearch;
