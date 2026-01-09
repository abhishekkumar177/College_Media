/**
 * Search Highlight Utilities
 * Highlights search terms in text
 */

/**
 * Highlight search term in text
 * @param {string} text - Text to highlight
 * @param {string} query - Search query
 * @returns {string} HTML string with highlighted terms
 */
export const highlightText = (text, query) => {
  if (!query || !text) return text;

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">$1</mark>');
};

/**
 * Escape special regex characters
 * @param {string} str - String to escape
 * @returns {string}
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Get text excerpt with highlighted search term
 * @param {string} text - Full text
 * @param {string} query - Search query
 * @param {number} maxLength - Maximum excerpt length
 * @returns {string}
 */
export const getHighlightedExcerpt = (text, query, maxLength = 150) => {
  if (!text) return '';
  
  if (!query) {
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...'
      : text;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...'
      : text;
  }

  // Calculate start position to center the query
  const halfLength = Math.floor(maxLength / 2);
  let start = Math.max(0, index - halfLength);
  let end = Math.min(text.length, start + maxLength);

  // Adjust start if end is at text length
  if (end === text.length) {
    start = Math.max(0, end - maxLength);
  }

  let excerpt = text.substring(start, end);
  
  // Add ellipsis
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';

  return highlightText(excerpt, query);
};

/**
 * Highlight multiple terms in text
 * @param {string} text - Text to highlight
 * @param {Array<string>} queries - Array of search queries
 * @returns {string}
 */
export const highlightMultipleTerms = (text, queries) => {
  if (!queries || queries.length === 0 || !text) return text;

  let result = text;
  queries.forEach(query => {
    if (query) {
      result = highlightText(result, query);
    }
  });

  return result;
};

/**
 * Check if text matches search query (fuzzy matching)
 * @param {string} text - Text to check
 * @param {string} query - Search query
 * @returns {boolean}
 */
export const fuzzyMatch = (text, query) => {
  if (!text || !query) return false;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact match
  if (lowerText.includes(lowerQuery)) return true;

  // Fuzzy match - check if all characters in query appear in order
  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === lowerQuery.length;
};
