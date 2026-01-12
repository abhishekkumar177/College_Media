/**
 * API Client - Centralized Axios Configuration
 * Issue #349: Enhanced API Error Handling and Retry Logic
 */

import axios from 'axios';
import axiosRetry from 'axios-retry';
import { ApiError, NetworkError, AuthenticationError, ValidationError } from '../utils/apiErrors';
import { showRetryNotification, showRetrySuccessNotification } from '../utils/apiErrorHandler';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token and logging
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`📤 [API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    // Add request timestamp for performance monitoring
    config.metadata = { startTime: Date.now() };

    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and logging
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = response.config?.metadata?.startTime
      ? Date.now() - response.config.metadata.startTime
      : 0;

    // Log response in development
    if (import.meta.env.DEV) {
      console.log(
        `✅ [API Response] ${response.config?.method?.toUpperCase()} ${response.config?.url} - ${duration}ms`
      );
    }

    // Return data directly (unwrap response)
    return response.data;
  },
  async (error) => {
    // Calculate request duration
    const duration = error.config?.metadata?.startTime
      ? Date.now() - error.config.metadata.startTime
      : 0;

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(
        `❌ [API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`,
        error.response?.status
      );
    }

    // Check for network errors or offline status
    // Status 0/undefined usually means network error/cors/offline
    if (!error.response && error.code !== 'ERR_CANCELED' && error.config) {
      // Import dynamically to avoid circular dependency issues at module level
      const { default: offlineQueue } = await import('../utils/offlineQueue');
      await offlineQueue.add(error.config);
    }

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          // Bad Request - Validation error
          throw new ValidationError(
            data?.message || 'Invalid request data',
            data?.errors || {}
          );

        case 401:
          // Unauthorized - Token expired or invalid
          localStorage.removeItem('token');
          window.dispatchEvent(new CustomEvent('auth:logout'));

          throw new AuthenticationError(
            data?.message || 'Authentication required. Please login again.'
          );

        case 403:
          // Forbidden - Insufficient permissions
          throw new ApiError(
            data?.message || 'You do not have permission to perform this action',
            status
          );

        case 404:
          // Not Found
          throw new ApiError(
            data?.message || 'The requested resource was not found',
            status
          );

        case 429:
          // Too Many Requests - Rate limited
          throw new ApiError(
            data?.message || 'Too many requests. Please try again later.',
            status
          );

        case 500:
          // Internal Server Error
          throw new ApiError(
            data?.message || 'Server error. Please try again later.',
            status
          );

        case 502:
        case 503:
        case 504:
          // Service Unavailable / Gateway errors
          throw new ApiError(
            data?.message || 'Service temporarily unavailable. Please try again.',
            status
          );

        default:
          throw new ApiError(
            data?.message || 'An unexpected error occurred',
            status
          );
      }
    } else if (error.request) {
      // Request made but no response received
      throw new NetworkError(
        'Network error. Request added to offline queue.'
      );
    } else {
      // Something else happened
      throw new ApiError(error.message || 'An unexpected error occurred');
    }
  }
);

// Configure retry logic with exponential backoff and user feedback
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or specific status codes
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.response?.status === 408 || // Request Timeout
      error.response?.status === 429 || // Too Many Requests
      error.response?.status === 500 || // Internal Server Error
      error.response?.status === 502 || // Bad Gateway
      error.response?.status === 503 || // Service Unavailable
      error.response?.status === 504    // Gateway Timeout
    );
  },
  onRetry: (retryCount, error, requestConfig) => {
    // Log retry attempt
    if (import.meta.env.DEV) {
      console.log(
        `🔄 Retry attempt ${retryCount}/3 for ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`
      );
    }

    // Show user-friendly retry notification
    showRetryNotification(retryCount, 3);

    // If this is the last retry and it succeeds, show success message
    if (retryCount === 3) {
      requestConfig.onRetrySuccess = true;
    }
  },
});

// Add response interceptor to show success after retry
const originalResponseInterceptor = apiClient.interceptors.response.handlers[0]?.fulfilled;
apiClient.interceptors.response.use(
  (response) => {
    // Show success notification if request succeeded after retry
    if (response?.config?.onRetrySuccess) {
      showRetrySuccessNotification();
    }
    return originalResponseInterceptor ? originalResponseInterceptor(response) : response;
  },
  apiClient.interceptors.response.handlers[0]?.rejected
);

export default apiClient;
