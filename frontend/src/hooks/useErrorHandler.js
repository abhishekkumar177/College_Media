/**
 * useErrorHandler Hook
 * Issue #368: Error Boundary System
 * 
 * A custom hook that allows functional components to catch and handle errors
 * or throw them to the nearest Error Boundary.
 */

import { useState, useCallback } from 'react';

/**
 * Hook to imperative throw an error to the nearest ErrorBoundary
 * 
 * @example
 * const handleError = useErrorHandler();
 * try {
 *   // do something
 * } catch (error) {
 *   handleError(error);
 * }
 */
const useErrorHandler = (givenError) => {
    const [error, setError] = useState(null);

    if (givenError) throw givenError;
    if (error) throw error;

    const handleError = useCallback((error) => {
        setError(error);
    }, []);

    return handleError;
};

export default useErrorHandler;
