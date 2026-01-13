import { useRef, useEffect, useCallback } from 'react';
import { throttle } from '../utils/throttle';

/**
 * A hook that returns a throttled version of the passed function.
 * 
 * @param {Function} callback - The function to throttle
 * @param {number} delay - The throttle delay in milliseconds
 * @param {Array} dependencies - Dependencies array for useCallback (default: [])
 * @returns {Function} - The throttled function
 */
export const useThrottle = (callback, delay, dependencies = []) => {
    const throttledRef = useRef(null);

    useEffect(() => {
        throttledRef.current = throttle(callback, delay, { leading: true, trailing: true });

        return () => {
            if (throttledRef.current) {
                throttledRef.current.cancel();
            }
        };
    }, [callback, delay, ...dependencies]);

    return useCallback((...args) => {
        if (throttledRef.current) {
            return throttledRef.current(...args);
        }
    }, [throttledRef]);
};

/**
 * A hook that returns a throttled value.
 * Used for UI updates that don't need to happen as fast as the state changes.
 * 
 * @param {any} value - The value to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {any} - The throttled value
 */
export const useThrottledValue = (value, limit) => {
    const [throttledValue, setThrottledValue] = useState(value);
    const lastRan = useRef(Date.now());

    useEffect(() => {
        const handler = setTimeout(function () {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, limit - (Date.now() - lastRan.current));

        return () => {
            clearTimeout(handler);
        };
    }, [value, limit]);

    return throttledValue;
};

export default useThrottle;
