/**
 * useLoadingState Hook
 * Issue #369: Comprehensive Loading State System
 * 
 * Custom hook for components to manage their loading states easily
 */

import { useState, useCallback, useEffect } from 'react';
import { useLoadingContext } from '../context/LoadingContext';

/**
 * useLoadingState Hook
 * 
 * @param {string} [key] - Optional unique key for global tracking. If omitted, uses local state.
 * @param {boolean} [initialState=false] - Initial loading state
 * @returns {Object} Loading state tools
 */
const useLoadingState = (key, initialState = false) => {
    // Use context if key provided, otherwise local state
    const context = key ? useLoadingContext() : null;
    const [localLoading, setLocalLoading] = useState(initialState);

    /**
     * Set loading state
     * @param {boolean} isLoading - New loading state
     */
    const setLoading = useCallback((isLoading) => {
        if (key && context) {
            if (isLoading) {
                context.startLoading(key);
            } else {
                context.stopLoading(key);
            }
        } else {
            setLocalLoading(isLoading);
        }
    }, [key, context]);

    /**
     * Wrap an async function with loading state
     * @param {Function} asyncFn - Async function to execute
     * @returns {Promise<any>} Result of async function
     */
    const withLoading = useCallback(async (asyncFn) => {
        try {
            setLoading(true);
            const result = await asyncFn();
            return result;
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // Determine current loading state
    const isLoading = key && context ? context.isLoading(key) : localLoading;

    // Cleanup on unmount if using global state
    useEffect(() => {
        return () => {
            if (key && context && isLoading) {
                context.stopLoading(key);
            }
        };
    }, [key, context, isLoading]);

    return {
        isLoading,
        setLoading,
        withLoading,
        startLoading: () => setLoading(true),
        stopLoading: () => setLoading(false)
    };
};

export default useLoadingState;
