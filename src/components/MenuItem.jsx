import React from 'react';

/**
 * MenuItem Component
 *
 * Individual navigation menu items in the left sidebar with icons and labels.
 *
 * @param {Object} props
 * @param {string} props.icon - Emoji icon for the menu item
 * @param {string} props.label - Text label for the menu item
 * @param {boolean} props.active - Whether the item is currently active
 * @param {function} props.onClick - Handler for click events
 * @returns {React.ReactElement} Menu item JSX
 */
const MenuItem = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gray-50 ${
        active
          ? "bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 shadow-sm"
          : "text-gray-600"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default MenuItem;
