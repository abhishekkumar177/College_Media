/**
 * Loading Overlay Component
 * Issue #250: Global loading indicator
 */

import { Icon } from '@iconify/react';

const LoadingOverlay = ({ message = 'Loading...', progress = null }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={message}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm mx-4">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>

          {/* Message */}
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {message}
            </p>
            {progress !== null && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {progress}% complete
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {progress !== null && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;

/**
 * Inline Loading Spinner
 */
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-indigo-600 border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Loading Button
 */
export const LoadingButton = ({ loading, children, disabled, ...props }) => {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`relative ${props.className || ''}`}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </span>
      )}
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
    </button>
  );
};

/**
 * Loading State Component
 */
export const LoadingState = ({ title = 'Loading', description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size="lg" />
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
          {description}
        </p>
      )}
    </div>
  );
};
