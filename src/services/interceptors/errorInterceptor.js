/**
 * Error Interceptor
 * Handles API errors globally
 */

import { clearTokens } from '../../utils/tokenManager';
import { normalizeError } from '../../utils/apiHelpers';

/**
 * Response success interceptor
 */
export const errorResponseInterceptor = (response) => {
  return response;
};

/**
 * Response error interceptor
 */
export const errorResponseErrorInterceptor = (error) => {
  const normalizedError = normalizeError(error);
  
  // Handle authentication errors
  if (error.response?.status === 401) {
    clearTokens();
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  
  // Handle forbidden errors
  if (error.response?.status === 403) {
    console.error('Access forbidden:', normalizedError.message);
  }
  
  // Log error in development
  if (import.meta.env.MODE === 'development') {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: normalizedError.status,
      message: normalizedError.message,
      data: normalizedError.data
    });
  }
  
  return Promise.reject(normalizedError);
};
