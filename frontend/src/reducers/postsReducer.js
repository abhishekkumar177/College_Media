/**
 * Posts Reducer
 * Manages posts state with predictable updates
 */

import { produce } from "immer";
import { POSTS_ACTIONS } from "./actionTypes";

/**
 * Initial posts state
 */
export const initialPostsState = {
  posts: [],
  selectedPost: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    postsPerPage: 10,
  },
  filters: {
    sort: "recent", // recent, popular, trending
    category: null,
    searchQuery: "",
  },
};

/**
 * Posts reducer function with immer for immutable updates
 * @param {Object} state - Current posts state
 * @param {Object} action - Action with type and payload
 * @returns {Object} New posts state
 */
export const postsReducer = (state, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      // ============================================
      // FETCH POSTS
      // ============================================
      case POSTS_ACTIONS.FETCH_POSTS_START:
        draft.isLoading = true;
        draft.error = null;
        break;

      case POSTS_ACTIONS.FETCH_POSTS_SUCCESS:
        draft.isLoading = false;
        draft.posts = action.payload.posts;
        draft.pagination = {
          ...draft.pagination,
          ...action.payload.pagination,
        };
        draft.error = null;
        break;

      case POSTS_ACTIONS.FETCH_POSTS_FAILURE:
        draft.isLoading = false;
        draft.error = action.payload;
        break;

      // ============================================
      // SINGLE POST
      // ============================================
      case POSTS_ACTIONS.FETCH_POST_START:
        draft.isLoading = true;
        draft.error = null;
        break;

      case POSTS_ACTIONS.FETCH_POST_SUCCESS: {
        draft.isLoading = false;
        draft.selectedPost = action.payload;

        // Also update in posts array if exists
        const postIndex = draft.posts.findIndex(
          (p) => p.id === action.payload.id
        );
        if (postIndex !== -1) {
          draft.posts[postIndex] = action.payload;
        }
        break;
      }

      case POSTS_ACTIONS.FETCH_POST_FAILURE:
        draft.isLoading = false;
        draft.error = action.payload;
        break;

      // ============================================
      // CREATE POST
      // ============================================
      case POSTS_ACTIONS.CREATE_POST_START:
        draft.isLoading = true;
        draft.error = null;
        break;

      case POSTS_ACTIONS.CREATE_POST_SUCCESS:
        draft.isLoading = false;
        draft.posts.unshift(action.payload); // Add to beginning
        draft.pagination.totalPosts += 1;
        break;

      case POSTS_ACTIONS.CREATE_POST_FAILURE:
        draft.isLoading = false;
        draft.error = action.payload;
        break;

      // ============================================
      // UPDATE POST
      // ============================================
      case POSTS_ACTIONS.UPDATE_POST_START:
        draft.isLoading = true;
        draft.error = null;
        break;

      case POSTS_ACTIONS.UPDATE_POST_SUCCESS: {
        draft.isLoading = false;
        const index = draft.posts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          draft.posts[index] = action.payload;
        }

        // Update selected post if it's the same
        if (draft.selectedPost?.id === action.payload.id) {
          draft.selectedPost = action.payload;
        }
        break;
      }

      case POSTS_ACTIONS.UPDATE_POST_FAILURE:
        draft.isLoading = false;
        draft.error = action.payload;
        break;

      // ============================================
      // DELETE POST
      // ============================================
      case POSTS_ACTIONS.DELETE_POST_START:
        draft.isLoading = true;
        draft.error = null;
        break;

      case POSTS_ACTIONS.DELETE_POST_SUCCESS: {
        draft.isLoading = false;
        draft.posts = draft.posts.filter((p) => p.id !== action.payload);
        draft.pagination.totalPosts -= 1;

        // Clear selected post if deleted
        if (draft.selectedPost?.id === action.payload) {
          draft.selectedPost = null;
        }
        break;
      }

      case POSTS_ACTIONS.DELETE_POST_FAILURE:
        draft.isLoading = false;
        draft.error = action.payload;
        break;

      // ============================================
      // LIKE/UNLIKE
      // ============================================
      case POSTS_ACTIONS.LIKE_POST: {
        const post = draft.posts.find((p) => p.id === action.payload.postId);
        if (post) {
          post.likes = (post.likes || 0) + 1;
          post.isLiked = true;
        }

        if (draft.selectedPost?.id === action.payload.postId) {
          draft.selectedPost.likes = (draft.selectedPost.likes || 0) + 1;
          draft.selectedPost.isLiked = true;
        }
        break;
      }

      case POSTS_ACTIONS.UNLIKE_POST: {
        const post = draft.posts.find((p) => p.id === action.payload.postId);
        if (post) {
          post.likes = Math.max((post.likes || 0) - 1, 0);
          post.isLiked = false;
        }

        if (draft.selectedPost?.id === action.payload.postId) {
          draft.selectedPost.likes = Math.max(
            (draft.selectedPost.likes || 0) - 1,
            0
          );
          draft.selectedPost.isLiked = false;
        }
        break;
      }

      // ============================================
      // COMMENTS
      // ============================================
      case POSTS_ACTIONS.ADD_COMMENT: {
        const post = draft.posts.find((p) => p.id === action.payload.postId);
        if (post) {
          if (!post.comments) post.comments = [];
          post.comments.push(action.payload.comment);
          post.commentCount = (post.commentCount || 0) + 1;
        }

        if (draft.selectedPost?.id === action.payload.postId) {
          if (!draft.selectedPost.comments) draft.selectedPost.comments = [];
          draft.selectedPost.comments.push(action.payload.comment);
          draft.selectedPost.commentCount =
            (draft.selectedPost.commentCount || 0) + 1;
        }
        break;
      }

      case POSTS_ACTIONS.UPDATE_COMMENT: {
        const post = draft.posts.find((p) => p.id === action.payload.postId);
        if (post?.comments) {
          const commentIndex = post.comments.findIndex(
            (c) => c.id === action.payload.commentId
          );
          if (commentIndex !== -1) {
            post.comments[commentIndex] = action.payload.comment;
          }
        }

        if (
          draft.selectedPost?.id === action.payload.postId &&
          draft.selectedPost.comments
        ) {
          const commentIndex = draft.selectedPost.comments.findIndex(
            (c) => c.id === action.payload.commentId
          );
          if (commentIndex !== -1) {
            draft.selectedPost.comments[commentIndex] = action.payload.comment;
          }
        }
        break;
      }

      case POSTS_ACTIONS.DELETE_COMMENT: {
        const post = draft.posts.find((p) => p.id === action.payload.postId);
        if (post?.comments) {
          post.comments = post.comments.filter(
            (c) => c.id !== action.payload.commentId
          );
          post.commentCount = Math.max((post.commentCount || 0) - 1, 0);
        }

        if (
          draft.selectedPost?.id === action.payload.postId &&
          draft.selectedPost.comments
        ) {
          draft.selectedPost.comments = draft.selectedPost.comments.filter(
            (c) => c.id !== action.payload.commentId
          );
          draft.selectedPost.commentCount = Math.max(
            (draft.selectedPost.commentCount || 0) - 1,
            0
          );
        }
        break;
      }

      // ============================================
      // STATE MANAGEMENT
      // ============================================
      case POSTS_ACTIONS.SET_SELECTED_POST:
        draft.selectedPost = action.payload;
        break;

      case POSTS_ACTIONS.CLEAR_SELECTED_POST:
        draft.selectedPost = null;
        break;

      case POSTS_ACTIONS.CLEAR_POSTS:
        draft.posts = [];
        draft.selectedPost = null;
        draft.pagination = initialPostsState.pagination;
        break;

      // ============================================
      // FILTERS AND PAGINATION
      // ============================================
      case POSTS_ACTIONS.SET_FILTER:
        draft.filters = {
          ...draft.filters,
          ...action.payload,
        };
        break;

      case POSTS_ACTIONS.SET_PAGE:
        draft.pagination.currentPage = action.payload;
        break;

      case POSTS_ACTIONS.SET_SORT:
        draft.filters.sort = action.payload;
        break;

      // ============================================
      // ERROR HANDLING
      // ============================================
      case POSTS_ACTIONS.SET_POSTS_ERROR:
        draft.error = action.payload;
        break;

      case POSTS_ACTIONS.CLEAR_POSTS_ERROR:
        draft.error = null;
        break;

      default:
        break;
    }
  });
};
