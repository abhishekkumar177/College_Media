/**
 * PollResults Component
 * Issue #342: Polls System
 * Detailed poll results view with export functionality
 */

import React from 'react';
import { Icon } from '@iconify/react';
import * as pollHelpers from '../utils/pollHelpers';
import { useExportPoll, useSharePoll } from '../hooks/usePolls';
import toast from 'react-hot-toast';

const PollResults = ({ poll }) => {
  const { exportPoll } = useExportPoll(poll.id);
  const { sharePoll } = useSharePoll(poll.id);
  
  const statistics = pollHelpers.getPollStatistics(poll);
  const sortedOptions = pollHelpers.sortOptionsByVotes(poll.options);

  const handleExport = () => {
    exportPoll();
  };

  const handleShare = async () => {
    const success = await sharePoll();
    if (success) {
      toast.success('Poll shared successfully!');
    } else {
      toast.error('Failed to share poll');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Poll Results
          </h2>
          <p className="text-gray-600">{poll.question}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Share poll"
          >
            <Icon icon="mdi:share-variant" className="text-xl" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Export results"
          >
            <Icon icon="mdi:download" className="text-xl" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Icon icon="mdi:vote" className="text-lg" />
            <span className="text-sm">Total Votes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {statistics.totalVotes}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Icon icon="mdi:account-group" className="text-lg" />
            <span className="text-sm">Participants</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {statistics.participationRate}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Icon icon="mdi:clock-outline" className="text-lg" />
            <span className="text-sm">Status</span>
          </div>
          <p className={`text-sm font-semibold ${statistics.isExpired ? 'text-red-600' : 'text-green-600'}`}>
            {statistics.isExpired ? 'Ended' : 'Active'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Icon icon="mdi:chart-bar" className="text-lg" />
            <span className="text-sm">Avg. per Option</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {statistics.averageVotesPerOption}
          </p>
        </div>
      </div>

      {/* Winning Option Highlight */}
      {statistics.winningOption && statistics.totalVotes > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Icon icon="mdi:trophy" className="text-yellow-500 text-3xl" />
            <div>
              <p className="text-sm text-gray-600 mb-1">Leading Option</p>
              <p className="text-lg font-bold text-gray-900">
                {statistics.winningOption.text}
              </p>
              <p className="text-sm text-gray-600">
                {statistics.winningOption.votes} votes ({pollHelpers.calculatePercentage(statistics.winningOption.votes, statistics.totalVotes)}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Results */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">
          Detailed Breakdown
        </h3>
        <div className="space-y-3">
          {sortedOptions.map((option, index) => {
            const percentage = pollHelpers.calculatePercentage(option.votes, poll.totalVotes);
            const isWinner = option.id === statistics.winningOption?.id;

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-gray-900">
                      {option.text}
                    </span>
                    {isWinner && (
                      <Icon icon="mdi:trophy" className="text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {option.votes} votes
                    </span>
                    <span className="text-sm font-bold text-gray-900 min-w-[3rem] text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isWinner ? 'bg-green-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Info */}
      {poll.endsAt && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {statistics.isExpired ? (
              <span className="flex items-center gap-1">
                <Icon icon="mdi:clock-end" />
                Poll ended {statistics.timeRemaining}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Icon icon="mdi:clock-outline" />
                Poll ends {statistics.timeRemaining}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default PollResults;
