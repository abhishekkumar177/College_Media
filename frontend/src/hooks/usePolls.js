/**
 * usePolls Custom Hooks
 * Issue #342: Polls System
 * Specialized hooks for poll operations
 */

import { useContext } from 'react';
import { PollContext } from '../context/PollContext';

/**
 * Main polls hook
 */
export const usePolls = () => {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error('usePolls must be used within PollProvider');
  }
  return context;
};

/**
 * Get specific poll by ID
 */
export const usePoll = (pollId) => {
  const { getPollById, loading } = usePolls();
  const poll = getPollById(pollId);
  
  return {
    poll,
    loading,
    exists: !!poll,
  };
};

/**
 * Get poll by post ID
 */
export const usePollByPost = (postId) => {
  const { getPollByPostId, loading } = usePolls();
  const poll = getPollByPostId(postId);
  
  return {
    poll,
    loading,
    hasPoll: !!poll,
  };
};

/**
 * Create poll hook
 */
export const useCreatePoll = () => {
  const { createPoll, loading } = usePolls();
  
  return {
    createPoll,
    loading,
  };
};

/**
 * Update poll hook
 */
export const useUpdatePoll = () => {
  const { updatePoll, loading } = usePolls();
  
  return {
    updatePoll,
    loading,
  };
};

/**
 * Delete poll hook
 */
export const useDeletePoll = () => {
  const { deletePoll, loading } = usePolls();
  
  return {
    deletePoll,
    loading,
  };
};

/**
 * Vote submission hook
 */
export const useVote = (pollId) => {
  const { submitVote, hasUserVoted, getUserVote, loading } = usePolls();
  
  const hasVoted = hasUserVoted(pollId);
  const userVote = getUserVote(pollId);
  
  const vote = async (optionId) => {
    return await submitVote(pollId, optionId);
  };
  
  return {
    vote,
    hasVoted,
    userVote,
    loading,
  };
};

/**
 * Poll results hook
 */
export const usePollResults = (pollId) => {
  const { getPollResults, loading } = usePolls();
  const results = getPollResults(pollId);
  
  return {
    results,
    loading,
  };
};

/**
 * Poll statistics hook
 */
export const usePollStatistics = (pollId) => {
  const { getPollStatistics, loading } = usePolls();
  const statistics = getPollStatistics(pollId);
  
  return {
    statistics,
    loading,
  };
};

/**
 * Poll export hook
 */
export const useExportPoll = (pollId) => {
  const { exportResults, loading } = usePolls();
  
  const exportPoll = () => {
    return exportResults(pollId);
  };
  
  return {
    exportPoll,
    loading,
  };
};

/**
 * Poll share hook
 */
export const useSharePoll = (pollId) => {
  const { generateShareText, loading } = usePolls();
  
  const shareText = generateShareText(pollId);
  
  const sharePoll = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Poll',
          text: shareText,
        });
        return true;
      } catch (error) {
        console.error('Error sharing poll:', error);
        return false;
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        return true;
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
      }
    }
  };
  
  return {
    sharePoll,
    shareText,
    loading,
  };
};

export default usePolls;
