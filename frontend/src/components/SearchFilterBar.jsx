import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchFilterBar = ({ 
  searchQuery, 
  onSearchChange, 
  sortBy, 
  onSortChange,
  filterType,
  onFilterChange,
  onClearFilters 
}) => {
  const hasActiveFilters = searchQuery || sortBy !== "newest" || filterType !== "all";

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Search Input */}
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search posts by text, username..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Sort By */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostLiked">Most Liked</option>
            <option value="mostCommented">Most Commented</option>
          </select>
        </div>

        {/* Filter Type */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Posts</option>
            <option value="liked">Liked Posts</option>
            <option value="recent">Recent (24h)</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="ml-auto flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <FaTimes />
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Search/Filter Info */}
      {searchQuery && (
        <div className="mt-3 text-sm text-gray-600">
          Searching for: <span className="font-semibold">"{searchQuery}"</span>
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
