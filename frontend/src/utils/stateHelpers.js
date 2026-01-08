/**
 * State Helper Utilities
 * Helper functions for state management
 */

const STORAGE_KEYS = {
  AUTH: "college_media_auth",
  THEME: "college_media_theme",
  UI_PREFERENCES: "college_media_ui_prefs",
};

// ============================================
// AUTH STORAGE HELPERS
// ============================================

/**
 * Get stored auth data from localStorage
 * @returns {Object|null} Stored auth data or null
 */
export const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error reading auth from storage:", error);
    return null;
  }
};

/**
 * Set auth data in localStorage
 * @param {Object} authData - Auth data to store
 */
export const setStoredAuth = (authData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData));
  } catch (error) {
    console.error("Error storing auth data:", error);
  }
};

/**
 * Clear auth data from localStorage
 */
export const clearStoredAuth = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

// ============================================
// THEME STORAGE HELPERS
// ============================================

/**
 * Get stored theme from localStorage
 * @returns {string|null} Stored theme or null
 */
export const getStoredTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME);
  } catch (error) {
    console.error("Error reading theme from storage:", error);
    return null;
  }
};

/**
 * Set theme in localStorage
 * @param {string} theme - Theme to store
 */
export const setStoredTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error("Error storing theme:", error);
  }
};

// ============================================
// UI PREFERENCES HELPERS
// ============================================

/**
 * Get stored UI preferences from localStorage
 * @returns {Object|null} Stored preferences or null
 */
export const getStoredUIPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.UI_PREFERENCES);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error reading UI preferences from storage:", error);
    return null;
  }
};

/**
 * Set UI preferences in localStorage
 * @param {Object} preferences - Preferences to store
 */
export const setStoredUIPreferences = (preferences) => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.UI_PREFERENCES,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error("Error storing UI preferences:", error);
  }
};

// ============================================
// STATE VALIDATORS
// ============================================

/**
 * Validate user object
 * @param {Object} user - User object to validate
 * @returns {boolean} Whether user is valid
 */
export const isValidUser = (user) => {
  return (
    user && typeof user === "object" && user.id && user.username && user.email
  );
};

/**
 * Validate post object
 * @param {Object} post - Post object to validate
 * @returns {boolean} Whether post is valid
 */
export const isValidPost = (post) => {
  return post && typeof post === "object" && post.id && post.content;
};

/**
 * Validate token
 * @param {string} token - Token to validate
 * @returns {boolean} Whether token is valid
 */
export const isValidToken = (token) => {
  return typeof token === "string" && token.length > 0;
};

// ============================================
// STATE NORMALIZERS
// ============================================

/**
 * Normalize user object
 * @param {Object} user - User object to normalize
 * @returns {Object} Normalized user
 */
export const normalizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id || user._id,
    username: user.username || "",
    email: user.email || "",
    fullName: user.fullName || user.full_name || "",
    avatar: user.avatar || user.profilePicture || null,
    bio: user.bio || "",
    followers: user.followers || 0,
    following: user.following || 0,
    createdAt: user.createdAt || user.created_at || new Date().toISOString(),
  };
};

/**
 * Normalize post object
 * @param {Object} post - Post object to normalize
 * @returns {Object} Normalized post
 */
export const normalizePost = (post) => {
  if (!post) return null;

  return {
    id: post.id || post._id,
    content: post.content || "",
    author: normalizeUser(post.author || post.user),
    likes: post.likes || post.likeCount || 0,
    comments: post.comments || [],
    commentCount: post.commentCount || post.comments?.length || 0,
    isLiked: post.isLiked || false,
    createdAt: post.createdAt || post.created_at || new Date().toISOString(),
    updatedAt: post.updatedAt || post.updated_at || new Date().toISOString(),
  };
};

/**
 * Normalize posts array
 * @param {Array} posts - Posts array to normalize
 * @returns {Array} Normalized posts array
 */
export const normalizePosts = (posts) => {
  if (!Array.isArray(posts)) return [];
  return posts.map(normalizePost).filter(Boolean);
};

// ============================================
// STATE RESET UTILITIES
// ============================================

/**
 * Clear all app state from localStorage
 */
export const clearAllStoredState = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Error clearing stored state:", error);
  }
};

/**
 * Reset state on logout
 */
export const resetStateOnLogout = () => {
  clearStoredAuth();
  // Keep theme preference
  // Can clear other state as needed
};

// ============================================
// UTILITY HELPERS
// ============================================

/**
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error("Error deep cloning object:", error);
    return obj;
  }
};

/**
 * Check if localStorage is available
 * @returns {boolean} Whether localStorage is available
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safely get from localStorage with fallback
 * @param {string} key - Storage key
 * @param {any} fallback - Fallback value
 * @returns {any} Stored value or fallback
 */
export const safeGetItem = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error getting item ${key}:`, error);
    return fallback;
  }
};

/**
 * Safely set to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} Success status
 */
export const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item ${key}:`, error);
    return false;
  }
};
