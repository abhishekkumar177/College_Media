import React from 'react';
import StoryItem from './StoryItem';

/**
 * StoriesCarousel Component
 *
 * Horizontal scrolling carousel displaying user stories with auto-scroll functionality.
 *
 * @param {Object} props
 * @param {Array} props.stories - Array of story objects
 * @param {number} props.currentIndex - Current active story index
 * @param {function} props.onStoryClick - Handler for story click events
 * @returns {React.ReactElement} Stories carousel JSX
 */
const StoriesCarousel = ({ stories, currentIndex, onStoryClick }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {stories.map((story, index) => (
          <StoryItem
            key={story.id}
            story={story}
            isActive={index === currentIndex}
            onClick={() => onStoryClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default StoriesCarousel;
