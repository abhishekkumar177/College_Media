import React, { useState } from 'react';
import { useBookmark } from '../context/BookmarkContext';

/**
 * BookmarkButton Component
 * 
 * A reusable button component that allows users to save/unsave posts
 * Uses the BookmarkContext for state management
 * 
 * @param {Object} props - Component props
 * @param {number|string} props.postId - Unique identifier for the post
 * @param {string} props.className - Optional additional CSS classes
 * @returns {React.ReactElement} Bookmark button component
 */
const BookmarkButton = ({ postId, className = '' }) => {
  const { isBookmarked, toggleBookmark } = useBookmark();
  const bookmarked = isBookmarked(postId);
  const [showToast, setShowToast] = useState(false);

  const handleClick = (e) => {
    // Prevent event bubbling to parent elements
    e.stopPropagation();
    toggleBookmark(postId);
    
    // Show toast notification
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`bookmark-btn ${bookmarked ? 'bookmarked' : ''} ${className}`}
        aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        title={bookmarked ? 'Remove from saved' : 'Save for later'}
      >
        {bookmarked ? (
          // Filled bookmark icon
          <svg 
            className="w-6 h-6 fill-current" 
            viewBox="0 0 24 24"
          >
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
          </svg>
        ) : (
          // Outlined bookmark icon
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
            />
          </svg>
        )}
      </button>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <svg 
              className="w-5 h-5 text-green-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
            <span className="text-sm font-medium">
              {bookmarked ? 'Post saved!' : 'Post removed from saved'}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default BookmarkButton;
