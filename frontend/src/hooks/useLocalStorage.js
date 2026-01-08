/**
 * useLocalStorage Hook
 * Custom hook for persistent state in localStorage
 */

import { useState, useEffect, useCallback } from "react";

/**
 * Hook to manage state synced with localStorage
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {[any, Function, Function]} [value, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook to manage boolean state in localStorage
 * @param {string} key - localStorage key
 * @param {boolean} initialValue - Initial boolean value
 * @returns {[boolean, Function, Function]} [value, toggle, setValue]
 */
export const useLocalStorageBoolean = (key, initialValue = false) => {
  const [value, setValue] = useLocalStorage(key, initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, [setValue]);

  return [value, toggle, setValue];
};

/**
 * Hook to manage object state in localStorage
 * @param {string} key - localStorage key
 * @param {Object} initialValue - Initial object value
 * @returns {[Object, Function, Function, Function]} [value, setValue, updateValue, removeValue]
 */
export const useLocalStorageObject = (key, initialValue = {}) => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);

  const updateValue = useCallback(
    (updates) => {
      setValue((prev) => ({ ...prev, ...updates }));
    },
    [setValue]
  );

  return [value, setValue, updateValue, removeValue];
};

/**
 * Hook to manage array state in localStorage
 * @param {string} key - localStorage key
 * @param {Array} initialValue - Initial array value
 * @returns {[Array, Function, Function, Function, Function]} [value, setValue, addItem, removeItem, clearArray]
 */
export const useLocalStorageArray = (key, initialValue = []) => {
  const [value, setValue] = useLocalStorage(key, initialValue);

  const addItem = useCallback(
    (item) => {
      setValue((prev) => [...prev, item]);
    },
    [setValue]
  );

  const removeItem = useCallback(
    (index) => {
      setValue((prev) => prev.filter((_, i) => i !== index));
    },
    [setValue]
  );

  const clearArray = useCallback(() => {
    setValue([]);
  }, [setValue]);

  return [value, setValue, addItem, removeItem, clearArray];
};

export default useLocalStorage;
