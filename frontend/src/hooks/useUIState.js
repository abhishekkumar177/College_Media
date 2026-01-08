/**
 * useUIState Hook
 * Easy access to UI state and actions
 */

import { useContext } from 'react';
import { UIContext } from '../context/UIContext';

/**
 * Hook to access UI context
 * @throws {Error} If used outside UIProvider
 * @returns {Object} UI state and actions
 */
export const useUIState = () => {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error('useUIState must be used within a UIProvider');
  }

  return context;
};

/**
 * Hook to get current theme
 * @returns {string} Current theme
 */
export const useTheme = () => {
  const { theme } = useUIState();
  return theme;
};

/**
 * Hook to get theme actions
 * @returns {Object} Theme action methods
 */
export const useThemeActions = () => {
  const { setTheme, toggleTheme } = useUIState();
  return { setTheme, toggleTheme };
};

/**
 * Hook to manage modals
 * @returns {Object} Modal state and actions
 */
export const useModals = () => {
  const { modals, openModal, closeModal, closeAllModals } = useUIState();
  return { modals, openModal, closeModal, closeAllModals };
};

/**
 * Hook to check if a specific modal is open
 * @param {string} modalType - Type of modal
 * @returns {boolean} Whether modal is open
 */
export const useIsModalOpen = (modalType) => {
  const { modals } = useUIState();
  return modals.open.includes(modalType);
};

/**
 * Hook to get modal data
 * @param {string} modalType - Type of modal
 * @returns {any} Modal data
 */
export const useModalData = (modalType) => {
  const { modals } = useUIState();
  return modals.data[modalType];
};

/**
 * Hook to manage notifications
 * @returns {Object} Notification state and actions
 */
export const useNotifications = () => {
  const {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
    clearNotifications,
  } = useUIState();

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
    clearNotifications,
  };
};

/**
 * Hook to manage sidebar
 * @returns {Object} Sidebar state and actions
 */
export const useSidebar = () => {
  const { sidebar, toggleSidebar, openSidebar, closeSidebar } = useUIState();
  return { sidebar, toggleSidebar, openSidebar, closeSidebar };
};

/**
 * Hook to manage mobile menu
 * @returns {Object} Mobile menu state and actions
 */
export const useMobileMenu = () => {
  const { mobileMenu, toggleMobileMenu } = useUIState();
  return { mobileMenu, toggleMobileMenu };
};

/**
 * Hook to manage drawer
 * @returns {Object} Drawer state and actions
 */
export const useDrawer = () => {
  const { drawer, openDrawer, closeDrawer } = useUIState();
  return { drawer, openDrawer, closeDrawer };
};

/**
 * Hook to manage search
 * @returns {Object} Search state and actions
 */
export const useSearch = () => {
  const { search, setSearchQuery, clearSearchQuery } = useUIState();
  return { search, setSearchQuery, clearSearchQuery };
};

/**
 * Hook to manage view mode
 * @returns {Object} View mode state and action
 */
export const useViewMode = () => {
  const { viewMode, setViewMode } = useUIState();
  return { viewMode, setViewMode };
};

/**
 * Hook to get global loading state
 * @returns {boolean} Global loading state
 */
export const useGlobalLoading = () => {
  const { isGlobalLoading } = useUIState();
  return isGlobalLoading;
};

/**
 * Hook to get UI actions
 * @returns {Object} UI action methods
 */
export const useUIActions = () => {
  const context = useUIState();

  return {
    // Theme
    setTheme: context.setTheme,
    toggleTheme: context.toggleTheme,

    // Modals
    openModal: context.openModal,
    closeModal: context.closeModal,
    closeAllModals: context.closeAllModals,

    // Notifications
    showNotification: context.showNotification,
    showSuccess: context.showSuccess,
    showError: context.showError,
    showWarning: context.showWarning,
    showInfo: context.showInfo,
    hideNotification: context.hideNotification,
    clearNotifications: context.clearNotifications,

    // Sidebar
    toggleSidebar: context.toggleSidebar,
    openSidebar: context.openSidebar,
    closeSidebar: context.closeSidebar,

    // Loading
    setGlobalLoading: context.setGlobalLoading,

    // Mobile menu
    toggleMobileMenu: context.toggleMobileMenu,

    // Drawer
    openDrawer: context.openDrawer,
    closeDrawer: context.closeDrawer,

    // Search
    setSearchQuery: context.setSearchQuery,
    clearSearchQuery: context.clearSearchQuery,

    // View mode
    setViewMode: context.setViewMode,
  };
};
