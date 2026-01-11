/**
 * PollDisplay Component
 * Issue #342: Polls System
 * Main poll display with voting interface
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import PollOption from './PollOption';
import { useVote, usePollResults } from '../hooks/usePolls';
import * as pollHelpers from '../utils/pollHelpers';

const PollDisplay = ({ poll }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const { vote, hasVoted, userVote } = useVote(poll.id);
  const { results } = usePollResults(poll.id);
  
  const isExpired = pollHelpers.isPollExpired(poll.endsAt);
  const canVote = pollHelpers.canUserVote(poll, hasVoted);
  const showResults = hasVoted || isExpired;
  const statusBadge = pollHelpers.getPollStatusBadge(poll);

  useEffect(() => {
    if (userVote) {
      setSelectedOption(userVote);
    }
  }, [userVote]);

  const handleVote = async (optionId) => {
    if (!canVote) return;

    setSelectedOption(optionId);
    await vote(optionId);
  };

  const handleSubmitVote = async () => {
    if (!selectedOption || !canVote) return;
    await vote(selectedOption);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mt-3">
      {/* Poll Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:poll" className="text-indigo-500 text-2xl" />
          <h3 className="font-semibold text-gray-900">Poll</h3>
        </div>
        
        {/* Status Badge */}
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
          <Icon icon={statusBadge.icon} />
          {statusBadge.text}
        </span>
      </div>

      {/* Poll Question */}
      <div className="mb-4">
        <p className="text-lg font-medium text-gray-800">{poll.question}</p>
      </div>

      {/* Poll Options */}
      <div className="space-y-2 mb-4">
        {(results?.options || poll.options).map((option) => (
          <PollOption
            key={option.id}
            option={option}
            poll={results || poll}
            isSelected={selectedOption === option.id}
            isUserChoice={option.id === userVote}
            onVote={handleVote}
            canVote={canVote}
            showResults={showResults}
          />
        ))}
      </div>

      {/* Vote Button (only show if not voted and poll active) */}
      {!hasVoted && !isExpired && selectedOption && (
        <button
          onClick={handleSubmitVote}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:vote" className="text-xl" />
          Submit Vote
        </button>
      )}

      {/* Poll Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {/* Total Votes */}
          <span className="flex items-center gap-1">
            <Icon icon="mdi:account-group" className="text-lg" />
            {pollHelpers.formatVoteCount(poll.totalVotes)}
          </span>

          {/* Time Remaining */}
          {poll.endsAt && (
            <span className="flex items-center gap-1">
              <Icon icon="mdi:clock-outline" className="text-lg" />
              {pollHelpers.getTimeRemaining(poll.endsAt)}
            </span>
          )}
        </div>

        {/* Vote Change Info */}
        {hasVoted && poll.allowVoteChange && !isExpired && (
          <span className="text-xs text-gray-500 italic">
            You can change your vote
          </span>
        )}
      </div>
    </div>
  );
};

export default PollDisplay;
