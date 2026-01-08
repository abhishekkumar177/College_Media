/**
 * Authentication Interceptor
 * Automatically adds auth token to requests
 */

import { getToken } from '../../utils/tokenManager';

/**
 * Request interceptor to add auth token
 */
export const authRequestInterceptor = (config) => {
  const token = getToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
};

/**
 * Request error interceptor
 */
export const authRequestErrorInterceptor = (error) => {
  return Promise.reject(error);
};
