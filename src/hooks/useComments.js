/**
 * Comments Data Fetching Hooks
 * Domain-specific hooks for comment operations
 */

import { useState, useCallback } from 'react';
import api from '../services/api';
import API_CONFIG from '../services/apiConfig';
import { useError } from './useError';
import requestCache from '../utils/requestCache';

/**
 * Hook for fetching comments for a post
 */
export const useFetchComments = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useError();

  const fetchComments = useCallback(async (postId, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.POSTS.COMMENTS(postId), { params });
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to fetch comments');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  return { data, loading, error, fetchComments };
};

/**
 * Hook for creating a comment
 */
export const useCreateComment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useError();

  const createComment = useCallback(async (postId, commentData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.POSTS.COMMENTS(postId), commentData);
      
      // Invalidate comments cache
      requestCache.invalidate(API_CONFIG.ENDPOINTS.POSTS.COMMENTS(postId));
      
      showSuccess('Comment added!');
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to add comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  return { loading, error, createComment };
};

/**
 * Hook for updating a comment
 */
export const useUpdateComment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useError();

  const updateComment = useCallback(async (commentId, commentData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.COMMENTS.BY_ID(commentId), commentData);
      
      // Invalidate comments cache
      requestCache.invalidate('/posts/');
      
      showSuccess('Comment updated!');
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to update comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  return { loading, error, updateComment };
};

/**
 * Hook for deleting a comment
 */
export const useDeleteComment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useError();

  const deleteComment = useCallback(async (commentId) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(API_CONFIG.ENDPOINTS.COMMENTS.BY_ID(commentId));
      
      // Invalidate comments cache
      requestCache.invalidate('/posts/');
      
      showSuccess('Comment deleted!');
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to delete comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  return { loading, error, deleteComment };
};

/**
 * Hook for liking a comment
 */
export const useLikeComment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useError();

  const likeComment = useCallback(async (commentId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.COMMENTS.LIKE(commentId));
      
      // Invalidate comment cache
      requestCache.invalidate(API_CONFIG.ENDPOINTS.COMMENTS.BY_ID(commentId));
      
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to like comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const unlikeComment = useCallback(async (commentId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.COMMENTS.UNLIKE(commentId));
      
      // Invalidate comment cache
      requestCache.invalidate(API_CONFIG.ENDPOINTS.COMMENTS.BY_ID(commentId));
      
      return response.data;
    } catch (err) {
      setError(err);
      showError(err.message || 'Failed to unlike comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  return { loading, error, likeComment, unlikeComment };
};
