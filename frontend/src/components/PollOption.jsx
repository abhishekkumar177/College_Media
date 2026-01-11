/**
 * PollOption Component
 * Issue #342: Polls System
 * Individual poll option with progress bar
 */

import React from 'react';
import { Icon } from '@iconify/react';
import * as pollHelpers from '../utils/pollHelpers';

const PollOption = ({
  option,
  poll,
  isSelected,
  isUserChoice,
  onVote,
  canVote,
  showResults,
}) => {
  const isWinner = pollHelpers.isWinningOption(option, poll.options);
  const percentage = pollHelpers.calculatePercentage(option.votes, poll.totalVotes);
  
  const handleClick = () => {
    if (canVote && onVote) {
      onVote(option.id);
    }
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer
        ${isUserChoice ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
        ${!canVote && !showResults ? 'cursor-not-allowed opacity-70' : ''}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
      `}
      onClick={handleClick}
    >
      {/* Progress Bar Background */}
      {showResults && (
        <div
          className={`
            absolute inset-0 transition-all duration-500
            ${isUserChoice ? 'bg-blue-200' : isWinner ? 'bg-green-200' : 'bg-gray-100'}
          `}
          style={{ width: `${percentage}%` }}
        />
      )}

      {/* Content */}
      <div className="relative px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Radio/Checkbox */}
          {canVote && !showResults && (
            <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
            `}>
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          )}

          {/* Option Text */}
          <span className={`
            font-medium flex-1
            ${isUserChoice ? 'text-blue-700' : 'text-gray-700'}
          `}>
            {option.text}
          </span>

          {/* User Choice Badge */}
          {isUserChoice && showResults && (
            <Icon
              icon="mdi:check-circle"
              className="text-blue-500 text-xl"
            />
          )}

          {/* Winner Badge */}
          {isWinner && showResults && poll.totalVotes > 0 && (
            <Icon
              icon="mdi:trophy"
              className="text-yellow-500 text-xl"
            />
          )}
        </div>

        {/* Results */}
        {showResults && (
          <div className="ml-3 flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">
              {option.votes}
            </span>
            <span className="text-sm font-bold text-gray-900 min-w-[3rem] text-right">
              {percentage}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollOption;
