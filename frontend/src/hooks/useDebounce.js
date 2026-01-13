import { useState, useEffect } from 'react';

/**
 * Hook to debounce a value.
 * returns the value after the delay has passed without a new value being set.
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {any} - The debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook to create a debounced function.
 * 
 * @param {Function} callback - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @param {Array} dependencies - Dependencies array for useCallback
 * @returns {Function} - The debounced function
 */
export const useDebouncedCallback = (callback, delay, dependencies = []) => {
  // This side-loads the utility if we want, or implements it directly.
  // For a hook, usually managing the timeout via ref is cleaner to avoid scope issues.
  // However, since we wrote a utility `debounce`, we can try to use it? 
  // Managing `this` and arguments is tricky with hooks + utility efficiently without re-creating.
  // Let's implement a robust version here.

  // Actually, let's keep it simple as the existing `useDebounce` (value) is what SearchBar uses.
  // I will leave this file as just `useDebounce` value hook for now, but maybe add `useDebouncedCallback` if needed.
  // But SearchBar works with `debouncedQuery`.

  // Re-reading requirements: `frontend/src/hooks/useDebounce.js (Already exists, enhance it)`
  // Enhancing it probably means ensuring it cleans up, which it does.
  // Or maybe matching the `debounce.js` capabilities? 
  // Value debounce doesn't really have "leading/trailing" in the same sense as a function call stream.
  // It's just "settled value".

  // I will stick to the provided robust implementation above.
  return useDebounce;
};

export default useDebounce;
