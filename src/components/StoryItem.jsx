import React from 'react';

/**
 * StoryItem Component
 *
 * Individual story item in the carousel with user avatar and username.
 *
 * @param {Object} props
 * @param {Object} props.story - Story object with id, username, avatar
 * @param {boolean} props.isActive - Whether this story is currently active
 * @param {function} props.onClick - Handler for click events
 * @returns {React.ReactElement} Story item JSX
 */
const StoryItem = ({ story, isActive, onClick }) => {
  return (
    <div
      className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer hover:scale-105 transition-transform duration-300"
      onClick={onClick}
    >
      <div className={`relative w-16 h-16 rounded-full border-2 transition-all duration-500 ${
        isActive
          ? "border-gradient-to-r"
          : "border-gray-300"
      }`}>
        <img
          src={story.avatar}
          alt={story.username}
          className="w-full h-full rounded-full object-cover"
        />
        {isActive && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
      <span className="text-xs text-gray-600 truncate w-16 text-center">{story.username}</span>
    </div>
  );
};

export default StoryItem;
