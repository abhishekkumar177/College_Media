/**
 * TypingIndicator Component
 * Issue #423: Implement Real-time Typing Indicators for Comments
 * 
 * Displays a visual indicator showing which users are currently typing.
 * Shows up to 3 usernames with animated dots.
 */

import React from 'react';

const TypingIndicator = ({ typingUsers = [] }) => {
    if (typingUsers.length === 0) return null;

    // Format the typing message based on number of users
    const getTypingMessage = () => {
        const count = typingUsers.length;

        if (count === 1) {
            return `${typingUsers[0].username} is typing`;
        } else if (count === 2) {
            return `${typingUsers[0].username} and ${typingUsers[1].username} are typing`;
        } else if (count === 3) {
            return `${typingUsers[0].username}, ${typingUsers[1].username}, and ${typingUsers[2].username} are typing`;
        } else {
            // More than 3 users
            return `${typingUsers[0].username}, ${typingUsers[1].username}, and ${count - 2} others are typing`;
        }
    };

    return (
        <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            {/* Animated dots */}
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>

            {/* Typing message */}
            <span className="italic">
                {getTypingMessage()}
            </span>
        </div>
    );
};

export default TypingIndicator;
