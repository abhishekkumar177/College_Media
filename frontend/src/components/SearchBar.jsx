import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
// import { useDebounce } from '../hooks/useDebounce'; // We are using this, but let's make sure it's the efficient one or if we should use the new utility?
// Actually, let's explicitely import the debounce utility and wrap the fetch if we werent using the hook.
// But the Hook is the React-way.
import { useDebounce } from '../hooks/useDebounce';
import { searchApi } from '../api/endpoints';
import { addToSearchHistory, getSearchHistory } from '../utils/searchHistory';
import SearchSuggestions from './SearchSuggestions';
import useVoiceSearch from '../hooks/useVoiceSearch';
import AdvancedSearchFilters from './AdvancedSearchFilters';
import toast from 'react-hot-toast';

const SearchBar = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Optimized: Increased debounce delay slightly to 400ms for better performance
  const debouncedQuery = useDebounce(query, 400);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Voice search integration
  const {
    isListening,
    transcript,
    error: voiceError,
    isSupported,
    startListening,
    stopListening
  } = useVoiceSearch({
    onResult: (text) => {
      setQuery(text);
      setIsOpen(true);
    },
    onEnd: () => {
      // Auto-search when voice input ends
      if (transcript.trim()) {
        handleSearch(transcript);
      }
    }
  });

  // Show voice error as toast
  useEffect(() => {
    if (voiceError) {
      toast.error(voiceError);
    }
  }, [voiceError]);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);
  // ...

  const fetchSuggestions = async (searchQuery) => {
    setLoading(true);
    try {
      const results = await searchApi.getSuggestions(searchQuery);
      setSuggestions(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;

    addToSearchHistory(searchQuery);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    searchRef.current?.focus();
  };

  // Keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Icon
            icon="mdi:magnify"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            width={20}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search posts, users, tags... (Ctrl+K)"
            className="w-full pl-10 pr-24 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            aria-label="Search"
            autoComplete="off"
          />

          {/* Action Buttons Container */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Voice Search Button */}
            {isSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`p-1.5 rounded-full transition-colors ${isListening
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
                    : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
                title={isListening ? 'Listening...' : 'Voice search'}
              >
                <Icon
                  icon={isListening ? 'mdi:microphone' : 'mdi:microphone-outline'}
                  width={20}
                />
              </button>
            )}

            {/* Filter Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-full transition-colors ${showFilters
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              aria-label="Advanced filters"
              title="Advanced filters"
            >
              <Icon icon="mdi:filter-variant" width={20} />
            </button>

            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Clear search"
              >
                <Icon icon="mdi:close" width={20} />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Advanced Filters Dropdown */}
      {showFilters && (
        <AdvancedSearchFilters
          onFilterChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {isOpen && (query || suggestions.length > 0 || getSearchHistory().length > 0) && (
        <SearchSuggestions
          suggestions={suggestions}
          loading={loading}
          query={query}
          history={getSearchHistory()}
          onSelect={handleSearch}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;
