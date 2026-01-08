/**
 * Posts Data Fetching Hooks
 * Domain-specific hooks for posts operations
 */

import { useState, useCallback } from 'react';
import api from '../services/api';
import API_CONFIG from '../services/apiConfig';
import { useError } from './useError';
import requestCache from '../utils/requestCache';

/**
 * Hook for fetching all posts
 */
export const useFetchPosts = (options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useError();

  const fetchPosts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.POSTS.BASE, { params });
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      if (options.showError !== false) {
        showError(err.message || 'Failed to fetch posts');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, options.showError]);

  return { data, loading, error, fetchPosts };
};

/**
 * Hook for fetching single post
 */
export const useFetchPost = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useError();

  const fetchPost = useCallback(async (postId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.POSTS.BY_ID(postId));
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to fetch post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  return { data, loading, error, fetchPost };
};

/**
 * Hook for creating a post
 */
export const useCreatePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useError();

  const createPost = useCallback(async (postData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.POSTS.BASE, postData);
      
      // Invalidate posts cache
      requestCache.invalidate(API_CONFIG.ENDPOINTS.POSTS.BASE);
      
      showSuccess('Post created successfully!');
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to create post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  return { loading, error, createPost };
};

/**
 * Hook for updating a post
 */
export const useUpdatePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useError();

  const updatePost = useCallback(async (postId, postData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.POSTS.BY_ID(postId), postData);
      
      // Invalidate post cache
      requestCache.invalidate(API_CONFIG.ENDPOINTS.POSTS.BY_ID(postId));
      requestCache.invalidate(API_CONFIG.ENDPOINTS.POSTS.BASE);
      
      showSuccess('Post updated successfully!');
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to update post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  return { loading, error, updatePost };
};

/**
 * Hook for deleting a post
 */
export const useDeletePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useError();

  const deletePost = useCallback(async (postId) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(API_CONFIG.ENDPOINTS.POSTS.BY_ID(postId));
      
      // Invalidate cache
      requestCache.invalidate(API_CONFIG.ENDPOINTS.POSTS.BASE);
      
      showSuccess('Post deleted successfully!');
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to delete post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  return { loading, error, deletePost };
};

/**
 * Hook for liking a post
 */
export const useLikePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useError();

  const likePost = useCallback(async (postId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.POSTS.LIKE(postId));
      
      // Invalidate post cache
      requestCache.invalidate(API_CONFIG.ENDPOINTS.POSTS.BY_ID(postId));
      
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to like post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const unlikePost = useCallback(async (postId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.POSTS.UNLIKE(postId));
      
      // Invalidate post cache
      requestCache.invalidate(API_CONFIG.ENDPOINTS.POSTS.BY_ID(postId));
      
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to unlike post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  return { loading, error, likePost, unlikePost };
};
