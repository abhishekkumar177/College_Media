/**
 * Utility functions for sharing and copying links
 */

/**
 * Copies text to clipboard using the modern Clipboard API
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Generates a shareable URL for a post
 * @param {Object} post - The post object
 * @param {string} post.id - The post ID
 * @returns {string} - The shareable URL
 */
export const generatePostUrl = (post) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/post/${post.id}`;
};

/**
 * Copies a post link to clipboard and shows appropriate feedback
 * @param {Object} post - The post object
 * @param {Function} onSuccess - Callback for successful copy
 * @param {Function} onError - Callback for copy failure
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const copyPostLink = async (post, onSuccess, onError) => {
  const url = generatePostUrl(post);

  const success = await copyToClipboard(url);

  if (success) {
    onSuccess?.(post.id);
  } else {
    onError?.();
  }

  return success;
};

/**
 * Checks if the Clipboard API is supported
 * @returns {boolean} - True if supported, false otherwise
 */
export const isClipboardSupported = () => {
  return typeof navigator !== 'undefined' && 'clipboard' in navigator;
};

/**
 * Fallback method for copying to clipboard (for older browsers)
 * @param {string} text - The text to copy
 * @returns {boolean} - True if successful, false otherwise
 */
export const fallbackCopyToClipboard = (text) => {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    return successful;
  } catch (error) {
    console.error('Fallback copy failed:', error);
    return false;
  }
};