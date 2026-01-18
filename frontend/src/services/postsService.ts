/**
 * Posts API Service
 * Handles all post-related API operations
 */

import api from './api';
import API_CONFIG from './apiConfig';

export interface Post {
  id: string;
  user: {
    id: string;
    username: string;
    profilePicture?: string;
  };
  imageUrl?: string;
  thumbnailUrl?: string;
  caption: string;
  likes: number;
  liked?: boolean;
  comments?: number;
  timestamp: string;
  poll?: any;
}

export interface CreatePostData {
  caption: string;
  imageUrl?: string;
  poll?: any;
}

export interface PostsResponse {
  success: boolean;
  data: Post[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface PostResponse {
  success: boolean;
  data: Post;
}

/**
 * Posts Service API
 */
export const postsAPI = {
  /**
   * Get posts feed
   */
  getFeed: async (params: {
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'oldest' | 'popular';
    filter?: string;
  } = {}): Promise<PostsResponse> => {
    const { page = 1, limit = 10, sortBy = 'newest', filter } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      ...(filter && { filter }),
    });

    const response = await api.get(`${API_CONFIG.ENDPOINTS.POSTS.BASE}/feed?${queryParams}`);
    return response.data;
  },

  /**
   * Get recommended posts feed
   */
  getRecommendedFeed: async (params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PostsResponse> => {
    const { page = 1, limit = 10 } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await api.get(`${API_CONFIG.ENDPOINTS.POSTS.BASE}/feed/recommended?${queryParams}`);
    return response.data;
  },

  /**
   * Get single post by ID
   */
  getById: async (postId: string): Promise<PostResponse> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.POSTS.BY_ID(postId));
    return response.data;
  },

  /**
   * Create new post
   */
  create: async (postData: CreatePostData): Promise<PostResponse> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.POSTS.BASE, postData);
    return response.data;
  },

  /**
   * Update post
   */
  update: async (postId: string, postData: Partial<CreatePostData>): Promise<PostResponse> => {
    const response = await api.put(API_CONFIG.ENDPOINTS.POSTS.BY_ID(postId), postData);
    return response.data;
  },

  /**
   * Delete post
   */
  delete: async (postId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(API_CONFIG.ENDPOINTS.POSTS.BY_ID(postId));
    return response.data;
  },

  /**
   * Like a post
   */
  like: async (postId: string): Promise<{ success: boolean; data: { likes: number } }> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.POSTS.LIKE(postId));
    return response.data;
  },

  /**
   * Unlike a post
   */
  unlike: async (postId: string): Promise<{ success: boolean; data: { likes: number } }> => {
    const response = await api.delete(API_CONFIG.ENDPOINTS.POSTS.LIKE(postId));
    return response.data;
  },

  /**
   * Get post comments
   */
  getComments: async (postId: string, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<any> => {
    const { page = 1, limit = 20 } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await api.get(`${API_CONFIG.ENDPOINTS.POSTS.COMMENTS(postId)}?${queryParams}`);
    return response.data;
  },

  /**
   * Search posts
   */
  search: async (query: string, params: {
    page?: number;
    limit?: number;
    filter?: string;
  } = {}): Promise<PostsResponse> => {
    const { page = 1, limit = 10, filter } = params;

    const queryParams = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      ...(filter && { filter }),
    });

    const response = await api.get(`${API_CONFIG.ENDPOINTS.POSTS.BASE}/search?${queryParams}`);
    return response.data;
  },
};

export default postsAPI;