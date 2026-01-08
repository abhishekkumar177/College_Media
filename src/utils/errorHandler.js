/**
 * Centralized error handling utilities
 */

/**
 * Error types for categorization
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * User-friendly error messages
 */
const errorMessages = {
  [ErrorTypes.NETWORK]: 'Unable to connect. Please check your internet connection.',
  [ErrorTypes.VALIDATION]: 'Please check your input and try again.',
  [ErrorTypes.AUTHENTICATION]: 'Please log in to continue.',
  [ErrorTypes.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
  [ErrorTypes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorTypes.SERVER]: 'Something went wrong on our end. Please try again later.',
  [ErrorTypes.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Categorize error based on HTTP status code or error type
 */
export const categorizeError = (error) => {
  // Network errors
  if (!navigator.onLine) {
    return ErrorTypes.NETWORK;
  }

  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    return ErrorTypes.NETWORK;
  }

  // HTTP status code errors
  if (error.response) {
    const status = error.response.status;
    
    if (status === 400) return ErrorTypes.VALIDATION;
    if (status === 401) return ErrorTypes.AUTHENTICATION;
    if (status === 403) return ErrorTypes.AUTHORIZATION;
    if (status === 404) return ErrorTypes.NOT_FOUND;
    if (status >= 500) return ErrorTypes.SERVER;
  }

  return ErrorTypes.UNKNOWN;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error) => {
  // Use custom error message if provided
  if (error.message && !error.message.includes('fetch failed')) {
    return error.message;
  }

  // Use response error message if available
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Use categorized error message
  const errorType = categorizeError(error);
  return errorMessages[errorType];
};

/**
 * Log error to console in development and to service in production
 */
export const logError = (error, errorInfo = {}) => {
  if (import.meta.env.MODE === 'development') {
    console.error('Error occurred:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString()
    });
  }

  // In production, send to error reporting service
  if (import.meta.env.MODE === 'production' && window.errorReportingService) {
    window.errorReportingService.logError(error, errorInfo);
  }
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error) => {
  const errorType = categorizeError(error);
  
  // Retry network errors and server errors
  return errorType === ErrorTypes.NETWORK || errorType === ErrorTypes.SERVER;
};

/**
 * Format validation errors
 */
export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.join(', ');
  }

  if (typeof errors === 'object') {
    return Object.values(errors).flat().join(', ');
  }

  return String(errors);
};

/**
 * Create error object with consistent structure
 */
export const createError = (message, type = ErrorTypes.UNKNOWN, details = {}) => {
  return {
    message,
    type,
    details,
    timestamp: new Date().toISOString()
  };
};

/**
 * Handle API errors with retry logic
 */
export const withRetry = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries && isRetryableError(error)) {
        const waitTime = delay * Math.pow(backoff, attempt);
        
        if (onRetry) {
          onRetry(attempt + 1, waitTime);
        }

        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        break;
      }
    }
  }

  throw lastError;
};
