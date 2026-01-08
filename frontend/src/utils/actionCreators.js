/**
 * Action Creators
 * Helper functions to create type-safe actions
 */

import {
  AUTH_ACTIONS,
  POSTS_ACTIONS,
  UI_ACTIONS,
  NOTIFICATION_TYPES,
} from '../reducers/actionTypes';

// ============================================
// AUTH ACTION CREATORS
// ============================================

/**
 * Create login start action
 * @returns {Object} Action object
 */
export const createLoginStartAction = () => ({
  type: AUTH_ACTIONS.LOGIN_START,
});

/**
 * Create login success action
 * @param {Object} user - User object
 * @param {string} token - Auth token
 * @param {string} refreshToken - Refresh token
 * @returns {Object} Action object
 */
export const createLoginSuccessAction = (user, token, refreshToken) => ({
  type: AUTH_ACTIONS.LOGIN_SUCCESS,
  payload: { user, token, refreshToken },
});

/**
 * Create login failure action
 * @param {string} error - Error message
 * @returns {Object} Action object
 */
export const createLoginFailureAction = (error) => ({
  type: AUTH_ACTIONS.LOGIN_FAILURE,
  payload: error,
});

/**
 * Create logout action
 * @returns {Object} Action object
 */
export const createLogoutAction = () => ({
  type: AUTH_ACTIONS.LOGOUT,
});

/**
 * Create set user action
 * @param {Object} user - User object
 * @returns {Object} Action object
 */
export const createSetUserAction = (user) => ({
  type: AUTH_ACTIONS.SET_USER,
  payload: user,
});

/**
 * Create update user action
 * @param {Object} updates - User updates
 * @returns {Object} Action object
 */
export const createUpdateUserAction = (updates) => ({
  type: AUTH_ACTIONS.UPDATE_USER,
  payload: updates,
});

// ============================================
// POSTS ACTION CREATORS
// ============================================

/**
 * Create fetch posts success action
 * @param {Array} posts - Posts array
 * @param {Object} pagination - Pagination data
 * @returns {Object} Action object
 */
export const createFetchPostsSuccessAction = (posts, pagination) => ({
  type: POSTS_ACTIONS.FETCH_POSTS_SUCCESS,
  payload: { posts, pagination },
});

/**
 * Create like post action
 * @param {string} postId - Post ID
 * @returns {Object} Action object
 */
export const createLikePostAction = (postId) => ({
  type: POSTS_ACTIONS.LIKE_POST,
  payload: { postId },
});

/**
 * Create unlike post action
 * @param {string} postId - Post ID
 * @returns {Object} Action object
 */
export const createUnlikePostAction = (postId) => ({
  type: POSTS_ACTIONS.UNLIKE_POST,
  payload: { postId },
});

/**
 * Create add comment action
 * @param {string} postId - Post ID
 * @param {Object} comment - Comment object
 * @returns {Object} Action object
 */
export const createAddCommentAction = (postId, comment) => ({
  type: POSTS_ACTIONS.ADD_COMMENT,
  payload: { postId, comment },
});

/**
 * Create delete post action
 * @param {string} postId - Post ID
 * @returns {Object} Action object
 */
export const createDeletePostSuccessAction = (postId) => ({
  type: POSTS_ACTIONS.DELETE_POST_SUCCESS,
  payload: postId,
});

/**
 * Create set filter action
 * @param {Object} filters - Filter object
 * @returns {Object} Action object
 */
export const createSetFilterAction = (filters) => ({
  type: POSTS_ACTIONS.SET_FILTER,
  payload: filters,
});

// ============================================
// UI ACTION CREATORS
// ============================================

/**
 * Create set theme action
 * @param {string} theme - Theme name
 * @returns {Object} Action object
 */
export const createSetThemeAction = (theme) => ({
  type: UI_ACTIONS.SET_THEME,
  payload: theme,
});

/**
 * Create toggle theme action
 * @returns {Object} Action object
 */
