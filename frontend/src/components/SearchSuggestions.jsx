import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { removeFromSearchHistory, clearSearchHistory } from '../utils/searchHistory';
import { useState } from 'react';

const SearchSuggestions = ({ suggestions, loading, query, history, onSelect, onClose }) => {
  const [historyItems, setHistoryItems] = useState(history);

  const handleRemoveHistory = (item, e) => {
    e.stopPropagation();
    removeFromSearchHistory(item);
    setHistoryItems(prev => prev.filter(h => h !== item));
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistoryItems([]);
  };

  const getIcon = (type) => {
    const icons = {
      user: { icon: 'mdi:account', color: 'text-blue-500' },
      post: { icon: 'mdi:file-document', color: 'text-green-500' },
      tag: { icon: 'mdi:pound', color: 'text-purple-500' },
    };
    return icons[type] || icons.post;
  };

  return (
    <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-[500px] overflow-y-auto">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Icon icon="mdi:loading" width={32} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Search History */}
          {!query && historyItems.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Recent Searches
                </span>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear all
                </button>
              </div>
              {historyItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
                >
                  <Icon icon="mdi:history" width={20} className="text-gray-400" />
                  <span className="flex-1 text-gray-900 dark:text-gray-100">{item}</span>
                  <button
                    onClick={(e) => handleRemoveHistory(item, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Icon icon="mdi:close" width={16} />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {query && suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Suggestions
                </span>
              </div>
              {suggestions.map((suggestion) => {
                const iconData = getIcon(suggestion.type);
                return (
                  <button
                    key={suggestion.id}
                    onClick={() => onSelect(suggestion.query || suggestion.name)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className={`${iconData.color}`}>
                      <Icon icon={iconData.icon} width={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-gray-100 truncate">
                        {suggestion.name || suggestion.title}
                      </p>
                      {suggestion.subtitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {suggestion.subtitle}
                        </p>
                      )}
                    </div>
                    {suggestion.count && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestion.count} results
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {query && !loading && suggestions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Icon icon="mdi:magnify" width={48} className="text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-center">
                No suggestions found for "{query}"
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 text-center mt-1">
                Press Enter to search anyway
              </p>
            </div>
          )}

          {/* Empty State */}
          {!query && historyItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Icon icon="mdi:magnify" width={48} className="text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Start typing to search
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 text-center mt-1">
                Try searching for posts, users, or tags
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchSuggestions;
