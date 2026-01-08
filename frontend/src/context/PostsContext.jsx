/**
 * Posts Context
 * Global posts state management
 */
/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useReducer, useCallback } from "react";
import { postsReducer, initialPostsState } from "../reducers/postsReducer";
import { POSTS_ACTIONS } from "../reducers/actionTypes";

export const PostsContext = createContext(null);

/**
 * PostsProvider component
 * Wraps the app to provide posts state
 */
export const PostsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(postsReducer, initialPostsState);

  // ============================================
  // FETCH POSTS
  // ============================================

  const fetchPostsStart = useCallback(() => {
    dispatch({ type: POSTS_ACTIONS.FETCH_POSTS_START });
  }, []);

  const fetchPostsSuccess = useCallback((posts, pagination) => {
    dispatch({
      type: POSTS_ACTIONS.FETCH_POSTS_SUCCESS,
      payload: { posts, pagination },
    });
  }, []);

  const fetchPostsFailure = useCallback((error) => {
    dispatch({
      type: POSTS_ACTIONS.FETCH_POSTS_FAILURE,
      payload: error,
    });
  }, []);

  // ============================================
  // SINGLE POST
  // ============================================

  const fetchPostStart = useCallback(() => {
    dispatch({ type: POSTS_ACTIONS.FETCH_POST_START });
  }, []);

  const fetchPostSuccess = useCallback((post) => {
    dispatch({
      type: POSTS_ACTIONS.FETCH_POST_SUCCESS,
      payload: post,
    });
  }, []);

  const fetchPostFailure = useCallback((error) => {
    dispatch({
      type: POSTS_ACTIONS.FETCH_POST_FAILURE,
      payload: error,
    });
  }, []);

  // ============================================
  // CREATE POST
  // ============================================

  const createPostStart = useCallback(() => {
    dispatch({ type: POSTS_ACTIONS.CREATE_POST_START });
  }, []);

  const createPostSuccess = useCallback((post) => {
    dispatch({
      type: POSTS_ACTIONS.CREATE_POST_SUCCESS,
      payload: post,
    });
  }, []);

  const createPostFailure = useCallback((error) => {
    dispatch({
      type: POSTS_ACTIONS.CREATE_POST_FAILURE,
      payload: error,
    });
  }, []);

  // ============================================
  // UPDATE POST
  // ============================================

  const updatePostStart = useCallback(() => {
    dispatch({ type: POSTS_ACTIONS.UPDATE_POST_START });
  }, []);

  const updatePostSuccess = useCallback((post) => {
    dispatch({
      type: POSTS_ACTIONS.UPDATE_POST_SUCCESS,
      payload: post,
    });
  }, []);

  const updatePostFailure = useCallback((error) => {
    dispatch({
      type: POSTS_ACTIONS.UPDATE_POST_FAILURE,
      payload: error,
    });
  }, []);

  // ============================================
  // DELETE POST
  // ============================================

  const deletePostStart = useCallback(() => {
    dispatch({ type: POSTS_ACTIONS.DELETE_POST_START });
  }, []);

  const deletePostSuccess = useCallback((postId) => {
    dispatch({
      type: POSTS_ACTIONS.DELETE_POST_SUCCESS,
      payload: postId,
    });
  }, []);

  const deletePostFailure = useCallback((error) => {
    dispatch({
      type: POSTS_ACTIONS.DELETE_POST_FAILURE,
      payload: error,
    });
  }, []);

  // ============================================
  // LIKE/UNLIKE
  // ============================================

  const likePost = useCallback((postId) => {
    dispatch({
      type: POSTS_ACTIONS.LIKE_POST,
      payload: { postId },
    });
  }, []);

  const unlikePost = useCallback((postId) => {
    dispatch({
      type: POSTS_ACTIONS.UNLIKE_POST,
      payload: { postId },
    });
  }, []);

  // ============================================
  // COMMENTS
  // ============================================

  const addComment = useCallback((postId, comment) => {
    dispatch({
      type: POSTS_ACTIONS.ADD_COMMENT,
      payload: { postId, comment },
    });
  }, []);

  const updateComment = useCallback((postId, commentId, comment) => {
    dispatch({
      type: POSTS_ACTIONS.UPDATE_COMMENT,
      payload: { postId, commentId, comment },
    });
  }, []);

  const deleteComment = useCallback((postId, commentId) => {
    dispatch({
      type: POSTS_ACTIONS.DELETE_COMMENT,
      payload: { postId, commentId },
    });
  }, []);

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const setSelectedPost = useCallback((post) => {
    dispatch({
      type: POSTS_ACTIONS.SET_SELECTED_POST,
      payload: post,
    });
  }, []);

  const clearSelectedPost = useCallback(() => {
    dispatch({ type: POSTS_ACTIONS.CLEAR_SELECTED_POST });
  }, []);

  const clearPosts = useCallback(() => {
    dispatch({ type: POSTS_ACTIONS.CLEAR_POSTS });
  }, []);

  // ============================================
  // FILTERS AND PAGINATION
  // ============================================

  const setFilter = useCallback((filters) => {
    dispatch({
      type: POSTS_ACTIONS.SET_FILTER,
      payload: filters,
    });
  }, []);

  const setPage = useCallback((page) => {
    dispatch({
      type: POSTS_ACTIONS.SET_PAGE,
      payload: page,
    });
  }, []);

  const setSort = useCallback((sort) => {
    dispatch({
      type: POSTS_ACTIONS.SET_SORT,
      payload: sort,
    });
  }, []);

  // ============================================
  // ERROR HANDLING
  // ============================================

  const setPostsError = useCallback((error) => {
    dispatch({
      type: POSTS_ACTIONS.SET_POSTS_ERROR,
      payload: error,
    });
  }, []);

  const clearPostsError = useCallback(() => {
    dispatch({ type: POSTS_ACTIONS.CLEAR_POSTS_ERROR });
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = {
    // State
    ...state,

    // Actions
    fetchPostsStart,
    fetchPostsSuccess,
    fetchPostsFailure,
    fetchPostStart,
    fetchPostSuccess,
    fetchPostFailure,
    createPostStart,
    createPostSuccess,
    createPostFailure,
    updatePostStart,
    updatePostSuccess,
    updatePostFailure,
    deletePostStart,
    deletePostSuccess,
    deletePostFailure,
    likePost,
    unlikePost,
    addComment,
    updateComment,
    deleteComment,
    setSelectedPost,
    clearSelectedPost,
    clearPosts,
    setFilter,
    setPage,
    setSort,
    setPostsError,
    clearPostsError,
  };

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
};
