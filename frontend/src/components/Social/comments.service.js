// Comments API Service

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get all comments for a post
 * @param {string} postId - The ID of the post
 * @returns {Promise<Object>} Comments data with replies
 */
export const getComments = async (postId) => {
  try {
    const response = await fetch(`${API_URL}/comments/post/${postId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

/**
 * Create a new comment or reply
 * @param {Object} commentData - { postId, text, parentCommentId? }
 * @returns {Promise<Object>} Created comment
 */
export const createComment = async (commentData) => {
  try {
    const response = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create comment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

/**
 * Update a comment
 * @param {string} commentId - The ID of the comment
 * @param {string} text - Updated comment text
 * @returns {Promise<Object>} Updated comment
 */
export const updateComment = async (commentId, text) => {
  try {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update comment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

/**
 * Delete a comment
 * @param {string} commentId - The ID of the comment
 * @returns {Promise<Object>} Success message
 */
export const deleteComment = async (commentId) => {
  try {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete comment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

/**
 * Like or unlike a comment
 * @param {string} commentId - The ID of the comment
 * @returns {Promise<Object>} Updated comment with like status
 */
export const toggleCommentLike = async (commentId) => {
  try {
    const response = await fetch(`${API_URL}/comments/${commentId}/like`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to toggle comment like');
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw error;
  }
};

/**
 * Get comment count for a post
 * @param {string} postId - The ID of the post
 * @returns {Promise<Object>} Comment count
 */
export const getCommentCount = async (postId) => {
  try {
    const response = await fetch(`${API_URL}/comments/post/${postId}/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch comment count');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching comment count:', error);
    throw error;
  }
};
