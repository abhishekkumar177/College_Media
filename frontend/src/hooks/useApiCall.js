/**
 * useApiCall Hook
 * Issue #349: Enhanced API Error Handling and Retry Logic
 * 
 * Custom hook for making API calls with built-in error handling,
 * loading states, and retry logic
 */

import { useState, useCallback } from 'react';
import { handleApiError, isRetryableError } from '../utils/apiErrorHandler';

/**
 * Custom hook for API calls with error handling
 * 
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} API call state and methods
 * 
 * @example
 * const { execute, loading, error, data } = useApiCall(postsApi.create);
 * await execute({ title: 'New Post', content: '...' });
 */
export const useApiCall = (apiFunction, options = {}) => {
    const {
        onSuccess = null,
        onError = null,
        showErrorToast = true,
        customErrorMessage = null,
    } = options;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    /**
     * Execute the API call
     */
    const execute = useCallback(
        async (...args) => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiFunction(...args);
                setData(response);

                // Call success callback if provided
                if (onSuccess) {
                    onSuccess(response);
                }

                return response;
            } catch (err) {
                setError(err);

                // Handle error with toast notification
                const errorInfo = handleApiError(err, {
                    showToast: showErrorToast,
                    customMessage: customErrorMessage,
                });

                // Call error callback if provided
                if (onError) {
                    onError(err, errorInfo);
                }

                throw err;
            } finally {
                setLoading(false);
            }
        },
        [apiFunction, onSuccess, onError, showErrorToast, customErrorMessage]
    );

    /**
     * Reset the state
     */
    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setData(null);
    }, []);

    return {
        execute,
        loading,
        error,
        data,
        reset,
        isRetryable: error ? isRetryableError(error) : false,
    };
};

/**
 * Custom hook for API calls with manual retry
 * 
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} API call state and methods with retry
 */
export const useApiCallWithRetry = (apiFunction, options = {}) => {
    const {
        maxRetries = 3,
        retryDelay = 1000,
        ...apiCallOptions
    } = options;

    const [retryCount, setRetryCount] = useState(0);
    const apiCall = useApiCall(apiFunction, apiCallOptions);

    /**
     * Execute with manual retry logic
     */
    const executeWithRetry = useCallback(
        async (...args) => {
            let lastError;

            for (let i = 0; i <= maxRetries; i++) {
                try {
                    const result = await apiCall.execute(...args);
                    setRetryCount(0);
                    return result;
                } catch (err) {
                    lastError = err;
                    setRetryCount(i + 1);

                    // Don't retry if error is not retryable or max retries reached
                    if (!isRetryableError(err) || i === maxRetries) {
                        throw err;
                    }

                    // Wait before retrying
                    await new Promise((resolve) => setTimeout(resolve, retryDelay * (i + 1)));
                }
            }

            throw lastError;
        },
        [apiCall, maxRetries, retryDelay]
    );

    /**
     * Manual retry of last failed request
     */
    const retry = useCallback(() => {
        setRetryCount(0);
        apiCall.reset();
    }, [apiCall]);

    return {
        ...apiCall,
        executeWithRetry,
        retry,
        retryCount,
        canRetry: apiCall.error && isRetryableError(apiCall.error),
    };
};

export default useApiCall;
