/**
 * SkeletonPost Component
 * Issue #369: Comprehensive Loading State System
 * 
 * Skeleton screen that mimics the structure of a post card
 * while content is loading. Provides visual feedback and
 * improves perceived performance.
 */

import React from 'react';
import '../../styles/skeleton.css';

/**
 * SkeletonPost Component
 * 
 * Displays an animated skeleton placeholder for a post card
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.count - Number of skeleton posts to render (default: 1)
 * @returns {React.ReactElement} Skeleton post placeholder
 * 
 * @example
 * <SkeletonPost count={3} />
 */
const SkeletonPost = ({ count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
                    role="status"
                    aria-busy="true"
                    aria-label="Loading post"
                >
                    {/* Header */}
                    <div className="flex items-center p-4">
                        {/* Avatar */}
                        <div className="skeleton skeleton-avatar w-10 h-10 rounded-full mr-3"></div>

                        <div className="flex-1">
                            {/* Username */}
                            <div className="skeleton skeleton-text h-4 w-32 mb-2 rounded"></div>
                            {/* Timestamp */}
                            <div className="skeleton skeleton-text h-3 w-20 rounded"></div>
                        </div>
                    </div>

                    {/* Image Placeholder */}
                    <div className="skeleton skeleton-image w-full h-80"></div>

                    {/* Actions */}
                    <div className="p-4">
                        <div className="flex items-center gap-4 mb-3">
                            {/* Like button */}
                            <div className="skeleton skeleton-circle w-6 h-6 rounded-full"></div>
                            {/* Comment button */}
                            <div className="skeleton skeleton-circle w-6 h-6 rounded-full"></div>
                            {/* Share button */}
                            <div className="skeleton skeleton-circle w-6 h-6 rounded-full"></div>
                        </div>

                        {/* Caption lines */}
                        <div className="space-y-2">
                            <div className="skeleton skeleton-text h-3 w-full rounded"></div>
                            <div className="skeleton skeleton-text h-3 w-4/5 rounded"></div>
                            <div className="skeleton skeleton-text h-3 w-3/5 rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default SkeletonPost;
