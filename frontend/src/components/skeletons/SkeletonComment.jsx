/**
 * SkeletonComment Component
 * Issue #369: Comprehensive Loading State System
 * 
 * Skeleton screen for comment items
 */

import React from 'react';
import '../../styles/skeleton.css';

/**
 * SkeletonComment Component
 * 
 * Displays an animated skeleton placeholder for comments
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.count - Number of skeleton comments to render (default: 3)
 * @returns {React.ReactElement} Skeleton comment placeholder
 */
const SkeletonComment = ({ count = 3 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="flex gap-3 mb-4 last:mb-0"
                    role="status"
                    aria-busy="true"
                    aria-label="Loading comment"
                >
                    {/* Avatar */}
                    <div className="skeleton skeleton-avatar w-8 h-8 rounded-full flex-shrink-0"></div>

                    {/* Comment Body */}
                    <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                            {/* Username */}
                            <div className="skeleton skeleton-text h-3 w-24 mb-2 rounded"></div>

                            {/* Comment text */}
                            <div className="space-y-1">
                                <div className="skeleton skeleton-text h-3 w-full rounded"></div>
                                <div className="skeleton skeleton-text h-3 w-4/5 rounded"></div>
                            </div>
                        </div>

                        {/* Actions (Like, Reply, Timestamp) */}
                        <div className="flex gap-4 mt-1 ml-2">
                            <div className="skeleton skeleton-text h-2 w-10 rounded"></div>
                            <div className="skeleton skeleton-text h-2 w-10 rounded"></div>
                            <div className="skeleton skeleton-text h-2 w-16 rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default SkeletonComment;
