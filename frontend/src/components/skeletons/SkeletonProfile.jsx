/**
 * SkeletonProfile Component
 * Issue #369: Comprehensive Loading State System
 * 
 * Skeleton screen for profile page loading state
 */

import React from 'react';
import '../../styles/skeleton.css';

/**
 * SkeletonProfile Component
 * 
 * Displays an animated skeleton placeholder for a profile page
 * 
 * @component
 * @returns {React.ReactElement} Skeleton profile placeholder
 */
const SkeletonProfile = () => {
    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden"
            role="status"
            aria-busy="true"
            aria-label="Loading profile"
        >
            {/* Cover Image */}
            <div className="skeleton skeleton-image w-full h-48"></div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
                {/* Avatar */}
                <div className="skeleton skeleton-avatar w-32 h-32 rounded-full -mt-16 border-4 border-white"></div>

                {/* Name and Bio */}
                <div className="mt-4 space-y-3">
                    <div className="skeleton skeleton-text h-6 w-48 rounded"></div>
                    <div className="skeleton skeleton-text h-4 w-32 rounded"></div>

                    {/* Bio lines */}
                    <div className="mt-4 space-y-2">
                        <div className="skeleton skeleton-text h-3 w-full rounded"></div>
                        <div className="skeleton skeleton-text h-3 w-5/6 rounded"></div>
                        <div className="skeleton skeleton-text h-3 w-4/6 rounded"></div>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="skeleton skeleton-text h-6 w-16 mx-auto mb-2 rounded"></div>
                        <div className="skeleton skeleton-text h-3 w-12 mx-auto rounded"></div>
                    </div>
                    <div className="text-center">
                        <div className="skeleton skeleton-text h-6 w-16 mx-auto mb-2 rounded"></div>
                        <div className="skeleton skeleton-text h-3 w-16 mx-auto rounded"></div>
                    </div>
                    <div className="text-center">
                        <div className="skeleton skeleton-text h-6 w-16 mx-auto mb-2 rounded"></div>
                        <div className="skeleton skeleton-text h-3 w-16 mx-auto rounded"></div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                    <div className="skeleton skeleton-text h-10 flex-1 rounded-lg"></div>
                    <div className="skeleton skeleton-text h-10 w-24 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonProfile;
