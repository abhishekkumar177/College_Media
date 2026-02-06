// Posts API Service

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get all posts with pagination
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Object>} Posts data with pagination
 */
export const getPosts = async (limit = 10, offset = 0) => {
  try {
    const response = await fetch(`${API_URL}/posts?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

/**
 * Create a new post
 * @param {Object} postData - { content, image? }
 * @returns {Promise<Object>} Created post
 */
export const createPost = async (postData) => {
  try {
    const token = getAuthToken();
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('API URL:', `${API_URL}/posts`);
    console.log('Post data:', postData);

    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || `Failed to create post (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

/**
 * Update a post
 * @param {string} postId - The ID of the post
 * @param {Object} postData - { content, image? }
 * @returns {Promise<Object>} Updated post
 */
export const updatePost = async (postId, postData) => {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

/**
 * Delete a post
 * @param {string} postId - The ID of the post
 * @returns {Promise<Object>} Success message
 */
export const deletePost = async (postId) => {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

/**
 * Like or unlike a post
 * @param {string} postId - The ID of the post
 * @returns {Promise<Object>} Updated post
 */
export const togglePostLike = async (postId) => {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to toggle post like');
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
};
