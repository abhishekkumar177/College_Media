/**
 * Centralized API Service
 * Axios instance with interceptors and retry logic
 */

import axios from 'axios';
import axiosRetry from 'axios-retry';
import API_CONFIG from './apiConfig';
import requestCache from '../utils/requestCache';

// Import interceptors
import { 
  authRequestInterceptor, 
  authRequestErrorInterceptor 
} from './interceptors/authInterceptor';

import { 
  errorResponseInterceptor, 
  errorResponseErrorInterceptor 
} from './interceptors/errorInterceptor';

import { 
  loggingRequestInterceptor,
  loggingResponseInterceptor,
  loggingErrorInterceptor
} from './interceptors/loggingInterceptor';

/**
 * Create Axios instance
 */
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

/**
 * Configure axios-retry
 */
axiosRetry(api, API_CONFIG.RETRY);

/**
 * Request Interceptors (executed in order)
 */

// 1. Logging interceptor
api.interceptors.request.use(
  loggingRequestInterceptor,
  loggingErrorInterceptor
);

// 2. Auth interceptor
api.interceptors.request.use(
  authRequestInterceptor,
  authRequestErrorInterceptor
);

// 3. Cache interceptor for GET requests
api.interceptors.request.use(
  (config) => {
    // Check cache for GET requests
    if (config.method === 'get') {
      const cachedResponse = requestCache.get(config);
      if (cachedResponse) {
        // Return cached response
        return Promise.reject({
          config,
          response: cachedResponse,
          isCached: true
        });
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptors (executed in reverse order)
 */

// 1. Cache interceptor for GET responses
api.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get') {
      requestCache.set(response.config, response);
    }
    return response;
  },
  (error) => {
    // Handle cached responses
    if (error.isCached) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  }
);

// 2. Logging interceptor
api.interceptors.response.use(
  loggingResponseInterceptor,
  loggingErrorInterceptor
);

// 3. Error handling interceptor
api.interceptors.response.use(
  errorResponseInterceptor,
  errorResponseErrorInterceptor
);

/**
 * Export API instance
 */
export default api;

/**
 * Export convenience methods
 */
export const apiGet = (url, config) => api.get(url, config);
export const apiPost = (url, data, config) => api.post(url, data, config);
export const apiPut = (url, data, config) => api.put(url, data, config);
export const apiPatch = (url, data, config) => api.patch(url, data, config);
export const apiDelete = (url, config) => api.delete(url, config);
