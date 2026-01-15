import React from 'react';

/**
 * Suggested Account Item Component
 * Individual suggested account display with avatar, username, follower count, and follow button.
 * @param {Object} props - The component props
 * @param {Object} props.account - Account object with name, avatar, followers
 * @param {Function} props.onFollow - Handler for follow action
 * @returns {JSX.Element} The suggested account item JSX element
 */
const SuggestedAccountItem = ({ account, onFollow }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img
          src={account.avatar}
          alt={account.name}
          className="w-10 h-10 rounded-full cursor-pointer hover:scale-110 transition-transform duration-300"
        />
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
            {account.name}
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-xs">
            {account.followers} followers
          </p>
        </div>
      </div>
      <button className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300">
        <svg
          className="w-5 h-5 text-slate-600 dark:text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
};

export default SuggestedAccountItem;