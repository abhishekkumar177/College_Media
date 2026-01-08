/**
 * Users Data Fetching Hooks
 * Domain-specific hooks for user operations
 */

import { useState, useCallback } from 'react';
import api from '../services/api';
import API_CONFIG from '../services/apiConfig';
import { useError } from './useError';
import requestCache from '../utils/requestCache';

/**
 * Hook for fetching user by ID
 */
export const useFetchUser = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useError();

  const fetchUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.USERS.BY_ID(userId));
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to fetch user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  return { data, loading, error, fetchUser };
};

/**
 * Hook for fetching user profile
 */
export const useFetchUserProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useError();

  const fetchProfile = useCallback(async (username) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.USERS.PROFILE(username));
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  return { data, loading, error, fetchProfile };
};

/**
 * Hook for updating user profile
 */
export const useUpdateProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useError();

  const updateProfile = useCallback(async (userId, profileData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.USERS.BY_ID(userId), profileData);
      
      // Invalidate user cache
      requestCache.invalidate(API_CONFIG.ENDPOINTS.USERS.BY_ID(userId));
      
      showSuccess('Profile updated successfully!');
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  return { loading, error, updateProfile };
};

/**
 * Hook for following/unfollowing users
 */
export const useFollowUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useError();

  const followUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.USERS.FOLLOW(userId));
      
      // Invalidate user cache
      requestCache.invalidate(API_CONFIG.ENDPOINTS.USERS.BY_ID(userId));
      
      showSuccess('User followed successfully!');
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to follow user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  const unfollowUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.USERS.UNFOLLOW(userId));
      
      // Invalidate user cache
      requestCache.invalidate(API_CONFIG.ENDPOINTS.USERS.BY_ID(userId));
      
      showSuccess('User unfollowed successfully!');
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to unfollow user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  return { loading, error, followUser, unfollowUser };
};

/**
 * Hook for searching users
 */
export const useSearchUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useError();

  const searchUsers = useCallback(async (query, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.USERS.BASE, {
        params: { q: query, ...params }
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to search users');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  return { data, loading, error, searchUsers };
};
