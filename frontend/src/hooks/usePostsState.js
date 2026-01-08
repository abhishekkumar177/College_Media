/**
 * usePostsState Hook
 * Easy access to posts state and actions
 */

import { useContext } from 'react';
import { PostsContext } from '../context/PostsContext';

/**
 * Hook to access posts context
 * @throws {Error} If used outside PostsProvider
 * @returns {Object} Posts state and actions
 */
export const usePostsState = () => {
  const context = useContext(PostsContext);

  if (!context) {
    throw new Error('usePostsState must be used within a PostsProvider');
  }

  return context;
};

/**
 * Hook to get all posts
 * @returns {Array} Array of posts
 */
export const usePosts = () => {
  const { posts } = usePostsState();
  return posts;
};

/**
 * Hook to get selected post
 * @returns {Object|null} Selected post or null
 */
export const useSelectedPost = () => {
  const { selectedPost } = usePostsState();
  return selectedPost;
};

/**
 * Hook to get posts loading state
 * @returns {boolean} Loading state
 */
export const usePostsLoading = () => {
  const { isLoading } = usePostsState();
  return isLoading;
};

/**
 * Hook to get posts pagination
 * @returns {Object} Pagination object
 */
export const usePostsPagination = () => {
  const { pagination } = usePostsState();
  return pagination;
};

/**
 * Hook to get posts filters
 * @returns {Object} Filters object
 */
export const usePostsFilters = () => {
  const { filters } = usePostsState();
  return filters;
};

/**
 * Hook to get posts actions
 * @returns {Object} Posts action methods
 */
export const usePostsActions = () => {
  const context = usePostsState();

  return {
    // Fetch actions
    fetchPostsStart: context.fetchPostsStart,
    fetchPostsSuccess: context.fetchPostsSuccess,
    fetchPostsFailure: context.fetchPostsFailure,
    fetchPostStart: context.fetchPostStart,
    fetchPostSuccess: context.fetchPostSuccess,
    fetchPostFailure: context.fetchPostFailure,

    // CRUD actions
    createPostStart: context.createPostStart,
    createPostSuccess: context.createPostSuccess,
    createPostFailure: context.createPostFailure,
    updatePostStart: context.updatePostStart,
    updatePostSuccess: context.updatePostSuccess,
    updatePostFailure: context.updatePostFailure,
    deletePostStart: context.deletePostStart,
    deletePostSuccess: context.deletePostSuccess,
    deletePostFailure: context.deletePostFailure,

    // Interaction actions
    likePost: context.likePost,
    unlikePost: context.unlikePost,
    addComment: context.addComment,
    updateComment: context.updateComment,
    deleteComment: context.deleteComment,

    // State management actions
    setSelectedPost: context.setSelectedPost,
    clearSelectedPost: context.clearSelectedPost,
    clearPosts: context.clearPosts,

    // Filter and pagination actions
    setFilter: context.setFilter,
    setPage: context.setPage,
    setSort: context.setSort,

    // Error actions
    setPostsError: context.setPostsError,
    clearPostsError: context.clearPostsError,
  };
};