export const createToggleThemeAction = () => ({
  type: UI_ACTIONS.TOGGLE_THEME,
});

/**
 * Create open modal action
 * @param {string} modalType - Modal type
 * @param {any} data - Modal data
 * @returns {Object} Action object
 */
export const createOpenModalAction = (modalType, data = null) => ({
  type: UI_ACTIONS.OPEN_MODAL,
  payload: { modalType, data },
});

/**
 * Create close modal action
 * @param {string} modalType - Modal type
 * @returns {Object} Action object
 */
export const createCloseModalAction = (modalType) => ({
  type: UI_ACTIONS.CLOSE_MODAL,
  payload: modalType,
});

/**
 * Create show notification action
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 * @param {number} duration - Duration in ms
 * @returns {Object} Action object
 */
export const createShowNotificationAction = (
  message,
  type = NOTIFICATION_TYPES.INFO,
  duration = 3000
) => ({
  type: UI_ACTIONS.SHOW_NOTIFICATION,
  payload: {
    id: Date.now(),
    message,
    type,
    duration,
  },
});

/**
 * Create hide notification action
 * @param {number} id - Notification ID
 * @returns {Object} Action object
 */
export const createHideNotificationAction = (id) => ({
  type: UI_ACTIONS.HIDE_NOTIFICATION,
  payload: id,
});

/**
 * Create toggle sidebar action
 * @returns {Object} Action object
 */
export const createToggleSidebarAction = () => ({
  type: UI_ACTIONS.TOGGLE_SIDEBAR,
});

/**
 * Create set search query action
 * @param {string} query - Search query
 * @returns {Object} Action object
 */
export const createSetSearchQueryAction = (query) => ({
  type: UI_ACTIONS.SET_SEARCH_QUERY,
  payload: query,
});

// ============================================
// COMPOSITE ACTION CREATORS
// ============================================

/**
 * Create actions for successful post creation
 * @param {Object} post - Created post
 * @returns {Array} Array of actions
 */
export const createPostCreationActions = (post) => [
  {
    type: POSTS_ACTIONS.CREATE_POST_SUCCESS,
    payload: post,
  },
  {
    type: UI_ACTIONS.SHOW_NOTIFICATION,
    payload: {
      id: Date.now(),
      message: 'Post created successfully!',
      type: NOTIFICATION_TYPES.SUCCESS,
      duration: 3000,
    },
  },
];

/**
 * Create actions for successful login
 * @param {Object} user - User object
 * @param {string} token - Auth token
 * @param {string} refreshToken - Refresh token
 * @returns {Array} Array of actions
 */
export const createLoginActions = (user, token, refreshToken) => [
  createLoginSuccessAction(user, token, refreshToken),
  createShowNotificationAction(
    `Welcome back, ${user.username}!`,
    NOTIFICATION_TYPES.SUCCESS
  ),
];

/**
 * Create actions for logout
 * @returns {Array} Array of actions
 */
export const createLogoutActions = () => [
  createLogoutAction(),
  {
    type: POSTS_ACTIONS.CLEAR_POSTS,
  },
  {
    type: UI_ACTIONS.CLOSE_ALL_MODALS,
  },
  createShowNotificationAction(
    'Logged out successfully',
    NOTIFICATION_TYPES.INFO
  ),
];

// ============================================
// ACTION VALIDATION
// ============================================

/**
 * Validate action object
 * @param {Object} action - Action to validate
 * @returns {boolean} Whether action is valid
 */
export const isValidAction = (action) => {
  return (
    action &&
    typeof action === 'object' &&
    typeof action.type === 'string' &&
    action.type.length > 0
  );
};

/**
 * Create type-safe action
 * @param {string} type - Action type
 * @param {any} payload - Action payload
 * @returns {Object} Action object
 */
export const createAction = (type, payload) => {
  if (!type || typeof type !== 'string') {
    throw new Error('Action type must be a non-empty string');
  }

  const action = { type };
  
  if (payload !== undefined) {
    action.payload = payload;
  }

  return action;
};
