/**
 * ProgressiveImage Component
 * Issue #421: Implement Progressive Image Loading with Blur-up Technique
 * 
 * A component that displays images with progressive loading and blur-up effect.
 * Shows a blurred placeholder while the full image loads, then smoothly transitions.
 */

import React, { useRef, useEffect, useState } from 'react';
import useProgressiveImage from '../hooks/useProgressiveImage';

const ProgressiveImage = ({
    src,
    placeholder,
    alt = '',
    className = '',
    style = {},
    onLoad,
    onError,
    lazy = true,
    ...props
}) => {
    const [isInView, setIsInView] = useState(!lazy);
    const imgRef = useRef(null);

    // Only load image when in viewport (lazy loading)
    useEffect(() => {
        if (!lazy || isInView) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading 50px before entering viewport
                threshold: 0.01
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (observer) {
                observer.disconnect();
            }
        };
    }, [lazy, isInView]);

    // Use progressive image hook only when image should be loaded
    const { currentSrc, isLoading, error, hasLoaded } = useProgressiveImage(
        isInView ? src : null,
        placeholder
    );

    // Call onLoad callback when image loads
    useEffect(() => {
        if (hasLoaded && onLoad) {
            onLoad();
        }
    }, [hasLoaded, onLoad]);

    // Call onError callback if error occurs
    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [error, onError]);

    // Show skeleton loader if no placeholder and still loading
    if (!currentSrc && isLoading) {
        return (
            <div
                ref={imgRef}
                className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
                style={style}
                aria-label="Loading image"
            />
        );
    }

    // Show error state
    if (error && !currentSrc) {
        return (
            <div
                ref={imgRef}
                className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}
                style={style}
            >
                <svg
                    className="w-12 h-12 text-gray-400 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </div>
        );
    }

    return (
        <img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            className={`transition-all duration-500 ${isLoading && placeholder ? 'blur-sm scale-105' : 'blur-0 scale-100'
                } ${className}`}
            style={{
                ...style,
                opacity: isLoading && placeholder ? 0.8 : 1
            }}
            loading={lazy ? 'lazy' : 'eager'}
            {...props}
        />
    );
};

export default ProgressiveImage;

/**
 * Example Usage:
 * 
 * // With placeholder (blur-up effect)
 * <ProgressiveImage
 *   src="/images/full-res.jpg"
 *   placeholder="/images/thumbnail.jpg"
 *   alt="Description"
 *   className="w-full h-auto"
 * />
 * 
 * // Without placeholder (skeleton fallback)
 * <ProgressiveImage
 *   src="/images/photo.jpg"
 *   alt="Photo"
 *   className="w-full rounded-lg"
 * />
 * 
 * // Disable lazy loading
 * <ProgressiveImage
 *   src="/images/hero.jpg"
 *   alt="Hero"
 *   lazy={false}
 * />
 */
