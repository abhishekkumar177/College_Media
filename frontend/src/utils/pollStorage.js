/**
 * Poll Storage Utilities
 * Issue #342: Polls System
 * LocalStorage-based poll management
 */

const POLLS_KEY = 'polls';
const VOTES_KEY = 'poll_votes';

/**
 * Get all polls from localStorage
 */
export const getPolls = () => {
  try {
    const polls = localStorage.getItem(POLLS_KEY);
    return polls ? JSON.parse(polls) : [];
  } catch (error) {
    console.error('Error reading polls from localStorage:', error);
    return [];
  }
};

/**
 * Save polls to localStorage
 */
export const savePolls = (polls) => {
  try {
    localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
    return true;
  } catch (error) {
    console.error('Error saving polls to localStorage:', error);
    return false;
  }
};

/**
 * Get poll by ID
 */
export const getPollById = (pollId) => {
  const polls = getPolls();
  return polls.find((poll) => poll.id === pollId);
};

/**
 * Get poll by post ID
 */
export const getPollByPostId = (postId) => {
  const polls = getPolls();
  return polls.find((poll) => poll.postId === postId);
};

/**
 * Create new poll
 */
export const createPoll = (pollData) => {
  try {
    const polls = getPolls();
    const newPoll = {
      id: `poll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...pollData,
      totalVotes: 0,
      voters: [],
      createdAt: new Date().toISOString(),
      options: pollData.options.map((option, index) => ({
        id: `opt_${index}_${Date.now()}`,
        text: option.text || option,
        votes: 0,
      })),
    };
    polls.push(newPoll);
    savePolls(polls);
    return newPoll;
  } catch (error) {
    console.error('Error creating poll:', error);
    return null;
  }
};

/**
 * Update poll
 */
export const updatePoll = (pollId, updates) => {
  try {
    const polls = getPolls();
    const index = polls.findIndex((poll) => poll.id === pollId);
    if (index === -1) return null;

    polls[index] = {
      ...polls[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    savePolls(polls);
    return polls[index];
  } catch (error) {
    console.error('Error updating poll:', error);
    return null;
  }
};

/**
 * Delete poll
 */
export const deletePoll = (pollId) => {
  try {
    const polls = getPolls();
    const filtered = polls.filter((poll) => poll.id !== pollId);
    savePolls(filtered);
    
    // Also remove votes for this poll
    const votes = getUserVotes();
    delete votes[pollId];
    saveUserVotes(votes);
    
    return true;
  } catch (error) {
    console.error('Error deleting poll:', error);
    return false;
  }
};

/**
 * Submit vote for a poll
 */
export const submitVote = (pollId, optionId, userId) => {
  try {
    const polls = getPolls();
    const pollIndex = polls.findIndex((poll) => poll.id === pollId);
    if (pollIndex === -1) return null;

    const poll = polls[pollIndex];

    // Check if user already voted
    const previousVote = getUserVote(pollId);
    if (previousVote && !poll.allowVoteChange) {
      throw new Error('Vote change not allowed for this poll');
    }

    // Remove previous vote if exists
    if (previousVote) {
      const prevOptionIndex = poll.options.findIndex((opt) => opt.id === previousVote);
      if (prevOptionIndex !== -1) {
        poll.options[prevOptionIndex].votes = Math.max(0, poll.options[prevOptionIndex].votes - 1);
        poll.totalVotes = Math.max(0, poll.totalVotes - 1);
      }
    }

    // Add new vote
    const optionIndex = poll.options.findIndex((opt) => opt.id === optionId);
    if (optionIndex === -1) return null;

    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1;

    // Track voter
    if (!poll.voters.includes(userId)) {
      poll.voters.push(userId);
    }

    polls[pollIndex] = poll;
    savePolls(polls);

    // Save user's vote
    saveUserVote(pollId, optionId);

    return poll;
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
};

/**
 * Get all user votes
 */
export const getUserVotes = () => {
  try {
    const votes = localStorage.getItem(VOTES_KEY);
    return votes ? JSON.parse(votes) : {};
  } catch (error) {
    console.error('Error reading votes from localStorage:', error);
    return {};
  }
};

/**
 * Save all user votes
 */
export const saveUserVotes = (votes) => {
  try {
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
    return true;
  } catch (error) {
    console.error('Error saving votes to localStorage:', error);
    return false;
  }
};

/**
 * Get user's vote for a specific poll
 */
export const getUserVote = (pollId) => {
  const votes = getUserVotes();
  return votes[pollId] || null;
};

/**
 * Save user's vote for a specific poll
 */
export const saveUserVote = (pollId, optionId) => {
  const votes = getUserVotes();
  votes[pollId] = optionId;
  saveUserVotes(votes);
};

/**
 * Check if user has voted on a poll
 */
export const hasUserVoted = (pollId) => {
  return getUserVote(pollId) !== null;
};

/**
 * Get poll results
 */
export const getPollResults = (pollId) => {
  const poll = getPollById(pollId);
  if (!poll) return null;

  const userVote = getUserVote(pollId);
  
  return {
    ...poll,
    userVote,
    options: poll.options.map((option) => ({
      ...option,
      percentage: poll.totalVotes > 0 
        ? ((option.votes / poll.totalVotes) * 100).toFixed(1)
        : 0,
      isUserChoice: option.id === userVote,
    })),
  };
};

/**
 * Clear all polls (for testing/reset)
 */
export const clearAllPolls = () => {
  try {
    localStorage.removeItem(POLLS_KEY);
    localStorage.removeItem(VOTES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing polls:', error);
    return false;
  }
};

export default {
  getPolls,
  savePolls,
  getPollById,
  getPollByPostId,
  createPoll,
  updatePoll,
  deletePoll,
  submitVote,
  getUserVotes,
  saveUserVotes,
  getUserVote,
  saveUserVote,
  hasUserVoted,
  getPollResults,
  clearAllPolls,
};
