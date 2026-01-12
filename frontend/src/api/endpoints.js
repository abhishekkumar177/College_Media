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
  getBlockedUsers: () => apiClient.get('/users/blocked'),
  blockUser: (userId) => apiClient.post(`/users/${userId}/block`),
  unblockUser: (userId) => apiClient.delete(`/users/${userId}/block`),
  isUserBlocked: (userId) => apiClient.get(`/users/${userId}/is-blocked`),
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
  clearAll: () => apiClient.delete('/notifications/clear-all'),
};

// Search endpoints
export const searchApi = {
  search: (query, params) => apiClient.get('/search', { params: { q: query, ...params } }),
  getSuggestions: (query) => apiClient.get('/search/suggestions', { params: { q: query } }),
  getTrending: () => apiClient.get('/search/trending'),
};
// Messages endpoints
export const messagesApi = {
  getConversations: () => apiClient.get('/messages/conversations'),
  getConversation: (userId) => apiClient.get(`/messages/${userId}`),
  send: (data) => apiClient.post('/messages/send', data),
  markAllAsRead: (userId) => apiClient.put(`/messages/read/${userId}`),
};
// Moderation endpoints
export const moderationApi = {
  // Submit a report (regular users)
  submitReport: (data) => apiClient.post('/reports', data),
  
  // Get all reports (admin only)
  getReports: (params) => apiClient.get('/admin/reports', { params }),
  
  // Get single report details (admin only)
  getReportDetails: (reportId) => apiClient.get(`/admin/reports/${reportId}`),
  
  // Take action on a report (admin only)
  takeAction: (reportId, data) => apiClient.put(`/admin/reports/${reportId}/action`, data),
  
  // Bulk action on multiple reports (admin only)
  bulkAction: (data) => apiClient.post('/admin/reports/bulk-action', data),
  
  // Submit appeal for moderation action
  submitAppeal: (data) => apiClient.post('/appeals', data),
  
  // Get moderation statistics (admin only)
  getStatistics: () => apiClient.get('/admin/statistics/reports'),
};

// Account endpoints
export const accountApi = {
  deactivateAccount: (data) => apiClient.post('/account/deactivate', data),
  reactivateAccount: () => apiClient.post('/account/reactivate'),
  deleteAccount: (data) => apiClient.delete('/account', { data }),
  restoreAccount: () => apiClient.post('/account/restore'),
  permanentDelete: (data) => apiClient.delete('/account/permanent', { data }),
  getDeletionStatus: () => apiClient.get('/account/deletion-status'),
  exportData: () => apiClient.post('/account/export-data'),
  getSettings: () => apiClient.get('/account/settings'),
  updateSettings: (data) => apiClient.put('/account/settings', data),
  getNotificationPreferences: () => apiClient.get('/account/notification-preferences'),
  updateNotificationPreferences: (data) => apiClient.put('/account/notification-preferences', data),
  getProfileVisibility: () => apiClient.get('/account/profile-visibility'),
  updateProfileVisibility: (data) => apiClient.put('/account/profile-visibility', data),
  getProfile: () => apiClient.get('/account/profile'),
  updateProfile: (data) => apiClient.put('/account/profile', data),
};

// Polls endpoints
export const pollsApi = {
  getAll: (params) => apiClient.get('/polls', { params }),
  getById: (id) => apiClient.get(`/polls/${id}`),
  create: (data) => apiClient.post('/polls', data),
  vote: (id, data) => apiClient.post(`/polls/${id}/vote`, data),
  getResults: (id) => apiClient.get(`/polls/${id}/results`),
  delete: (id) => apiClient.delete(`/polls/${id}`),
};

// Export all APIs
export default {
  auth: authApi,
  posts: postsApi,
  comments: commentsApi,
  users: usersApi,
  upload: uploadApi,
  notifications: notificationsApi,
  search: searchApi,
  messages: messagesApi,
  moderation: moderationApi,
  polls: pollsApi,
};
