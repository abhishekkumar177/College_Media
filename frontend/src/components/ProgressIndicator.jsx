import React, { useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

/**
 * Accessible Progress Indicator Component
 * Issue #246: WCAG 2.1 AA progress indicators
 */
const ProgressIndicator = ({
  id,
  label = 'Loading...',
  value = 0,
  max = 100,
  showPercentage = true,
  className = '',
  size = 'medium',
  variant = 'linear'
}) => {
  const { getProgressIndicator } = useAccessibility();
  const progressRef = useRef(null);

  const indicator = getProgressIndicator(id);

  // Sync with context if id provided
  useEffect(() => {
    if (id && indicator) {
      // Update local value if context has different value
      if (indicator.value !== value) {
        // This would be handled by the component using the indicator
      }
    }
  }, [id, indicator, value]);

  const currentValue = indicator ? indicator.value : value;
  const currentLabel = indicator ? indicator.label : label;
  const percentage = Math.round((currentValue / max) * 100);

  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3'
  };

  const variantClasses = {
    linear: 'bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
    circular: 'relative rounded-full bg-gray-200 dark:bg-gray-700'
  };

  if (variant === 'circular') {
    const radius = size === 'small' ? 12 : size === 'large' ? 24 : 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div
        className={`inline-flex items-center space-x-2 ${className}`}
        role="progressbar"
        aria-valuenow={currentValue}
        aria-valuemin="0"
        aria-valuemax={max}
        aria-label={currentLabel}
      >
        <svg
          width={radius * 2 + 4}
          height={radius * 2 + 4}
          className="transform -rotate-90"
        >
          <circle
            cx={radius + 2}
            cy={radius + 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-gray-300 dark:text-gray-600"
          />
          <circle
            cx={radius + 2}
            cy={radius + 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="text-blue-600 dark:text-blue-400 transition-all duration-300 ease-in-out"
            strokeLinecap="round"
          />
        </svg>
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {percentage}%
          </span>
        )}
        <span className="sr-only">
          {currentLabel} {showPercentage ? `${percentage}% complete` : ''}
        </span>
      </div>
    );
  }

  return (
    <div className={`progress-indicator ${className}`}>
      <div
        ref={progressRef}
        className={variantClasses[variant]}
        role="progressbar"
        aria-valuenow={currentValue}
        aria-valuemin="0"
        aria-valuemax={max}
        aria-label={currentLabel}
      >
        <div
          className={`bg-blue-600 dark:bg-blue-400 transition-all duration-300 ease-in-out ${sizeClasses[size]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {(showPercentage || currentLabel !== 'Loading...') && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentLabel}
          </span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {percentage}%
            </span>
          )}
        </div>
      )}

      <span className="sr-only">
        {currentLabel} {showPercentage ? `${percentage}% complete` : ''}
      </span>
    </div>
  );
};

export default ProgressIndicator;