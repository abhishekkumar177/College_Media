/**
 * Auth Reducer
 * Manages authentication state with predictable updates
 */

import { AUTH_ACTIONS } from './actionTypes';

/**
 * Initial auth state
 */
export const initialAuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastLogin: null,
};

/**
 * Auth reducer function
 * @param {Object} state - Current auth state
 * @param {Object} action - Action with type and payload
 * @returns {Object} New auth state
 */
export const authReducer = (state, action) => {
  switch (action.type) {
    // ============================================
    // LOGIN
    // ============================================
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || null,
        error: null,
        lastLogin: new Date().toISOString(),
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    // ============================================
    // LOGOUT
    // ============================================
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialAuthState,
      };

    // ============================================
    // REGISTRATION
    // ============================================
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || null,
        error: null,
        lastLogin: new Date().toISOString(),
      };

    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // ============================================
    // USER DATA
    // ============================================
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case AUTH_ACTIONS.CLEAR_USER:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };

    // ============================================
    // TOKEN MANAGEMENT
    // ============================================
    case AUTH_ACTIONS.SET_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || state.refreshToken,
      };

    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || state.refreshToken,
      };

    case AUTH_ACTIONS.CLEAR_TOKEN:
      return {
        ...state,
        token: null,
        refreshToken: null,
      };

    // ============================================
    // ERROR HANDLING
    // ============================================
    case AUTH_ACTIONS.SET_AUTH_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case AUTH_ACTIONS.CLEAR_AUTH_ERROR:
      return {
        ...state,
        error: null,
      };

    // ============================================
    // LOADING STATES
    // ============================================
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};
