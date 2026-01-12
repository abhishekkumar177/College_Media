/**
 * SkeletonCard Component
 * Issue #369: Comprehensive Loading State System
 * 
 * Generic skeleton screen for card-based layouts
 */

import React from 'react';
import '../../styles/skeleton.css';

/**
 * SkeletonCard Component
 * 
 * Displays a generic animated skeleton card placeholder
 * 
 * @component
 * @returns {React.ReactElement} Skeleton card placeholder
 */
const SkeletonCard = () => {
    return (
        <div
            className="bg-white rounded-lg shadow-md p-4"
            role="status"
            aria-busy="true"
            aria-label="Loading content"
        >
            {/* Header/Title */}
            <div className="flex items-center gap-3 mb-4">
                <div className="skeleton skeleton-circle w-10 h-10 rounded-full"></div>
                <div className="flex-1">
                    <div className="skeleton skeleton-text h-4 w-1/2 mb-2 rounded"></div>
                    <div className="skeleton skeleton-text h-3 w-1/3 rounded"></div>
                </div>
            </div>

            {/* Body Content */}
            <div className="space-y-3">
                <div className="skeleton skeleton-text h-4 w-full rounded"></div>
                <div className="skeleton skeleton-text h-4 w-full rounded"></div>
                <div className="skeleton skeleton-text h-4 w-3/4 rounded"></div>
                <div className="skeleton skeleton-text h-32 w-full rounded mt-4"></div>
            </div>

            {/* Footer/Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <div className="skeleton skeleton-text h-8 w-24 rounded"></div>
                <div className="skeleton skeleton-text h-8 w-24 rounded"></div>
            </div>
        </div>
    );
};

export default SkeletonCard;
