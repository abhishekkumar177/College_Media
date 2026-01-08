import { useState, useCallback, useRef } from 'react';
import { useError } from '../context/ErrorContext';

/**
 * Custom hook for handling API calls with loading, error states, and retry logic
 * 
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} API state and methods
 */
export const useApi = (apiFunction, options = {}) => {
  const {
    retries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = false
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const retryCount = useRef(0);
  const abortController = useRef(null);
  const { showError, showSuccess } = useError();

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    retryCount.current = 0;

    // Create new abort controller for this request
    abortController.current = new AbortController();

    const attemptRequest = async (currentRetry = 0) => {
      try {
        const result = await apiFunction(...args, {
          signal: abortController.current.signal
        });

        setData(result);
        setLoading(false);
        
        if (showSuccessToast && onSuccess) {
          const successMessage = onSuccess(result);
          if (successMessage) {
            showSuccess(successMessage);
          }
        }

        return result;
      } catch (err) {
        // Don't retry if request was cancelled
        if (err.name === 'AbortError') {
          setLoading(false);
          return;
        }

        // Retry logic
        if (currentRetry < retries) {
          retryCount.current = currentRetry + 1;
          
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, currentRetry);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return attemptRequest(currentRetry + 1);
        }

        // All retries failed
        const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'An unexpected error occurred';

        setError(errorMessage);
        setLoading(false);

        if (showErrorToast) {
          showError(errorMessage);
        }

        if (onError) {
          onError(err);
        }

        throw err;
      }
    };

    return attemptRequest();
  }, [apiFunction, retries, retryDelay, onSuccess, onError, showErrorToast, showSuccessToast, showError, showSuccess]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    retryCount.current = 0;
  }, []);

  const cancel = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    cancel,
    retryCount: retryCount.current
  };
};

/**
 * Hook for GET requests
 */
export const useGet = (url, options = {}) => {
  const apiFn = async (signal) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...signal && { signal }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  return useApi(apiFn, options);
};

/**
 * Hook for POST requests
 */
export const usePost = (url, options = {}) => {
  const apiFn = async (data, signal) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...signal && { signal }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  return useApi(apiFn, options);
};

/**
 * Hook for PUT requests
 */
export const usePut = (url, options = {}) => {
  const apiFn = async (data, signal) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...signal && { signal }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  return useApi(apiFn, options);
};

/**
 * Hook for DELETE requests
 */
export const useDelete = (url, options = {}) => {
  const apiFn = async (signal) => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      ...signal && { signal }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  return useApi(apiFn, options);
};
