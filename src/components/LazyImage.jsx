import React, { useState, useRef, useEffect } from 'react';

/**
 * LazyImage Component
 * Implements lazy loading using Intersection Observer API
 * Shows blur placeholder or skeleton until image loads
 */
const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder = 'blur',
  onLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
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
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const renderPlaceholder = () => {
    if (placeholder === 'skeleton') {
      return (
        <div
          className={`animate-pulse bg-gray-200 ${className}`}
          ref={imgRef}
          aria-hidden="true"
        />
      );
    }

    // Default blur placeholder
    return (
      <div
        className={`bg-gray-200 blur-sm ${className}`}
        ref={imgRef}
        style={{
          backgroundImage: `url(data:image/svg+xml;base64,${btoa(`
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#e5e7eb"/>
              <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#9ca3af" text-anchor="middle" dy=".3em">Loading...</text>
            </svg>
          `)})`,
          backgroundSize: 'cover',
        }}
        aria-hidden="true"
      />
    );
  };

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center text-gray-500 text-sm ${className}`}
        role="img"
        aria-label="Image failed to load"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4h2v4h-2zm0-6V7h2v4h-2z"/>
        </svg>
      </div>
    );
  }

  return (
    <div className="relative">
      {!isInView && renderPlaceholder()}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
      {isInView && !isLoaded && (
        <div className={`absolute inset-0 ${placeholder === 'skeleton' ? 'animate-pulse bg-gray-200' : 'bg-gray-200 blur-sm'} ${className}`} />
      )}
    </div>
  );
};

export default LazyImage;