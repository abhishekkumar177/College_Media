/**
 * LoadingContext
 * Issue #369: Comprehensive Loading State System
 * 
 * Provides centralized loading state management for the application
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import LinearProgress from '../components/loaders/LinearProgress';

const LoadingContext = createContext(null);

/**
 * LoadingProvider Component
 * 
 * Wraps the application to provide loading state capabilities
 * Includes a global loading bar for page transitions/major actions
 */
export const LoadingProvider = ({ children }) => {
    // Global loading state (shows top progress bar)
    const [isGlobalLoading, setIsGlobalLoading] = useState(false);

    // Track individual loading states by key
    const [loadingStates, setLoadingStates] = useState({});

    /**
     * Start loading for a specific key
     * @param {string} key - Unique identifier for the loading state
     */
    const startLoading = useCallback((key) => {
        setLoadingStates(prev => ({ ...prev, [key]: true }));
    }, []);

    /**
     * Stop loading for a specific key
     * @param {string} key - Unique identifier for the loading state
     */
    const stopLoading = useCallback((key) => {
        setLoadingStates(prev => ({ ...prev, [key]: false }));
    }, []);

    /**
     * Check if a specific key is loading
     * @param {string} key - Unique identifier for the loading state
     * @returns {boolean} True if loading
     */
    const isLoading = useCallback((key) => {
        return !!loadingStates[key];
    }, [loadingStates]);

    /**
     * Start global loading (shows top bar)
     */
    const startGlobalLoading = useCallback(() => {
        setIsGlobalLoading(true);
    }, []);

    /**
     * Stop global loading
     */
    const stopGlobalLoading = useCallback(() => {
        setIsGlobalLoading(false);
    }, []);

    return (
        <LoadingContext.Provider
            value={{
                startLoading,
                stopLoading,
                isLoading,
                startGlobalLoading,
                stopGlobalLoading,
                loadingStates
            }}
        >
            {/* Global Progress Bar */}
            {isGlobalLoading && (
                <div className="fixed top-0 left-0 right-0 z-[9999]">
                    <LinearProgress className="h-1 rounded-none" />
                </div>
            )}
            {children}
        </LoadingContext.Provider>
    );
};

/**
 * useLoadingContext Hook
 * 
 * Internal hook to access loading context
 */
export const useLoadingContext = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoadingContext must be used within a LoadingProvider');
    }
    return context;
};
