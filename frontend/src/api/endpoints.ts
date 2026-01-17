/**
 * API Endpoints - Centralized endpoint definitions
 * Issue #250: API Integration
 */

import apiClient from './client';

// Auth endpoints
export const authApi = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data: any) => apiClient.put('/auth/profile', data),
  changePassword: (data: any) => apiClient.put('/auth/password', data),
};

// Posts endpoints
export const postsApi = {
  getAll: (params: any) => apiClient.get('/posts', { params }),
  getById: (id: string) => apiClient.get(`/posts/${id}`),
  create: (data: any) => apiClient.post('/posts', data),
  update: (id: string, data: any) => apiClient.put(`/posts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/posts/${id}`),
  like: (id: string) => apiClient.post(`/posts/${id}/like`),
  unlike: (id: string) => apiClient.delete(`/posts/${id}/like`),
  getFeed: (params: any) => apiClient.get('/posts/feed', { params }),
  getTrending: (params: any) => apiClient.get('/posts/trending', { params }),
};

// Comments endpoints
export const commentsApi = {
  getByPost: (postId: string, params: any) => apiClient.get(`/posts/${postId}/comments`, { params }),
  create: (postId: string, data: any) => apiClient.post(`/posts/${postId}/comments`, data),
  update: (commentId: string, data: any) => apiClient.put(`/comments/${commentId}`, data),
  delete: (commentId: string) => apiClient.delete(`/comments/${commentId}`),
  like: (commentId: string) => apiClient.post(`/comments/${commentId}/like`),
};

// Users endpoints
export const usersApi = {
  getById: (id: string) => apiClient.get(`/users/${id}`),
  getProfile: (username: string) => apiClient.get(`/users/profile/${username}`),
  follow: (id: string) => apiClient.post(`/users/${id}/follow`),
  unfollow: (id: string) => apiClient.delete(`/users/${id}/follow`),
  getFollowers: (id: string, params: any) => apiClient.get(`/users/${id}/followers`, { params }),
  getFollowing: (id: string, params: any) => apiClient.get(`/users/${id}/following`, { params }),
  search: (query: string, params: any) => apiClient.get('/users/search', { params: { q: query, ...params } }),
  getBlockedUsers: () => apiClient.get('/users/blocked'),
  blockUser: (userId: string) => apiClient.post(`/users/${userId}/block`),
  unblockUser: (userId: string) => apiClient.delete(`/users/${userId}/block`),
  isUserBlocked: (userId: string) => apiClient.get(`/users/${userId}/is-blocked`),
};

// Upload endpoints
export const uploadApi = {
  image: (file: File, onProgress?: (p: number) => void) => {
    const formData = new FormData();
    formData.append('image', file);

    return apiClient.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded)
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
  video: (file: File, onProgress?: (p: number) => void) => {
    const formData = new FormData();
    formData.append('video', file);

    return apiClient.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded)
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
};

// Notifications endpoints
export const notificationsApi = {
  getAll: (params: any) => apiClient.get('/notifications', { params }),
  markAsRead: (id: string) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
  clearAll: () => apiClient.delete('/notifications/clear-all'),
};

// Search endpoints
export const searchApi = {
  search: (query: string, params: any) => apiClient.get('/search', { params: { q: query, ...params } }),
  getSuggestions: (query: string) => apiClient.get('/search/suggestions', { params: { q: query } }),
  getTrending: () => apiClient.get('/search/trending'),
};

// Messages endpoints
export const messagesApi = {
  getConversations: () => apiClient.get('/messages/conversations'),
  getConversation: (userId: string) => apiClient.get(`/messages/${userId}`),
  send: (data: any) => apiClient.post('/messages/send', data),
  markAllAsRead: (userId: string) => apiClient.put(`/messages/read/${userId}`),
};

// Moderation endpoints
export const moderationApi = {
  // Submit a report (regular users)
  submitReport: (data: any) => apiClient.post('/reports', data),

  // Get all reports (admin only)
  getReports: (params: any) => apiClient.get('/admin/reports', { params }),

  // Get single report details (admin only)
  getReportDetails: (reportId: string) => apiClient.get(`/admin/reports/${reportId}`),

  // Take action on a report (admin only)
  takeAction: (reportId: string, data: any) => apiClient.put(`/admin/reports/${reportId}/action`, data),

  // Bulk action on multiple reports (admin only)
  bulkAction: (data: any) => apiClient.post('/admin/reports/bulk-action', data),

  // Submit appeal for moderation action
  submitAppeal: (data: any) => apiClient.post('/appeals', data),

  // Get moderation statistics (admin only)
  getStatistics: () => apiClient.get('/admin/statistics/reports'),
};

