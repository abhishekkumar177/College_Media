import { useState, useEffect, useCallback } from 'react';

interface SearchResult {
  _id: string;
  type: 'post' | 'user' | 'event';
  [key: string]: any;
}

interface UseGlobalSearchReturn {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalResults: number;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useGlobalSearch = (
  query: string,
  filters: string = '',
  page: number = 1,
  limit: number = 20
): UseGlobalSearchReturn => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      setHasMore(false);
      setTotalResults(0);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query string
        const params = new URLSearchParams({
          q: query.trim(),
          ...(filters && { filters }),
          page: page.toString(),
          limit: limit.toString()
        });

        const response = await fetch(`${API_BASE_URL}/search/advanced?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('authToken') && {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            })
          }
        });

        if (!response.ok) {
          throw new Error(`Search failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Search failed');
        }

        const searchResults = data.data.results || [];
        const total = data.data.totalResults || searchResults.length;
        const pageCount = Math.ceil(total / limit);

        // Append results for pagination (unless it's the first page)
        if (page === 1) {
          setResults(searchResults);
        } else {
          setResults(prev => [...prev, ...searchResults]);
        }

        setTotalResults(total);
        setHasMore(page < pageCount);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while searching';
        setError(errorMessage);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, filters, page, limit]);

  return {
    results,
    loading,
    error,
    hasMore,
    totalResults
  };
};

export default useGlobalSearch;
