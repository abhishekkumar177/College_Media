import React from 'react';
import { useSearch } from '../contexts/SearchContext';

/**
 * SearchResults Component - Displays search results with filtering and pagination
 * Shows posts, users, and hashtags with highlighting and interactive elements
 *
 * @component
 * @returns {React.ReactElement} Search results display
 */
const SearchResults = () => {
  const {
    searchQuery,
    searchFilter,
    searchResults,
    isSearching,
    currentPage,
    resultsPerPage,
    setCurrentPage
  } = useSearch();

  // ============= LOADING STATE =============

  if (isSearching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          <span className="text-gray-600">Searching...</span>
        </div>
      </div>
    );
  }

  // ============= NO RESULTS STATE =============

  if (!searchQuery || searchResults.total === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchQuery ? 'No results found' : 'Start searching'}
        </h3>
        <p className="text-gray-500">
          {searchQuery
            ? `Try adjusting your search terms or filters for "${searchQuery}"`
            : 'Search for posts, users, or hashtags'
          }
        </p>
      </div>
    );
  }

  // ============= HIGHLIGHT TEXT FUNCTION =============

  /**
   * Highlight matching text in search results
   * @param {string} text - Text to highlight
   * @param {string} query - Search query
   * @returns {React.ReactElement} Highlighted text
   */
  const highlightText = (text, query) => {
    if (!query) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // ============= PAGINATION LOGIC =============

  const getPaginatedResults = (items) => {
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(searchResults.total / resultsPerPage);

  // ============= RENDER RESULTS =============

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Search Results for "{searchQuery}"
        </h2>
        <span className="text-sm text-gray-500">
          {searchResults.total} results
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All', count: searchResults.total },
          { key: 'posts', label: 'Posts', count: searchResults.posts.length },
          { key: 'users', label: 'Users', count: searchResults.users.length },
          { key: 'hashtags', label: 'Hashtags', count: searchResults.hashtags.length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setCurrentPage(1)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              searchFilter === key
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Results Content */}
      <div className="space-y-6">
        {/* Posts Results */}
        {(searchFilter === 'all' || searchFilter === 'posts') && searchResults.posts.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📝</span>
              Posts ({searchResults.posts.length})
            </h3>
            <div className="space-y-4">
              {getPaginatedResults(searchResults.posts).map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start space-x-3">
                    <img
                      src={post.user.avatar}
                      alt={post.user.username}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {highlightText(post.user.username, searchQuery)}
                        </span>
                        <span className="text-gray-500 text-sm">•</span>
                        <span className="text-gray-500 text-sm">
                          {post.likes} likes • {post.comments} comments
                        </span>
                      </div>
                      <p className="text-gray-800 mb-2">
                        {highlightText(post.caption, searchQuery)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors duration-200 cursor-pointer"
                          >
                            {highlightText(tag, searchQuery)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <img
                        src={post.media}
                        alt="Post media"
                        className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity duration-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Results */}
        {(searchFilter === 'all' || searchFilter === 'users') && searchResults.users.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="mr-2">👥</span>
              Users ({searchResults.users.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getPaginatedResults(searchResults.users).map((user) => (
                <div key={user.username} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {highlightText(user.username, searchQuery)}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        {user.followers.toLocaleString()} followers
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-full hover:bg-blue-600 transition-colors duration-200">
                      Follow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hashtags Results */}
        {(searchFilter === 'all' || searchFilter === 'hashtags') && searchResults.hashtags.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="mr-2">#</span>
              Hashtags ({searchResults.hashtags.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {getPaginatedResults(searchResults.hashtags).map((hashtag) => (
                <div key={hashtag.tag} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200 text-center">
                  <div className="text-lg font-bold text-purple-600 mb-1">
                    {highlightText(hashtag.tag, searchQuery)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {hashtag.useCount.toLocaleString()} posts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
                currentPage === page
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
