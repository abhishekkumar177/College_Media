/**
 * Authentication Hooks
 * Domain-specific hooks for authentication operations
 */

import { useState, useCallback } from 'react';
import api from '../services/api';
import API_CONFIG from '../services/apiConfig';
import { setToken, setRefreshToken, clearTokens, getUserFromToken } from '../utils/tokenManager';
import { useError } from './useError';

/**
 * Hook for user login
 */
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useError();

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
      const { token, refreshToken, user } = response.data;

      // Store tokens
      setToken(token);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      showSuccess(`Welcome back, ${user.username}!`);
      return { token, user };
    } catch (err) {
      setError(err);
      showError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  return { loading, error, login };
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useError();

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
      const { token, refreshToken, user } = response.data;

      // Store tokens
      setToken(token);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      showSuccess('Account created successfully!');
      return { token, user };
    } catch (err) {
      setError(err);
      showError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  return { loading, error, register };
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const { showSuccess } = useError();

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      // Call logout endpoint
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear tokens regardless of API call success
      clearTokens();
      showSuccess('Logged out successfully');
      setLoading(false);
      
      // Redirect to login
      window.location.href = '/login';
    }
  }, [showSuccess]);

  return { loading, logout };
};

/**
 * Hook for fetching current user
 */
export const useFetchCurrentUser = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useError();

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      
      // If unauthorized, clear tokens
      if (err.status === 401) {
        clearTokens();
      } else {
        showError('Failed to fetch user profile');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Get user from token without API call
  const getUserFromLocalToken = useCallback(() => {
    return getUserFromToken();
  }, []);

  return { data, loading, error, fetchCurrentUser, getUserFromLocalToken };
};

/**
 * Hook for refreshing auth token
 */
export const useRefreshToken = () => {
  const [loading, setLoading] = useState(false);

  const refreshToken = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH);
      const { token, refreshToken: newRefreshToken } = response.data;

      setToken(token);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      return token;
    } catch (err) {
      clearTokens();
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, refreshToken };
};
