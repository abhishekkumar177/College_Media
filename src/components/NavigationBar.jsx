import React from 'react';

/**
 * NavigationBar Component
 *
 * The main navigation bar at the top of the application, containing the app logo,
 * search functionality, and user profile button.
 *
 * @param {Object} props
 * @param {string} props.searchQuery - Current search query value
 * @param {function} props.onSearchChange - Handler for search input changes
 * @returns {React.ReactElement} Navigation bar JSX
 */
const NavigationBar = ({ searchQuery, onSearchChange }) => {
  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.target.blur();
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <button
              className="w-24 h-8 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
              aria-label="InstaClone home"
              onClick={() => window.location.href = '/'}
            >
              <span className="text-white font-bold text-xl">InstaClone</span>
            </button>
          </div>

          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <label htmlFor="search-input" className="sr-only">Search for users, posts, or hashtags</label>
              <input
                id="search-input"
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all duration-300"
                aria-describedby="search-icon"
                role="searchbox"
                aria-label="Search input"
              />
              <svg
                id="search-icon"
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => {/* TODO: Implement create post */}}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-medium hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
              aria-label="Create new post"
            >
              Create Post
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              aria-label="User profile menu"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
