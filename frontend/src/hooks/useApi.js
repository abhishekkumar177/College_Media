import { useState, useCallback, useRef } from 'react';
import { useError } from '../context/ErrorContext';

// Global cache store (in-memory)
const cacheStore = new Map();

/**
 * Custom hook for handling API calls with loading, error states, and retry logic
 * with optional client-side caching.
 * 
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @param {boolean} [options.cache] - Whether to cache the response
 * @param {number} [options.ttl] - Time to live in milliseconds (default: 5 minutes)
 * @param {string} [options.cacheKey] - Unique key for caching (required if cache is true)
 * @returns {Object} API state and methods
 */
export const useApi = (apiFunction, options = {}) => {
  const {
    retries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = false,
    cache = false,
    ttl = 300000, // 5 minutes default
    cacheKey
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

    // Cache Check
    const effectiveKey = cacheKey ? `${cacheKey}-${JSON.stringify(args)}` : null;

    if (cache && effectiveKey) {
      const cachedItem = cacheStore.get(effectiveKey);
      if (cachedItem) {
        if (Date.now() - cachedItem.timestamp < ttl) {
          // Cache Hit
          setData(cachedItem.data);
          setLoading(false);
          // Still optionally trigger onSuccess for side effects, but arguably shouldn't?
          // Usually cached data implies "silent" load. 
          // But to be consistent with "data loaded", let's leave it.
          if (onSuccess) onSuccess(cachedItem.data);
          return cachedItem.data;
        } else {
          // Cache Expired
          cacheStore.delete(effectiveKey);
        }
      }
    }

    // Create new abort controller for this request
    abortController.current = new AbortController();

    const attemptRequest = async (currentRetry = 0) => {
      try {
        const result = await apiFunction(...args, {
          signal: abortController.current.signal
        });

        const resultData = result; // Assuming apiFunction returns the data directly or response

        setData(resultData);
        setLoading(false);

        // Save to cache
        if (cache && effectiveKey) {
          cacheStore.set(effectiveKey, {
            data: resultData,
            timestamp: Date.now()
          });
        }

        if (showSuccessToast && onSuccess) {
          const successMessage = onSuccess(resultData);
          if (successMessage) {
            showSuccess(successMessage);
          }
        } else if (onSuccess) {
          onSuccess(resultData);
        }

        return resultData;
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
  }, [apiFunction, retries, retryDelay, onSuccess, onError, showErrorToast, showSuccessToast, showError, showSuccess, cache, ttl, cacheKey]);

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

  // Helper to manually clear cache
  const clearCache = useCallback(() => {
    if (cacheKey) {
      // Clear all keys starting with cacheKey (simple approach) or exact match
      for (const key of cacheStore.keys()) {
        if (key.startsWith(cacheKey)) {
          cacheStore.delete(key);
        }
      }
    } else {
      cacheStore.clear();
    }
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    cancel,
    retryCount: retryCount.current,
    clearCache
  };
};

/**
 * Hook for GET requests
 */
export const useGet = (url, options = {}) => {
  const apiFn = async (signalObj) => {
    // Handle signal being passed (it's the last arg usually)
    const signal = signalObj?.signal;

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

  // Default cacheKey to URL if not provided
  return useApi(apiFn, { cacheKey: url, ...options });
};

/**
 * Hook for POST requests
 */
export const usePost = (url, options = {}) => {
  const apiFn = async (data, signalObj) => {
    const signal = signalObj?.signal;

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
  const apiFn = async (data, signalObj) => {
    const signal = signalObj?.signal;

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
  const apiFn = async (signalObj) => {
    const signal = signalObj?.signal;

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
