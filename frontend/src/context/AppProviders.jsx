/**
 * App Providers
 * Combines all context providers in the correct order
 */

import React from 'react';
import { AuthProvider } from './AuthContext';
import { PostsProvider } from './PostsContext';
import { UIProvider } from './UIContext';
import { SettingsProvider } from './SettingsContext';

/**
 * AppProviders component
 * Wraps all context providers for the entire app
 * 
 * Order matters:
 * 1. UIProvider - Independent, no dependencies
 * 2. SettingsProvider - Independent, manages font size and theme
 * 3. AuthProvider - May use UI for notifications
 * 4. PostsProvider - May use Auth for user-specific data
 */
export const AppProviders = ({ children }) => {
  return (
    <UIProvider>
      <SettingsProvider>
        <AuthProvider>
          <PostsProvider>
            {children}
          </PostsProvider>
        </AuthProvider>
      </SettingsProvider>
    </UIProvider>
  );
};

export default AppProviders;
