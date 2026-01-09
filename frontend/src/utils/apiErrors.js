/**
 * API Error Classes
 * Issue #250: Custom error handling
 */

export class ApiError extends Error {
  constructor(message, statusCode = null, data = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      data: this.data,
      timestamp: this.timestamp,
    };
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', errors = {}) {
    super(message, 400, errors);
    this.name = 'ValidationError';
    this.errors = errors;
  }

  getFieldError(fieldName) {
    return this.errors[fieldName] || null;
  }

  hasFieldError(fieldName) {
    return !!this.errors[fieldName];
  }
}

export class TimeoutError extends ApiError {
  constructor(message = 'Request timeout') {
    super(message, 408);
    this.name = 'TimeoutError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Rate limit exceeded', retryAfter = null) {
    super(message, 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof AuthenticationError) {
    return 'Please login to continue';
  }

  if (error instanceof NetworkError) {
    return 'Connection failed. Check your internet.';
  }

  if (error instanceof RateLimitError) {
    return `Too many requests. Try again ${error.retryAfter ? `in ${error.retryAfter}s` : 'later'}.`;
  }

  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

/**
 * Log error to external service (production)
 */
export const logError = (error, context = {}) => {
  if (import.meta.env.PROD) {
    // TODO: Send to error logging service (Sentry, LogRocket, etc.)
    console.error('[Error Logging]', {
      error: error.toJSON ? error.toJSON() : error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  } else {
    console.error('[Dev Error]', error, context);
  }
};
