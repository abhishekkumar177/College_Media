import React from 'react';

/**
 * TrendingHashtag Component
 *
 * Individual trending hashtag display as a clickable badge.
 *
 * @param {Object} props
 * @param {string} props.hashtag - The hashtag text (e.g., "#photography")
 * @param {function} props.onClick - Handler for click events
 * @returns {React.ReactElement} Trending hashtag JSX
 */
const TrendingHashtag = ({ hashtag, onClick }) => {
  return (
    <span
      onClick={onClick}
      className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-full text-sm font-medium hover:from-pink-200 hover:to-purple-200 transition-all duration-300 cursor-pointer hover:shadow-sm"
    >
      {hashtag}
    </span>
  );
};

export default TrendingHashtag;
