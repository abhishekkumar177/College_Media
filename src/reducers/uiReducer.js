/**
 * UI Reducer
 * Manages UI state (theme, modals, notifications, etc.)
 */

import { produce } from 'immer';
import { UI_ACTIONS, THEME_TYPES } from './actionTypes';

/**
 * Initial UI state
 */
export const initialUIState = {
  theme: THEME_TYPES.LIGHT,
  modals: {
    open: [],
    data: {},
  },
  notifications: [],
  sidebar: {
    isOpen: true,
    isPinned: false,
  },
  drawer: {
    isOpen: false,
    content: null,
  },
  mobileMenu: {
    isOpen: false,
  },
  search: {
    query: '',
    isOpen: false,
  },
  viewMode: 'grid', // grid, list
  isGlobalLoading: false,
};

/**
 * UI reducer function with immer
 * @param {Object} state - Current UI state
 * @param {Object} action - Action with type and payload
 * @returns {Object} New UI state
 */
export const uiReducer = (state, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      // ============================================
      // THEME
      // ============================================
      case UI_ACTIONS.SET_THEME:
        draft.theme = action.payload;
        break;

      case UI_ACTIONS.TOGGLE_THEME:
        draft.theme = draft.theme === THEME_TYPES.LIGHT ? THEME_TYPES.DARK : THEME_TYPES.LIGHT;
        break;

      // ============================================
      // MODALS
      // ============================================
      case UI_ACTIONS.OPEN_MODAL:
        if (!draft.modals.open.includes(action.payload.modalType)) {
          draft.modals.open.push(action.payload.modalType);
        }
        if (action.payload.data) {
          draft.modals.data[action.payload.modalType] = action.payload.data;
        }
        break;

      case UI_ACTIONS.CLOSE_MODAL:
        draft.modals.open = draft.modals.open.filter(m => m !== action.payload);
        delete draft.modals.data[action.payload];
        break;

      case UI_ACTIONS.CLOSE_ALL_MODALS:
        draft.modals.open = [];
        draft.modals.data = {};
        break;

      // ============================================
      // NOTIFICATIONS
      // ============================================
      case UI_ACTIONS.SHOW_NOTIFICATION: {
        const notification = {
          id: action.payload.id || Date.now(),
          type: action.payload.type || 'info',
          message: action.payload.message,
          duration: action.payload.duration || 3000,
          timestamp: new Date().toISOString(),
        };
        draft.notifications.push(notification);
        break;
      }

      case UI_ACTIONS.HIDE_NOTIFICATION:
        draft.notifications = draft.notifications.filter(n => n.id !== action.payload);
        break;

      case UI_ACTIONS.CLEAR_NOTIFICATIONS:
        draft.notifications = [];
        break;

      // ============================================
      // SIDEBAR
      // ============================================
      case UI_ACTIONS.TOGGLE_SIDEBAR:
        draft.sidebar.isOpen = !draft.sidebar.isOpen;
        break;

      case UI_ACTIONS.OPEN_SIDEBAR:
        draft.sidebar.isOpen = true;
        break;

      case UI_ACTIONS.CLOSE_SIDEBAR:
        draft.sidebar.isOpen = false;
        break;

      // ============================================
      // LOADING
      // ============================================
      case UI_ACTIONS.SET_GLOBAL_LOADING:
        draft.isGlobalLoading = action.payload;
        break;

      // ============================================
      // MOBILE MENU
      // ============================================
      case UI_ACTIONS.TOGGLE_MOBILE_MENU:
        draft.mobileMenu.isOpen = !draft.mobileMenu.isOpen;
        break;

      // ============================================
      // DRAWER
      // ============================================
      case UI_ACTIONS.OPEN_DRAWER:
        draft.drawer.isOpen = true;
        draft.drawer.content = action.payload;
        break;

      case UI_ACTIONS.CLOSE_DRAWER:
        draft.drawer.isOpen = false;
        draft.drawer.content = null;
        break;

      // ============================================
      // SEARCH
      // ============================================
      case UI_ACTIONS.SET_SEARCH_QUERY:
        draft.search.query = action.payload;
        draft.search.isOpen = !!action.payload;
        break;

      case UI_ACTIONS.CLEAR_SEARCH_QUERY:
        draft.search.query = '';
        draft.search.isOpen = false;
        break;

      // ============================================
      // VIEW MODE
      // ============================================
      case UI_ACTIONS.SET_VIEW_MODE:
        draft.viewMode = action.payload;
        break;

      default:
        break;
    }
  });
};
