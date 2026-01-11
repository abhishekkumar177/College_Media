/**
 * CircularProgress Component
 * Issue #369: Comprehensive Loading State System
 * 
 * Circular spinner/progress for button actions and compact loading states
 */

import React from 'react';
import '../../styles/skeleton.css';

/**
 * CircularProgress Component
 * 
 * Displays a circular spinner or progress indicator
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Size: 'sm', 'md', 'lg'
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.color] - Custom border color
 * @returns {React.ReactElement} Circular loader
 */
const CircularProgress = ({ size = 'md', className = '', color }) => {
    const sizeClass = {
        sm: 'circular-progress-sm',
        md: '',
        lg: 'circular-progress-lg'
    }[size] || '';

    return (
        <div
            className={`circular-progress ${sizeClass} ${className}`}
            style={color ? { borderTopColor: color } : {}}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default CircularProgress;
