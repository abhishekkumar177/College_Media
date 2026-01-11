/**
 * Poll Helper Functions
 * Issue #342: Polls System
 * Utility functions for poll calculations and checks
 */

import { formatDistanceToNow, isPast, differenceInHours, differenceInDays } from 'date-fns';

/**
 * Calculate percentage for poll option
 */
export const calculatePercentage = (votes, totalVotes) => {
  if (totalVotes === 0) return 0;
  return ((votes / totalVotes) * 100).toFixed(1);
};

/**
 * Check if poll has expired
 */
export const isPollExpired = (endsAt) => {
  if (!endsAt) return false; // Never expires
  return isPast(new Date(endsAt));
};

/**
 * Get time remaining for poll
 */
export const getTimeRemaining = (endsAt) => {
  if (!endsAt) return 'No expiry';
  
  if (isPollExpired(endsAt)) {
    return 'Ended';
  }

  try {
    return formatDistanceToNow(new Date(endsAt), { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format poll duration
 */
export const formatPollDuration = (endsAt, createdAt) => {
  if (!endsAt) return 'Never expires';
  
  const hours = differenceInHours(new Date(endsAt), new Date(createdAt));
  const days = differenceInDays(new Date(endsAt), new Date(createdAt));

  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''}`;
  
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks !== 1 ? 's' : ''}`;
};

/**
 * Get poll duration options
 */
export const getPollDurationOptions = () => [
  { label: '1 Hour', value: 1, unit: 'hours' },
  { label: '1 Day', value: 1, unit: 'days' },
  { label: '3 Days', value: 3, unit: 'days' },
  { label: '1 Week', value: 7, unit: 'days' },
  { label: 'Never', value: null, unit: null },
];

/**
 * Calculate poll end date
 */
export const calculatePollEndDate = (duration, unit) => {
  if (duration === null || unit === null) return null;
  
  const now = new Date();
  const endDate = new Date(now);
  
  if (unit === 'hours') {
    endDate.setHours(endDate.getHours() + duration);
  } else if (unit === 'days') {
    endDate.setDate(endDate.getDate() + duration);
  }
  
  return endDate.toISOString();
};

/**
 * Get winning option (highest votes)
 */
export const getWinningOption = (options) => {
  if (!options || options.length === 0) return null;
  
  return options.reduce((max, option) => 
    option.votes > max.votes ? option : max
  , options[0]);
};

/**
 * Check if option is winning
 */
export const isWinningOption = (option, options) => {
  const winner = getWinningOption(options);
  return winner && option.id === winner.id;
};

/**
 * Validate poll data
 */
export const validatePollData = (pollData) => {
  const errors = {};

  // Validate question
  if (!pollData.question || pollData.question.trim().length === 0) {
    errors.question = 'Question is required';
  } else if (pollData.question.length > 200) {
    errors.question = 'Question must be less than 200 characters';
  }

  // Validate options
  if (!pollData.options || pollData.options.length < 2) {
    errors.options = 'At least 2 options are required';
  } else if (pollData.options.length > 6) {
    errors.options = 'Maximum 6 options allowed';
  } else {
    const emptyOptions = pollData.options.filter(opt => 
      !opt || (typeof opt === 'string' ? opt.trim().length === 0 : !opt.text || opt.text.trim().length === 0)
    );
    if (emptyOptions.length > 0) {
      errors.options = 'All options must have text';
    }

    const duplicates = pollData.options.filter((opt, index, self) => 
      self.findIndex(o => 
        (typeof o === 'string' ? o : o.text) === (typeof opt === 'string' ? opt : opt.text)
      ) !== index
    );
    if (duplicates.length > 0) {
      errors.options = 'Duplicate options are not allowed';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sort options by votes (descending)
 */
export const sortOptionsByVotes = (options) => {
  return [...options].sort((a, b) => b.votes - a.votes);
};

/**
 * Get poll statistics
 */
export const getPollStatistics = (poll) => {
  if (!poll || !poll.options) return null;

  const totalVotes = poll.totalVotes || 0;
  const winningOption = getWinningOption(poll.options);
  const isExpired = isPollExpired(poll.endsAt);
  const timeRemaining = getTimeRemaining(poll.endsAt);
  
  return {
    totalVotes,
    winningOption,
    isExpired,
    timeRemaining,
    participationRate: poll.voters ? poll.voters.length : 0,
    averageVotesPerOption: totalVotes > 0 ? (totalVotes / poll.options.length).toFixed(1) : 0,
  };
};

/**
 * Format vote count
 */
export const formatVoteCount = (count) => {
  if (count === 0) return 'No votes';
  if (count === 1) return '1 vote';
  if (count < 1000) return `${count} votes`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K votes`;
  return `${(count / 1000000).toFixed(1)}M votes`;
};

/**
 * Get progress bar color based on percentage
 */
export const getProgressBarColor = (percentage, isWinner, isUserChoice) => {
  if (isUserChoice) return 'bg-blue-500';
  if (isWinner) return 'bg-green-500';
  if (percentage > 50) return 'bg-indigo-500';
  if (percentage > 25) return 'bg-purple-500';
  return 'bg-gray-400';
};

/**
 * Export poll results as JSON
 */
export const exportPollResults = (poll) => {
  const results = {
    question: poll.question,
    totalVotes: poll.totalVotes,
    createdAt: poll.createdAt,
    endsAt: poll.endsAt,
    isExpired: isPollExpired(poll.endsAt),
    options: poll.options.map(option => ({
      text: option.text,
      votes: option.votes,
      percentage: calculatePercentage(option.votes, poll.totalVotes),
    })),
    winningOption: getWinningOption(poll.options)?.text || 'N/A',
  };

  return JSON.stringify(results, null, 2);
};

/**
 * Generate poll share text
 */
export const generatePollShareText = (poll) => {
  const winner = getWinningOption(poll.options);
  const stats = getPollStatistics(poll);
  
  return `Poll: ${poll.question}\n\n` +
    `Total Votes: ${stats.totalVotes}\n` +
    `${stats.isExpired ? 'Poll Ended' : `Time Remaining: ${stats.timeRemaining}`}\n\n` +
    `Leading Option: ${winner?.text || 'No votes yet'} (${winner ? calculatePercentage(winner.votes, poll.totalVotes) : 0}%)\n\n` +
    `Vote now!`;
};

/**
 * Check if user can vote
 */
export const canUserVote = (poll, hasVoted) => {
  if (isPollExpired(poll.endsAt)) return false;
  if (hasVoted && !poll.allowVoteChange) return false;
  return true;
};

/**
 * Get poll status badge info
 */
export const getPollStatusBadge = (poll) => {
  const isExpired = isPollExpired(poll.endsAt);
  
  if (isExpired) {
    return {
      text: 'Ended',
      color: 'bg-red-100 text-red-800',
      icon: 'mdi:clock-end',
    };
  }
  
  if (poll.totalVotes === 0) {
    return {
      text: 'No votes yet',
      color: 'bg-gray-100 text-gray-800',
      icon: 'mdi:vote-outline',
    };
  }
  
  return {
    text: 'Active',
    color: 'bg-green-100 text-green-800',
    icon: 'mdi:check-circle',
  };
};

export default {
  calculatePercentage,
  isPollExpired,
  getTimeRemaining,
  formatPollDuration,
  getPollDurationOptions,
  calculatePollEndDate,
  getWinningOption,
  isWinningOption,
  validatePollData,
  sortOptionsByVotes,
  getPollStatistics,
  formatVoteCount,
  getProgressBarColor,
  exportPollResults,
  generatePollShareText,
  canUserVote,
  getPollStatusBadge,
};
