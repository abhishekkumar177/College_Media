/**
 * SkeletonNotification Component
 * Issue #369: Comprehensive Loading State System
 * 
 * Skeleton screen for notification items
 */

import React from 'react';
import '../../styles/skeleton.css';

/**
 * SkeletonNotification Component
 * 
 * Displays an animated skeleton placeholder for notification items
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.count - Number of skeleton notifications to render (default: 5)
 * @returns {React.ReactElement} Skeleton notification placeholder
 */
const SkeletonNotification = ({ count = 5 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50"
                    role="status"
                    aria-busy="true"
                    aria-label="Loading notification"
                >
                    {/* Avatar */}
                    <div className="skeleton skeleton-avatar w-10 h-10 rounded-full flex-shrink-0"></div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Notification text */}
                        <div className="space-y-2">
                            <div className="skeleton skeleton-text h-4 w-full rounded"></div>
                            <div className="skeleton skeleton-text h-4 w-4/5 rounded"></div>
                        </div>

                        {/* Timestamp */}
                        <div className="skeleton skeleton-text h-3 w-20 mt-2 rounded"></div>
                    </div>

                    {/* Action icon or thumbnail */}
                    <div className="skeleton skeleton-circle w-12 h-12 rounded flex-shrink-0"></div>
                </div>
            ))}
        </>
    );
};

export default SkeletonNotification;
