/**
 * Poll Context
 * Issue #342: Polls System
 * Global state management for polls
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as pollStorage from '../utils/pollStorage';
import * as pollHelpers from '../utils/pollHelpers';
import toast from 'react-hot-toast';

export const PollContext = createContext();

export const PollProvider = ({ children }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});

  // Load polls and user votes on mount
  useEffect(() => {
    loadPolls();
    loadUserVotes();
  }, []);

  const loadPolls = useCallback(() => {
    try {
      const loadedPolls = pollStorage.getPolls();
      setPolls(loadedPolls);
    } catch (error) {
      console.error('Error loading polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserVotes = useCallback(() => {
    try {
      const votes = pollStorage.getUserVotes();
      setUserVotes(votes);
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  }, []);

  /**
   * Create a new poll
   */
  const createPoll = useCallback(async (pollData) => {
    try {
      // Validate poll data
      const validation = pollHelpers.validatePollData(pollData);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors)[0];
        toast.error(errorMessage);
        return null;
      }

      // Calculate end date if duration is set
      let endsAt = null;
      if (pollData.duration && pollData.durationUnit) {
        endsAt = pollHelpers.calculatePollEndDate(
          pollData.duration,
          pollData.durationUnit
        );
      }

      // Create poll
      const newPoll = pollStorage.createPoll({
        ...pollData,
        endsAt,
      });

      if (newPoll) {
        setPolls((prev) => [...prev, newPoll]);
        toast.success('Poll created successfully!');
        return newPoll;
      } else {
        toast.error('Failed to create poll');
        return null;
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll');
      return null;
    }
  }, []);

  /**
   * Get poll by ID
   */
  const getPollById = useCallback((pollId) => {
    return polls.find((poll) => poll.id === pollId);
  }, [polls]);

  /**
   * Get poll by post ID
   */
  const getPollByPostId = useCallback((postId) => {
    return polls.find((poll) => poll.postId === postId);
  }, [polls]);

  /**
   * Update poll
   */
  const updatePoll = useCallback(async (pollId, updates) => {
    try {
      const updatedPoll = pollStorage.updatePoll(pollId, updates);
      if (updatedPoll) {
        setPolls((prev) =>
          prev.map((poll) => (poll.id === pollId ? updatedPoll : poll))
        );
        toast.success('Poll updated successfully!');
        return updatedPoll;
      } else {
        toast.error('Failed to update poll');
        return null;
      }
    } catch (error) {
      console.error('Error updating poll:', error);
      toast.error('Failed to update poll');
      return null;
    }
  }, []);

  /**
   * Delete poll
   */
  const deletePoll = useCallback(async (pollId) => {
    try {
      const success = pollStorage.deletePoll(pollId);
      if (success) {
        setPolls((prev) => prev.filter((poll) => poll.id !== pollId));
        
        // Remove from user votes
        setUserVotes((prev) => {
          const newVotes = { ...prev };
          delete newVotes[pollId];
          return newVotes;
        });
        
        toast.success('Poll deleted successfully!');
        return true;
      } else {
        toast.error('Failed to delete poll');
        return false;
      }
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast.error('Failed to delete poll');
      return false;
    }
  }, []);

  /**
   * Submit vote
   */
  const submitVote = useCallback(async (pollId, optionId, userId = 'current-user') => {
    try {
      const poll = getPollById(pollId);
      if (!poll) {
        toast.error('Poll not found');
        return null;
      }

      // Check if poll has expired
      if (pollHelpers.isPollExpired(poll.endsAt)) {
        toast.error('This poll has ended');
        return null;
      }

      // Check if user already voted and vote change is not allowed
      const hasVoted = pollStorage.hasUserVoted(pollId);
      if (hasVoted && !poll.allowVoteChange) {
        toast.error('You have already voted on this poll');
        return null;
      }

      const updatedPoll = pollStorage.submitVote(pollId, optionId, userId);
      if (updatedPoll) {
        setPolls((prev) =>
          prev.map((p) => (p.id === pollId ? updatedPoll : p))
        );
        
        // Update user votes
        setUserVotes((prev) => ({
          ...prev,
          [pollId]: optionId,
        }));

        if (hasVoted) {
          toast.success('Vote changed successfully!');
        } else {
          toast.success('Vote submitted successfully!');
        }
        
        return updatedPoll;
      } else {
        toast.error('Failed to submit vote');
        return null;
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error(error.message || 'Failed to submit vote');
      return null;
    }
  }, [getPollById]);

  /**
   * Get poll results
   */
  const getPollResults = useCallback((pollId) => {
    return pollStorage.getPollResults(pollId);
  }, []);

  /**
   * Check if user has voted
   */
  const hasUserVoted = useCallback((pollId) => {
    return userVotes[pollId] !== undefined && userVotes[pollId] !== null;
  }, [userVotes]);

  /**
   * Get user's vote for a poll
   */
  const getUserVote = useCallback((pollId) => {
    return userVotes[pollId] || null;
  }, [userVotes]);

  /**
   * Get poll statistics
   */
  const getPollStatistics = useCallback((pollId) => {
    const poll = getPollById(pollId);
    if (!poll) return null;
    return pollHelpers.getPollStatistics(poll);
  }, [getPollById]);

  /**
   * Export poll results
   */
  const exportResults = useCallback((pollId) => {
    try {
      const poll = getPollById(pollId);
      if (!poll) {
        toast.error('Poll not found');
        return null;
      }

      const json = pollHelpers.exportPollResults(poll);
      
      // Create download link
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poll-${pollId}-results.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Results exported successfully!');
      return json;
    } catch (error) {
      console.error('Error exporting results:', error);
      toast.error('Failed to export results');
      return null;
    }
  }, [getPollById]);

  /**
   * Generate share text
   */
  const generateShareText = useCallback((pollId) => {
    const poll = getPollById(pollId);
    if (!poll) return '';
    return pollHelpers.generatePollShareText(poll);
  }, [getPollById]);

  const value = {
    polls,
    loading,
    userVotes,
    createPoll,
    getPollById,
    getPollByPostId,
    updatePoll,
    deletePoll,
    submitVote,
    getPollResults,
    hasUserVoted,
    getUserVote,
    getPollStatistics,
    exportResults,
    generateShareText,
  };

  return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
};

export default PollContext;
