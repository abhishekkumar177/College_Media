import React from 'react';

/**
 * OnlineFriendItem Component
 *
 * Individual online friend display with avatar and green online indicator.
 *
 * @param {Object} props
 * @param {Object} props.friend - Friend object with username, avatar
 * @param {function} props.onClick - Handler for click events
 * @returns {React.ReactElement} Online friend item JSX
 */
const OnlineFriendItem = ({ friend, onClick }) => {
  return (
    <div className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-300" onClick={onClick}>
      <div className="relative">
        <img
          src={friend.avatar}
          alt={friend.username}
          className="w-12 h-12 rounded-full"
        />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <span className="text-xs text-gray-600 mt-1 truncate w-12 text-center">{friend.username}</span>
    </div>
  );
};

export default OnlineFriendItem;
