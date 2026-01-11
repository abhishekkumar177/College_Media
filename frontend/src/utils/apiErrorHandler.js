/**
 * API Error Handler Utility
 * Issue #349: Enhanced API Error Handling and Retry Logic
 * 
 * Provides centralized error handling with:
 * - User-friendly error messages
 * - Error categorization
 * - Retry feedback
 * - Offline detection
 */

import toast from 'react-hot-toast';
import {
  ApiError,
  NetworkError,
  AuthenticationError,
  ValidationError,
  TimeoutError,
  RateLimitError,
} from './apiErrors';

/**
 * Error message mappings for common HTTP status codes
 */
const ERROR_MESSAGES = {
  // Client Errors (4xx)
  400: 'Invalid request. Please check your input.',
  401: 'Session expired. Please login again.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'Request timeout. Please try again.',
  409: 'This action conflicts with existing data.',
  422: 'Unable to process your request. Please check the data.',
  429: 'Too many requests. Please slow down.',

  // Server Errors (5xx)
  500: 'Server error. Our team has been notified.',
  502: 'Service temporarily unavailable. Retrying...',
  503: 'Service under maintenance. Please try again later.',
  504: 'Gateway timeout. Please try again.',
};

/**
 * Get user-friendly error message based on error type and status
 * 
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyMessage = (error) => {
  // Network/Connection errors
  if (error instanceof NetworkError || error.code === 'ERR_NETWORK') {
    return '🔌 No internet connection. Please check your network.';
  }

  // Timeout errors
  if (error instanceof TimeoutError || error.code === 'ECONNABORTED') {
    return '⏱️ Request timed out. Please try again.';
  }

  // Authentication errors
  if (error instanceof AuthenticationError) {
    return '🔐 Please login to continue.';
  }

  // Validation errors
  if (error instanceof ValidationError) {
    return error.message || '⚠️ Please check your input and try again.';
  }

  // Rate limit errors
  if (error instanceof RateLimitError) {
    const retryAfter = error.retryAfter ? ` Try again in ${error.retryAfter}s.` : '';
    return `🚦 Too many requests.${retryAfter}`;
  }

  // API errors with status codes
  if (error instanceof ApiError && error.statusCode) {
    return ERROR_MESSAGES[error.statusCode] || error.message;
  }

  // HTTP status code errors
  if (error.response?.status) {
    return ERROR_MESSAGES[error.response.status] || 'An unexpected error occurred.';
  }

  // Generic error message
  return error.message || '❌ Something went wrong. Please try again.';
};

/**
 * Categorize error for analytics and logging
 * 
 * @param {Error} error - The error object
 * @returns {string} Error category
 */
export const categorizeError = (error) => {
  if (error instanceof NetworkError || error.code === 'ERR_NETWORK') {
    return 'network';
  }
  if (error instanceof AuthenticationError || error.response?.status === 401) {
    return 'authentication';
  }
  if (error instanceof ValidationError || error.response?.status === 400) {
    return 'validation';
  }
  if (error instanceof TimeoutError || error.code === 'ECONNABORTED') {
    return 'timeout';
  }
  if (error instanceof RateLimitError || error.response?.status === 429) {
    return 'rate_limit';
  }
  if (error.response?.status >= 500) {
    return 'server';
  }
  if (error.response?.status >= 400) {
    return 'client';
  }
  return 'unknown';
};

/**
 * Determine if error is retryable
 * 
 * @param {Error} error - The error object
 * @returns {boolean} Whether the error should be retried
 */
export const isRetryableError = (error) => {
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  const status = error.response?.status || error.statusCode;
  
  return (
    error instanceof NetworkError ||
    error instanceof TimeoutError ||
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED' ||
    retryableStatuses.includes(status)
  );
};

/**
 * Handle API error with toast notification
 * 
 * @param {Error} error - The error object
 * @param {Object} options - Toast options
 * @returns {void}
 */
export const handleApiError = (error, options = {}) => {
  const {
    showToast = true,
    duration = 4000,
    position = 'top-right',
    customMessage = null,
  } = options;

  const message = customMessage || getUserFriendlyMessage(error);
  const category = categorizeError(error);

  // Log error for debugging
  if (import.meta.env.DEV) {
    console.error('[API Error Handler]', {
      category,
      error,
      message,
    });
  }

  // Show toast notification
  if (showToast) {
    // Different toast styles based on error category
    switch (category) {
      case 'network':
        toast.error(message, {
          duration,
          position,
          icon: '🔌',
          style: {
            background: '#FEE2E2',
            color: '#991B1B',
          },
        });
        break;

      case 'authentication':
        toast.error(message, {
          duration,
          position,
          icon: '🔐',
        });
        break;

      case 'validation':
        toast.error(message, {
          duration,
          position,
          icon: '⚠️',
          style: {
            background: '#FEF3C7',
            color: '#92400E',
          },
        });
        break;

      case 'rate_limit':
        toast.error(message, {
          duration: 6000,
          position,
          icon: '🚦',
        });
        break;

      case 'server':
        toast.error(message, {
          duration,
          position,
          icon: '🔧',
        });
        break;

      default:
        toast.error(message, {
          duration,
          position,
        });
    }
  }

  return {
    message,
    category,
    isRetryable: isRetryableError(error),
  };
};

/**
 * Show retry notification
 * 
 * @param {number} retryCount - Current retry attempt
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {void}
 */
export const showRetryNotification = (retryCount, maxRetries) => {
  toast.loading(`Retrying... (${retryCount}/${maxRetries})`, {
    duration: 2000,
    position: 'bottom-right',
    icon: '🔄',
    style: {
      background: '#DBEAFE',
      color: '#1E40AF',
    },
  });
};

/**
 * Show success notification after retry
 * 
 * @returns {void}
 */
export const showRetrySuccessNotification = () => {
  toast.success('Connection restored!', {
    duration: 2000,
    position: 'bottom-right',
    icon: '✅',
  });
};

/**
 * Handle validation errors with field-specific messages
 * 
 * @param {ValidationError} error - Validation error object
 * @returns {Object} Field errors
 */
export const handleValidationErrors = (error) => {
  if (!(error instanceof ValidationError)) {
    return {};
  }

  const fieldErrors = {};
  
  if (error.errors && typeof error.errors === 'object') {
    Object.keys(error.errors).forEach((field) => {
      fieldErrors[field] = error.errors[field];
    });
  }

  return fieldErrors;
};

/**
 * Check if user is online
 * 
 * @returns {boolean} Online status
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Show offline notification
 * 
 * @returns {void}
 */
export const showOfflineNotification = () => {
  toast.error('You are offline. Please check your internet connection.', {
    duration: Infinity,
    position: 'bottom-center',
    icon: '📡',
    id: 'offline-notification',
    style: {
      background: '#FEE2E2',
      color: '#991B1B',
      fontWeight: 'bold',
    },
  });
};

/**
 * Dismiss offline notification
 * 
 * @returns {void}
 */
export const dismissOfflineNotification = () => {
  toast.dismiss('offline-notification');
  toast.success('Back online!', {
    duration: 2000,
    position: 'bottom-center',
    icon: '✅',
  });
};

export default {
  getUserFriendlyMessage,
  categorizeError,
  isRetryableError,
  handleApiError,
  showRetryNotification,
  showRetrySuccessNotification,
  handleValidationErrors,
  isOnline,
  showOfflineNotification,
  dismissOfflineNotification,
};
