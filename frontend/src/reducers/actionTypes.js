/**
 * Action Types for State Management
 * Centralized constants for all reducers
 */

// ============================================
// AUTH ACTION TYPES
// ============================================
export const AUTH_ACTIONS = {
  // Login/Logout
  LOGIN_START: 'AUTH/LOGIN_START',
  LOGIN_SUCCESS: 'AUTH/LOGIN_SUCCESS',
  LOGIN_FAILURE: 'AUTH/LOGIN_FAILURE',
  
  LOGOUT: 'AUTH/LOGOUT',
  
  // Registration
  REGISTER_START: 'AUTH/REGISTER_START',
  REGISTER_SUCCESS: 'AUTH/REGISTER_SUCCESS',
  REGISTER_FAILURE: 'AUTH/REGISTER_FAILURE',
  
  // User data
  SET_USER: 'AUTH/SET_USER',
  UPDATE_USER: 'AUTH/UPDATE_USER',
  CLEAR_USER: 'AUTH/CLEAR_USER',
  
  // Token management
  SET_TOKEN: 'AUTH/SET_TOKEN',
  REFRESH_TOKEN: 'AUTH/REFRESH_TOKEN',
  CLEAR_TOKEN: 'AUTH/CLEAR_TOKEN',
  
  // Error handling
  SET_AUTH_ERROR: 'AUTH/SET_AUTH_ERROR',
  CLEAR_AUTH_ERROR: 'AUTH/CLEAR_AUTH_ERROR',
  
  // Loading states
  SET_LOADING: 'AUTH/SET_LOADING',
};

// ============================================
// POSTS ACTION TYPES
// ============================================
export const POSTS_ACTIONS = {
  // Fetch posts
  FETCH_POSTS_START: 'POSTS/FETCH_POSTS_START',
  FETCH_POSTS_SUCCESS: 'POSTS/FETCH_POSTS_SUCCESS',
  FETCH_POSTS_FAILURE: 'POSTS/FETCH_POSTS_FAILURE',
  
  // Single post
  FETCH_POST_START: 'POSTS/FETCH_POST_START',
  FETCH_POST_SUCCESS: 'POSTS/FETCH_POST_SUCCESS',
  FETCH_POST_FAILURE: 'POSTS/FETCH_POST_FAILURE',
  
  // Create post
  CREATE_POST_START: 'POSTS/CREATE_POST_START',
  CREATE_POST_SUCCESS: 'POSTS/CREATE_POST_SUCCESS',
  CREATE_POST_FAILURE: 'POSTS/CREATE_POST_FAILURE',
  
  // Update post
  UPDATE_POST_START: 'POSTS/UPDATE_POST_START',
  UPDATE_POST_SUCCESS: 'POSTS/UPDATE_POST_SUCCESS',
  UPDATE_POST_FAILURE: 'POSTS/UPDATE_POST_FAILURE',
  
  // Delete post
  DELETE_POST_START: 'POSTS/DELETE_POST_START',
  DELETE_POST_SUCCESS: 'POSTS/DELETE_POST_SUCCESS',
  DELETE_POST_FAILURE: 'POSTS/DELETE_POST_FAILURE',
  
  // Like/Unlike
  LIKE_POST: 'POSTS/LIKE_POST',
  UNLIKE_POST: 'POSTS/UNLIKE_POST',
  
  // Comments
  ADD_COMMENT: 'POSTS/ADD_COMMENT',
  UPDATE_COMMENT: 'POSTS/UPDATE_COMMENT',
  DELETE_COMMENT: 'POSTS/DELETE_COMMENT',
  
  // State management
  SET_SELECTED_POST: 'POSTS/SET_SELECTED_POST',
  CLEAR_SELECTED_POST: 'POSTS/CLEAR_SELECTED_POST',
  CLEAR_POSTS: 'POSTS/CLEAR_POSTS',
  
  // Filters and pagination
  SET_FILTER: 'POSTS/SET_FILTER',
  SET_PAGE: 'POSTS/SET_PAGE',
  SET_SORT: 'POSTS/SET_SORT',
  
  // Error handling
  SET_POSTS_ERROR: 'POSTS/SET_POSTS_ERROR',
  CLEAR_POSTS_ERROR: 'POSTS/CLEAR_POSTS_ERROR',
};

// ============================================
// UI ACTION TYPES
// ============================================
export const UI_ACTIONS = {
  // Theme
  SET_THEME: 'UI/SET_THEME',
  TOGGLE_THEME: 'UI/TOGGLE_THEME',
  
  // Modals
  OPEN_MODAL: 'UI/OPEN_MODAL',
  CLOSE_MODAL: 'UI/CLOSE_MODAL',
  CLOSE_ALL_MODALS: 'UI/CLOSE_ALL_MODALS',
  
  // Notifications/Toasts
  SHOW_NOTIFICATION: 'UI/SHOW_NOTIFICATION',
  HIDE_NOTIFICATION: 'UI/HIDE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'UI/CLEAR_NOTIFICATIONS',
  
  // Sidebar
  TOGGLE_SIDEBAR: 'UI/TOGGLE_SIDEBAR',
  OPEN_SIDEBAR: 'UI/OPEN_SIDEBAR',
  CLOSE_SIDEBAR: 'UI/CLOSE_SIDEBAR',
  
  // Loading states
  SET_GLOBAL_LOADING: 'UI/SET_GLOBAL_LOADING',
  
  // Mobile menu
  TOGGLE_MOBILE_MENU: 'UI/TOGGLE_MOBILE_MENU',
  
  // Drawer
  OPEN_DRAWER: 'UI/OPEN_DRAWER',
  CLOSE_DRAWER: 'UI/CLOSE_DRAWER',
  
  // Search
  SET_SEARCH_QUERY: 'UI/SET_SEARCH_QUERY',
  CLEAR_SEARCH_QUERY: 'UI/CLEAR_SEARCH_QUERY',
  
  // View mode
  SET_VIEW_MODE: 'UI/SET_VIEW_MODE',
};

// ============================================
// MODAL TYPES
// ============================================
export const MODAL_TYPES = {
  CREATE_POST: 'CREATE_POST',
  EDIT_POST: 'EDIT_POST',
  DELETE_POST: 'DELETE_POST',
  SHARE_POST: 'SHARE_POST',
  REPORT_POST: 'REPORT_POST',
  USER_PROFILE: 'USER_PROFILE',
  CONFIRM: 'CONFIRM',
  IMAGE_PREVIEW: 'IMAGE_PREVIEW',
};

// ============================================
// NOTIFICATION TYPES
// ============================================
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// ============================================
// THEME TYPES
// ============================================
export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};
