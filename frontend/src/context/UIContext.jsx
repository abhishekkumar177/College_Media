/**
 * UI Context
 * Global UI state management (theme, modals, notifications, etc.)
 */
/* eslint-disable react-refresh/only-export-components */

import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { uiReducer, initialUIState } from "../reducers/uiReducer";
import { UI_ACTIONS, NOTIFICATION_TYPES } from "../reducers/actionTypes";
import { getStoredTheme, setStoredTheme } from "../utils/stateHelpers";

export const UIContext = createContext(null);

/**
 * UIProvider component
 * Wraps the app to provide UI state
 */
export const UIProvider = ({ children }) => {
  // Initialize state with stored theme
  const [state, dispatch] = useReducer(uiReducer, initialUIState, (initial) => {
    const storedTheme = getStoredTheme();
    return storedTheme ? { ...initial, theme: storedTheme } : initial;
  });

  // Persist theme to localStorage
  useEffect(() => {
    setStoredTheme(state.theme);

    // Apply theme to document
    document.documentElement.setAttribute("data-theme", state.theme);
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  // Auto-hide notifications
  useEffect(() => {
    state.notifications.forEach((notification) => {
      if (notification.duration > 0) {
        const timer = setTimeout(() => {
          hideNotification(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [state.notifications, hideNotification]);

  // ============================================
  // THEME ACTIONS
  // ============================================

  const setTheme = useCallback((theme) => {
    dispatch({
      type: UI_ACTIONS.SET_THEME,
      payload: theme,
    });
  }, []);

  const toggleTheme = useCallback(() => {
    dispatch({ type: UI_ACTIONS.TOGGLE_THEME });
  }, []);

  // ============================================
  // MODAL ACTIONS
  // ============================================

  const openModal = useCallback((modalType, data = null) => {
    dispatch({
      type: UI_ACTIONS.OPEN_MODAL,
      payload: { modalType, data },
    });
  }, []);

  const closeModal = useCallback((modalType) => {
    dispatch({
      type: UI_ACTIONS.CLOSE_MODAL,
      payload: modalType,
    });
  }, []);

  const closeAllModals = useCallback(() => {
    dispatch({ type: UI_ACTIONS.CLOSE_ALL_MODALS });
  }, []);

  // ============================================
  // NOTIFICATION ACTIONS
  // ============================================

  const showNotification = useCallback(
    (message, type = NOTIFICATION_TYPES.INFO, duration = 3000) => {
      const notification = {
        id: Date.now(),
        message,
        type,
        duration,
      };

      dispatch({
        type: UI_ACTIONS.SHOW_NOTIFICATION,
        payload: notification,
      });

      return notification.id;
    },
    []
  );

  const showSuccess = useCallback(
    (message, duration = 3000) => {
      return showNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
    },
    [showNotification]
  );

  const showError = useCallback(
    (message, duration = 5000) => {
      return showNotification(message, NOTIFICATION_TYPES.ERROR, duration);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message, duration = 4000) => {
      return showNotification(message, NOTIFICATION_TYPES.WARNING, duration);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message, duration = 3000) => {
      return showNotification(message, NOTIFICATION_TYPES.INFO, duration);
    },
    [showNotification]
  );

  const hideNotification = useCallback((id) => {
    dispatch({
      type: UI_ACTIONS.HIDE_NOTIFICATION,
      payload: id,
    });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: UI_ACTIONS.CLEAR_NOTIFICATIONS });
  }, []);

  // ============================================
  // SIDEBAR ACTIONS
  // ============================================

  const toggleSidebar = useCallback(() => {
    dispatch({ type: UI_ACTIONS.TOGGLE_SIDEBAR });
  }, []);

  const openSidebar = useCallback(() => {
    dispatch({ type: UI_ACTIONS.OPEN_SIDEBAR });
  }, []);

  const closeSidebar = useCallback(() => {
    dispatch({ type: UI_ACTIONS.CLOSE_SIDEBAR });
  }, []);

  // ============================================
  // LOADING ACTIONS
  // ============================================

  const setGlobalLoading = useCallback((loading) => {
    dispatch({
      type: UI_ACTIONS.SET_GLOBAL_LOADING,
      payload: loading,
    });
  }, []);

  // ============================================
  // MOBILE MENU ACTIONS
  // ============================================

  const toggleMobileMenu = useCallback(() => {
    dispatch({ type: UI_ACTIONS.TOGGLE_MOBILE_MENU });
  }, []);

  // ============================================
  // DRAWER ACTIONS
  // ============================================

  const openDrawer = useCallback((content) => {
    dispatch({
      type: UI_ACTIONS.OPEN_DRAWER,
      payload: content,
    });
  }, []);

  const closeDrawer = useCallback(() => {
    dispatch({ type: UI_ACTIONS.CLOSE_DRAWER });
  }, []);

  // ============================================
  // SEARCH ACTIONS
  // ============================================

  const setSearchQuery = useCallback((query) => {
    dispatch({
      type: UI_ACTIONS.SET_SEARCH_QUERY,
      payload: query,
    });
  }, []);

  const clearSearchQuery = useCallback(() => {
    dispatch({ type: UI_ACTIONS.CLEAR_SEARCH_QUERY });
  }, []);

  // ============================================
  // VIEW MODE ACTIONS
  // ============================================

  const setViewMode = useCallback((mode) => {
    dispatch({
      type: UI_ACTIONS.SET_VIEW_MODE,
      payload: mode,
    });
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = {
    // State
    ...state,

    // Theme actions
    setTheme,
    toggleTheme,

    // Modal actions
    openModal,
    closeModal,
    closeAllModals,

    // Notification actions
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
    clearNotifications,

    // Sidebar actions
    toggleSidebar,
    openSidebar,
    closeSidebar,

    // Loading actions
    setGlobalLoading,

    // Mobile menu actions
    toggleMobileMenu,

    // Drawer actions
    openDrawer,
    closeDrawer,

    // Search actions
    setSearchQuery,
    clearSearchQuery,

    // View mode actions
    setViewMode,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
