import { Icon } from '@iconify/react';

const SearchFilters = ({ filters, onFilterChange }) => {
  const filterTypes = [
    { value: 'all', label: 'All', icon: 'mdi:view-grid' },
    { value: 'posts', label: 'Posts', icon: 'mdi:file-document' },
    { value: 'users', label: 'Users', icon: 'mdi:account' },
    { value: 'comments', label: 'Comments', icon: 'mdi:comment' },
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: 'mdi:star' },
    { value: 'recent', label: 'Most Recent', icon: 'mdi:clock' },
    { value: 'popular', label: 'Most Popular', icon: 'mdi:fire' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6">
      <div className="space-y-4">
        {/* Type Filters */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Filter by Type
          </label>
          <div className="flex flex-wrap gap-2">
            {filterTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => onFilterChange({ type: type.value })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filters.type === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon icon={type.icon} width={18} />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ dateRange: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((sort) => (
              <button
                key={sort.value}
                onClick={() => onFilterChange({ sortBy: sort.value })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filters.sortBy === sort.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon icon={sort.icon} width={18} />
                {sort.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
