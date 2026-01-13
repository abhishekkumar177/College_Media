/**
 * useProgressiveImage Hook
 * Issue #421: Implement Progressive Image Loading with Blur-up Technique
 * 
 * A custom hook for progressive image loading with blur-up effect.
 * Loads a low-quality placeholder first, then smoothly transitions to full image.
 */

import { useState, useEffect } from 'react';

/**
 * useProgressiveImage
 * 
 * @param {string} src - Full resolution image URL
 * @param {string} [placeholder] - Low-quality image placeholder (LQIP) or blur hash
 * @returns {Object} { currentSrc, isLoading, error, hasLoaded }
 */
const useProgressiveImage = (src, placeholder = null) => {
    const [currentSrc, setCurrentSrc] = useState(placeholder || src);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        if (!src) {
            setIsLoading(false);
            return;
        }

        // Reset state when src changes
        setIsLoading(true);
        setError(null);
        setHasLoaded(false);

        // If we have a placeholder, show it first
        if (placeholder) {
            setCurrentSrc(placeholder);
        }

        // Create new image object to preload
        const img = new Image();

        img.onload = () => {
            // Smooth transition to full image
            setCurrentSrc(src);
            setIsLoading(false);
            setHasLoaded(true);
        };

        img.onerror = (err) => {
            console.error('Failed to load image:', src, err);
            setError('Failed to load image');
            setIsLoading(false);

            // Keep placeholder if available, otherwise show error
            if (!placeholder) {
                setCurrentSrc(null);
            }
        };

        // Start loading the full image
        img.src = src;

        // Cleanup
        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src, placeholder]);

    return {
        currentSrc,
        isLoading,
        error,
        hasLoaded
    };
};

export default useProgressiveImage;
