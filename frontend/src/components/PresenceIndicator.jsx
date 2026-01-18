/**
 * PresenceIndicator Component
 * Issue #923: Real-time Collaborative Features
 * 
 * Shows user presence and cursor position in collaborative sessions.
 */

import React from 'react';
import { Icon } from '@iconify/react';

const PresenceIndicator = ({ user, cursor, showCursor = true }) => {
    const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
    ];

    // Assign color based on user ID
    const userColor = colors[parseInt(user.userId?.slice(-2), 16) % colors.length];

    return (
        <div className="flex items-center gap-2">
            {/* Avatar */}
            <div
                className="relative w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                style={{ backgroundColor: userColor }}
                title={user.username || 'Anonymous'}
            >
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                    />
                ) : (
                    <span>{(user.username || 'A')[0].toUpperCase()}</span>
                )}

                {/* Active indicator */}
                {user.isActive && (
                    <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"
                        style={{ backgroundColor: userColor }}
                    />
                )}
            </div>

            {/* Username */}
            <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.username || 'Anonymous'}
                </span>
                {user.role && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user.role}
                    </span>
                )}
            </div>

            {/* Cursor indicator */}
            {showCursor && cursor && (
                <Icon
                    icon="mdi:cursor-default"
                    className="w-4 h-4"
                    style={{ color: userColor }}
                />
            )}
        </div>
    );
};

export default PresenceIndicator;
