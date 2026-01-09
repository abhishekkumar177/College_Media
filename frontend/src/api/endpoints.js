/**
 * API Endpoints - Centralized endpoint definitions
 * Issue #250: API Integration
 */

import apiClient from './client';

// Auth endpoints
export const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.put('/auth/password', data),
};

// Posts endpoints
export const postsApi = {
  getAll: (params) => apiClient.get('/posts', { params }),
  getById: (id) => apiClient.get(`/posts/${id}`),
  create: (data) => apiClient.post('/posts', data),
  update: (id, data) => apiClient.put(`/posts/${id}`, data),
  delete: (id) => apiClient.delete(`/posts/${id}`),
  like: (id) => apiClient.post(`/posts/${id}/like`),
  unlike: (id) => apiClient.delete(`/posts/${id}/like`),
  getFeed: (params) => apiClient.get('/posts/feed', { params }),
  getTrending: (params) => apiClient.get('/posts/trending', { params }),
};

// Comments endpoints
export const commentsApi = {
  getByPost: (postId, params) => apiClient.get(`/posts/${postId}/comments`, { params }),
  create: (postId, data) => apiClient.post(`/posts/${postId}/comments`, data),
  update: (commentId, data) => apiClient.put(`/comments/${commentId}`, data),
  delete: (commentId) => apiClient.delete(`/comments/${commentId}`),
  like: (commentId) => apiClient.post(`/comments/${commentId}/like`),
};

// Users endpoints
export const usersApi = {
  getById: (id) => apiClient.get(`/users/${id}`),
  getProfile: (username) => apiClient.get(`/users/profile/${username}`),
  follow: (id) => apiClient.post(`/users/${id}/follow`),
  unfollow: (id) => apiClient.delete(`/users/${id}/follow`),
  getFollowers: (id, params) => apiClient.get(`/users/${id}/followers`, { params }),
  getFollowing: (id, params) => apiClient.get(`/users/${id}/following`, { params }),
  search: (query, params) => apiClient.get('/users/search', { params: { q: query, ...params } }),
};

// Upload endpoints
export const uploadApi = {
  image: (file, onProgress) => {
    const formData = new FormData();
    formData.append('image', file);

    return apiClient.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
  video: (file, onProgress) => {
    const formData = new FormData();
    formData.append('video', file);

    return apiClient.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
};

// Notifications endpoints
export const notificationsApi = {
  getAll: (params) => apiClient.get('/notifications', { params }),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
};

// Export all APIs
export default {
  auth: authApi,
  posts: postsApi,
  comments: commentsApi,
  users: usersApi,
  upload: uploadApi,
  notifications: notificationsApi,
};