// Account endpoints
export const accountApi = {
  deactivateAccount: (data: any) => apiClient.post('/account/deactivate', data),
  reactivateAccount: () => apiClient.post('/account/reactivate'),
  deleteAccount: (data: any) => apiClient.delete('/account', { data }),
  restoreAccount: () => apiClient.post('/account/restore'),
  permanentDelete: (data: any) => apiClient.delete('/account/permanent', { data }),
  getDeletionStatus: () => apiClient.get('/account/deletion-status'),
  exportData: () => apiClient.post('/account/export-data'),
  getSettings: () => apiClient.get('/account/settings'),
  updateSettings: (data: any) => apiClient.put('/account/settings', data),
  getNotificationPreferences: () => apiClient.get('/account/notification-preferences'),
  updateNotificationPreferences: (data: any) => apiClient.put('/account/notification-preferences', data),
  getProfileVisibility: () => apiClient.get('/account/profile-visibility'),
  updateProfileVisibility: (data: any) => apiClient.put('/account/profile-visibility', data),
  getProfile: () => apiClient.get('/account/profile'),
  updateProfile: (data: any) => apiClient.put('/account/profile', data),
};

// Polls endpoints
export const pollsApi = {
  getAll: (params: any) => apiClient.get('/polls', { params }),
  getById: (id: string) => apiClient.get(`/polls/${id}`),
  create: (data: any) => apiClient.post('/polls', data),
  vote: (id: string, data: any) => apiClient.post(`/polls/${id}/vote`, data),
  getResults: (id: string) => apiClient.get(`/polls/${id}/results`),
  delete: (id: string) => apiClient.delete(`/polls/${id}`),
};

// Collections endpoints
export const collectionsApi = {
  getAll: () => apiClient.get('/collections'),
  create: (data: any) => apiClient.post('/collections', data),
  addPost: (collectionId: string, postId: string) => apiClient.post('/collections/add-post', { collectionId, postId }),
  removePost: (collectionId: string, postId: string) => apiClient.post('/collections/remove-post', { collectionId, postId }),
  delete: (id: string) => apiClient.delete(`/collections/${id}`),
};

// Marketplace endpoints
export const marketplaceApi = {
  getProducts: (params: any) => apiClient.get('/marketplace/products', { params }),
  getProduct: (id: string) => apiClient.get(`/marketplace/products/${id}`),
  createProduct: (data: any) => apiClient.post('/marketplace/products', data),
  updateProduct: (id: string, data: any) => apiClient.put(`/marketplace/products/${id}`, data),
  deleteProduct: (id: string) => apiClient.delete(`/marketplace/products/${id}`),
  createOrder: (productId: string) => apiClient.post('/marketplace/orders', { productId }),
  getOrders: () => apiClient.get('/marketplace/orders'),
  createPaymentIntent: (productId: string) => apiClient.post('/payment/create-payment-intent', { productId }),
  confirmDelivery: (orderId: string) => apiClient.post(`/payment/confirm-delivery/${orderId}`),
};

// Collab endpoints
export const collabApi = {
  createDocument: (data: any) => apiClient.post('/collab/documents', data),
  getDocuments: () => apiClient.get('/collab/documents'),
  getDocument: (id: string) => apiClient.get(`/collab/documents/${id}`),
  deleteDocument: (id: string) => apiClient.delete(`/collab/documents/${id}`),
};

// Events endpoints
export const eventsApi = {
  create: (data: any) => apiClient.post('/events', data),
  getAll: () => apiClient.get('/events'),
  getById: (id: string) => apiClient.get(`/events/${id}`),
  purchaseTicket: (eventId: string, tierName: string) => apiClient.post(`/events/${eventId}/tickets`, { tierName }),
  getMyTickets: () => apiClient.get('/events/tickets/my'),
  verifyTicket: (token: string) => apiClient.post('/events/verify-ticket', { token }),
};

// Career Expo endpoints
export const careerExpoApi = {
  getBooths: () => apiClient.get('/career/booths'),
  createBooth: (data: any) => apiClient.post('/career/booths', data),
  getMySessions: () => apiClient.get('/career/sessions/my'),
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
  collections: collectionsApi,
  marketplace: marketplaceApi,
  collab: collabApi,
  events: eventsApi,
  careerExpo: careerExpoApi,
};
