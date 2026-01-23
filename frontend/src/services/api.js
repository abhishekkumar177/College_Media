import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Posts API
export const postsAPI = {
  getAllPosts: () => api.get('/posts'),
  createPost: (postData) => api.post('/posts', postData),
  likePost: (postId) => api.put(`/posts/${postId}/like`),
};

export default api;