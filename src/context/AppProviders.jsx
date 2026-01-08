/**
 * App Providers
 * Combines all context providers in the correct order
 */

import React from 'react';
import { AuthProvider } from './AuthContext';
import { PostsProvider } from './PostsContext';
import { UIProvider } from './UIContext';

/**
 * AppProviders component
 * Wraps all context providers for the entire app
 * 
 * Order matters:
 * 1. UIProvider - Independent, no dependencies
 * 2. AuthProvider - May use UI for notifications
 * 3. PostsProvider - May use Auth for user-specific data
 */
export const AppProviders = ({ children }) => {
  return (
    <UIProvider>
      <AuthProvider>
        <PostsProvider>
          {children}
        </PostsProvider>
      </AuthProvider>
    </UIProvider>
  );
};

export default AppProviders;
