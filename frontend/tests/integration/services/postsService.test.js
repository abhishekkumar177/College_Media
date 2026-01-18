/**
 * Integration Tests - Posts Service
 * Tests API integration for post operations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { postsAPI } from '../../../src/services/postsService';
import api from '../../../src/services/api';

// Mock the API module
vi.mock('../../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Posts Service Integration', () => {
  const mockPost = {
    id: '1',
    user: {
      id: 'user1',
      username: 'testuser',
      profilePicture: 'https://example.com/avatar.jpg',
    },
    imageUrl: 'https://example.com/post.jpg',
    caption: 'Test post caption',
    likes: 10,
    liked: false,
    comments: 5,
    timestamp: '2 hours ago',
  };

  const mockResponse = {
    success: true,
    data: mockPost,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getFeed', () => {
    it('should fetch posts feed successfully', async () => {
      const mockApiResponse = {
        data: {
          success: true,
          data: [mockPost],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            hasMore: false,
          },
        },
      };

      api.get.mockResolvedValue(mockApiResponse);
      const result = await postsAPI.getFeed();
      expect(api.get).toHaveBeenCalledWith('/posts/feed?page=1&limit=10&sortBy=newest&filter=');
      expect(result).toEqual({
        success: true,
        data: [mockPost],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          hasMore: false,
        },
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      api.get.mockRejectedValue(mockError);
      await expect(postsAPI.getFeed()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should fetch single post by ID', async () => {
      api.get.mockResolvedValue({ data: mockResponse });
      const result = await postsAPI.getById('1');
      expect(api.get).toHaveBeenCalledWith('/posts/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const newPostData = {
        caption: 'New post',
        imageUrl: 'https://example.com/image.jpg',
      };

      api.post.mockResolvedValue({ data: mockResponse });
      const result = await postsAPI.create(newPostData);
      expect(api.post).toHaveBeenCalledWith('/posts', newPostData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('like/unlike', () => {
    it('should like a post', async () => {
      const likeResponse = {
        success: true,
        data: { likes: 11 },
      };

      api.post.mockResolvedValue({ data: likeResponse });
      const result = await postsAPI.like('1');
      expect(api.post).toHaveBeenCalledWith('/posts/1/like');
      expect(result).toEqual(likeResponse);
    });

    it('should unlike a post', async () => {
      const unlikeResponse = {
        success: true,
        data: { likes: 9 },
      };

      api.delete.mockResolvedValue({ data: unlikeResponse });
      const result = await postsAPI.unlike('1');
      expect(api.delete).toHaveBeenCalledWith('/posts/1/like');
      expect(result).toEqual(unlikeResponse);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updateData = { caption: 'Updated caption' };
      const updatedPost = { ...mockPost, caption: 'Updated caption' };
      const updateResponse = {
        success: true,
        data: updatedPost,
      };

      api.put.mockResolvedValue({ data: updateResponse });
      const result = await postsAPI.update('1', updateData);
      expect(api.put).toHaveBeenCalledWith('/posts/1', updateData);
      expect(result).toEqual(updateResponse);
    });
  });

  describe('delete', () => {
    it('should delete a post', async () => {
      const deleteResponse = {
        success: true,
        message: 'Post deleted successfully',
      };

      api.delete.mockResolvedValue({ data: deleteResponse });
      const result = await postsAPI.delete('1');
      expect(api.delete).toHaveBeenCalledWith('/posts/1');
      expect(result).toEqual(deleteResponse);
    });
  });

  describe('search', () => {
    it('should search posts', async () => {
      const searchResponse = {
        success: true,
        data: [mockPost],
      };

      api.get.mockResolvedValue({ data: searchResponse });
      const result = await postsAPI.search('test query');
      expect(api.get).toHaveBeenCalledWith('/posts/search?q=test%20query&page=1&limit=10&filter=');
      expect(result).toEqual(searchResponse);
    });
  });

  describe('getComments', () => {
    it('should fetch post comments', async () => {
      const commentsResponse = {
        success: true,
        data: [],
      };

      api.get.mockResolvedValue({ data: commentsResponse });
      const result = await postsAPI.getComments('1');
      expect(api.get).toHaveBeenCalledWith('/comments/post/1?page=1&limit=20');
      expect(result).toEqual(commentsResponse);
    });
  });
});