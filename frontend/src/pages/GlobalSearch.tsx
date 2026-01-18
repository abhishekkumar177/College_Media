import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchFilters from '../components/search/SearchFilters';
import ResultItem from '../components/search/ResultItem';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import './GlobalSearch.css';

interface SearchResult {
  _id: string;
  type: 'post' | 'user' | 'event';
  title?: string;
  caption?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  location?: string;
  createdAt?: string;
  author?: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  creator?: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  profilePicture?: string;
  verified?: boolean;
  score?: number;
}

const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialFilters = searchParams.get('filters') || '';

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { results, loading, error, hasMore, totalResults } = useGlobalSearch(
    query,
    filters,
    page,
    limit
  );

  const handleSearch = useCallback((q: string, f?: string) => {
    setQuery(q);
    if (f !== undefined) setFilters(f);
    setPage(1);
    navigate(`?q=${encodeURIComponent(q)}${f ? `&filters=${encodeURIComponent(f)}` : ''}`);
  }, [navigate]);

  const handleFilterChange = useCallback((newFilters: string) => {
    setFilters(newFilters);
    setPage(1);
    navigate(`?q=${encodeURIComponent(query)}${newFilters ? `&filters=${encodeURIComponent(newFilters)}` : ''}`);
  }, [query, navigate]);

  const handleLoadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const groupedResults = useMemo(() => {
    const grouped: Record<string, SearchResult[]> = {
      post: [],
      user: [],
      event: []
    };
    results.forEach((result: SearchResult) => {
      if (grouped[result.type]) {
        grouped[result.type].push(result);
      }
    });
    return grouped;
  }, [results]);

  return (
    <div className="global-search">
      <div className="search-container">
        <div className="search-header">
          <h1>Search Everything</h1>
          <p className="search-subtitle">Posts, users, and events in one place</p>
        </div>

        <div className="search-bar-wrapper">
          <input
            type="text"
            className="search-bar"
            placeholder="Search posts, people, events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                handleSearch(query, filters);
              }
            }}
          />
          <button
            className="search-button"
            onClick={() => query.trim() && handleSearch(query, filters)}
            disabled={!query.trim()}
          >
            <span>🔍</span> Search
          </button>
        </div>

        <div className="search-tips">
          <p>💡 Tips: Use filters like "type:post", "date:last_week", "role:moderator", "verified:true"</p>
        </div>
      </div>

      <div className="search-content">
        <aside className="filters-sidebar">
          <SearchFilters
            currentFilters={filters}
            onFiltersChange={handleFilterChange}
          />
        </aside>

        <main className="search-results">
          {!query.trim() && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h2>Start searching</h2>
              <p>Enter a query to find posts, users, or events</p>
            </div>
          )}

          {query.trim() && loading && results.length === 0 && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Searching...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>❌ {error}</p>
            </div>
          )}

          {query.trim() && !loading && results.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔎</div>
              <h2>No results found</h2>
              <p>Try different keywords or adjust your filters</p>
            </div>
          )}

          {query.trim() && results.length > 0 && (
            <>
              <div className="results-header">
                <h2>Results ({totalResults} found)</h2>
              </div>

              {groupedResults.post.length > 0 && (
                <div className="result-group">
                  <h3 className="group-title">
                    <span className="group-icon">📝</span>
                    Posts ({groupedResults.post.length})
                  </h3>
                  <div className="result-items">
                    {groupedResults.post.map((result) => (
                      <ResultItem key={result._id} result={result} />
                    ))}
                  </div>
                </div>
              )}

              {groupedResults.user.length > 0 && (
                <div className="result-group">
                  <h3 className="group-title">
                    <span className="group-icon">👤</span>
                    Users ({groupedResults.user.length})
                  </h3>
                  <div className="result-items">
                    {groupedResults.user.map((result) => (
                      <ResultItem key={result._id} result={result} />
                    ))}
                  </div>
                </div>
              )}

              {groupedResults.event.length > 0 && (
                <div className="result-group">
                  <h3 className="group-title">
                    <span className="group-icon">📅</span>
                    Events ({groupedResults.event.length})
                  </h3>
                  <div className="result-items">
                    {groupedResults.event.map((result) => (
                      <ResultItem key={result._id} result={result} />
                    ))}
                  </div>
                </div>
              )}

              {hasMore && (
                <div className="load-more">
                  <button
                    className="load-more-button"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More Results'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default GlobalSearch;
