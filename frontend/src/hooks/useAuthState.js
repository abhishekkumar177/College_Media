/**
 * useAuthState Hook
 * Easy access to auth state and actions
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook to access auth context
 * @throws {Error} If used outside AuthProvider
 * @returns {Object} Auth state and actions
 */
export const useAuthState = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }

  return context;
};

/**
 * Hook to check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAuthState();
  return isAuthenticated;
};

/**
 * Hook to get current user
 * @returns {Object|null} Current user object or null
 */
export const useCurrentUser = () => {
  const { user } = useAuthState();
  return user;
};

/**
 * Hook to get auth token
 * @returns {string|null} Auth token or null
 */
export const useAuthToken = () => {
  const { token } = useAuthState();
  return token;
};

/**
 * Hook to get auth actions
 * @returns {Object} Auth action methods
 */
export const useAuthActions = () => {
  const context = useAuthState();

  return {
    loginStart: context.loginStart,
    loginSuccess: context.loginSuccess,
    loginFailure: context.loginFailure,
    logout: context.logout,
    registerStart: context.registerStart,
    registerSuccess: context.registerSuccess,
    registerFailure: context.registerFailure,
    setUser: context.setUser,
    updateUser: context.updateUser,
    clearUser: context.clearUser,
    setToken: context.setToken,
    refreshToken: context.refreshToken,
    clearToken: context.clearToken,
    setAuthError: context.setAuthError,
    clearAuthError: context.clearAuthError,
    setLoading: context.setLoading,
  };
};
