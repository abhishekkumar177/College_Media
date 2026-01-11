import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useBookmark } from '../hooks/useCollections';
import CollectionSelector from './CollectionSelector';

/**
 * BookmarkButton Component (Enhanced)
 * 
 * A reusable button component that allows users to save/unsave posts
 * Now supports saving to multiple collections with collection selector
 * 
 * @param {Object} props - Component props
 * @param {number|string} props.postId - Unique identifier for the post
 * @param {string} props.className - Optional additional CSS classes
 * @param {boolean} props.showLabel - Show text label alongside icon
 * @returns {React.ReactElement} Bookmark button component
 */
const BookmarkButton = ({ postId, className = '', showLabel = false }) => {
  const { isSaved, savedInCollections, toggleSave, isProcessing } = useBookmark(postId);
  const [showSelector, setShowSelector] = useState(false);
  const buttonRef = useRef(null);

  // Quick save on single click, show selector on hold or right-click
  const handleClick = async (e) => {
    e.stopPropagation();
    
    // If already saved and wants to choose collection, show selector
    if (isSaved && e.shiftKey) {
      setShowSelector(true);
      return;
    }
    
    // Quick toggle save to default collection
    await toggleSave();
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSelector(!showSelector);
  };

  const handleLongPress = () => {
    setShowSelector(true);
  };

  // Close selector when clicking outside
  useEffect(() => {
    if (!showSelector) return;

    const handleClickOutside = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setShowSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSelector]);

  return (
    <div className="relative" ref={buttonRef}>
      <button
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        disabled={isProcessing}
        className={`flex items-center gap-2 transition-colors ${
          isSaved
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
        } ${className} disabled:opacity-50`}
        aria-label={isSaved ? 'Saved' : 'Save post'}
        title={isSaved ? `Saved in ${savedInCollections.length} collection(s)` : 'Save for later'}
      >
        {isProcessing ? (
          <Icon icon="mdi:loading" className="w-6 h-6 animate-spin" />
        ) : isSaved ? (
          <Icon icon="mdi:bookmark" className="w-6 h-6" />
        ) : (
          <Icon icon="mdi:bookmark-outline" className="w-6 h-6" />
        )}
        
        {showLabel && (
          <span className="text-sm font-medium">
            {isSaved ? 'Saved' : 'Save'}
          </span>
        )}
        
        {isSaved && savedInCollections.length > 1 && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
            {savedInCollections.length}
          </span>
        )}
      </button>

      {/* Collection Selector Dropdown */}
      {showSelector && (
        <CollectionSelector
          postId={postId}
          onClose={() => setShowSelector(false)}
          onSelect={() => setShowSelector(false)}
        />
      )}
    </div>
  );
};

export default BookmarkButton;
