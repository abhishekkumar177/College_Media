/**
 * API Configuration
 * Centralized configuration for API base URLs and settings
 */

const API_CONFIG = {
  // Base URLs for different environments
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000, // 30 seconds
  
  // API version
  VERSION: 'v1',
  
  // Endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
    },
    
    // Posts endpoints
    POSTS: {
      BASE: '/posts',
      BY_ID: (id) => `/posts/${id}`,
      LIKE: (id) => `/posts/${id}/like`,
      UNLIKE: (id) => `/posts/${id}/unlike`,
      COMMENTS: (id) => `/posts/${id}/comments`,
    },
    
    // Users endpoints
    USERS: {
      BASE: '/users',
      BY_ID: (id) => `/users/${id}`,
      PROFILE: (username) => `/users/${username}/profile`,
      FOLLOW: (id) => `/users/${id}/follow`,
      UNFOLLOW: (id) => `/users/${id}/unfollow`,
    },
    
    // Comments endpoints
    COMMENTS: {
      BASE: '/comments',
      BY_ID: (id) => `/comments/${id}`,
      LIKE: (id) => `/comments/${id}/like`,
      UNLIKE: (id) => `/comments/${id}/unlike`,
    },
  },
  
  // Request headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Retry configuration
  RETRY: {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 1000,
    retryCondition: (error) => {
      return error.code === 'ECONNABORTED' || 
             error.code === 'ERR_NETWORK' ||
             (error.response && error.response.status >= 500);
    },
  },
  
  // Cache configuration
  CACHE: {
    ENABLED: true,
    TTL: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 100, // Maximum cached requests
  },
};

export default API_CONFIG;
