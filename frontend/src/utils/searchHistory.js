/**
 * Search History Utilities
 * Manages search history in localStorage
 */

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Get search history from localStorage
 * @returns {Array<string>} Array of recent search queries
 */
export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to load search history:', error);
    return [];
  }
};

/**
 * Add a search query to history
 * @param {string} query - Search query to add
 */
export const addToSearchHistory = (query) => {
  if (!query || !query.trim()) return;

  try {
    let history = getSearchHistory();
    
    // Remove duplicate if exists
    history = history.filter(item => item !== query);
    
    // Add to beginning
    history.unshift(query);
    
    // Keep only MAX_HISTORY_ITEMS
    history = history.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
};

/**
 * Remove a specific query from history
 * @param {string} query - Query to remove
 */
export const removeFromSearchHistory = (query) => {
  try {
    let history = getSearchHistory();
    history = history.filter(item => item !== query);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to remove from search history:', error);
  }
};

/**
 * Clear all search history
 */
export const clearSearchHistory = () => {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
};

/**
 * Check if a query exists in history
 * @param {string} query - Query to check
 * @returns {boolean}
 */
export const isInSearchHistory = (query) => {
  const history = getSearchHistory();
  return history.includes(query);
};
