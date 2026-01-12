/**
 * LinearProgress Component
 * Issue #369: Comprehensive Loading State System
 * 
 * Linear progress bar for page loads and process tracking
 */

import React from 'react';
import '../../styles/skeleton.css';

/**
 * LinearProgress Component
 * 
 * Displays a linear progress bar, either determinate (0-100%) or indeterminate
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} [props.value] - Progress value (0-100). If omitted, renders indeterminate state
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.color] - Custom color (hex/rgb)
 * @returns {React.ReactElement} Linear progress bar
 */
const LinearProgress = ({ value, className = '', color }) => {
    const isIndeterminate = value === undefined || value === null;

    return (
        <div
            className={`progress-bar ${className}`}
            role="progressbar"
            aria-valuenow={isIndeterminate ? undefined : Math.round(value)}
            aria-valuemin="0"
            aria-valuemax="100"
        >
            {isIndeterminate ? (
                <div
                    className="progress-bar-indeterminate"
                    style={color ? { background: color } : {}}
                ></div>
            ) : (
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `${Math.min(100, Math.max(0, value))}%`,
                        ...(color ? { background: color } : {})
                    }}
                ></div>
            )}
        </div>
    );
};

export default LinearProgress;
