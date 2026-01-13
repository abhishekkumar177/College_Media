import { useEffect } from 'react';
import { useThrottle } from './useThrottle';

/**
 * useInfiniteScroll hook
 * Triggers a callback when the user scrolls near the bottom of the page.
 * Uses throttling to prevent excessive event firing.
 * 
 * @param {Function} callback - Function to call when threshold is reached
 * @param {Object} options - Options object
 * @param {number} options.threshold - Distance from bottom in pixels (default: 300)
 * @param {boolean} options.hasMore - Whether there is more content to load
 * @param {boolean} options.loading - Whether content is currently loading
 * @param {number} options.throttleLimit - Time in ms to throttle the scroll event
 */
export const useInfiniteScroll = (callback, {
    threshold = 300,
    hasMore = true,
    loading = false,
    throttleLimit = 200
} = {}) => {

    const handleScroll = () => {
        if (loading || !hasMore) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - threshold) {
            callback();
        }
    };

    // Create a throttled version of the scroll handler
    const throttledScroll = useThrottle(handleScroll, throttleLimit);

    useEffect(() => {
        window.addEventListener('scroll', throttledScroll);
        return () => window.removeEventListener('scroll', throttledScroll);
    }, [throttledScroll]);
};

export default useInfiniteScroll;
