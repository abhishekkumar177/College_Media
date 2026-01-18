/**
 * Matchmaking Controller
 * Handles API requests for study buddy matching
 */

const matchingService = require('../services/matchingService');
const vectorStore = require('../services/vectorStore');
const User = require('../models/User');

/**
 * @desc    Get study buddy matches for current user
 * @route   GET /api/matchmaking/matches
 * @access  Private
 */
exports.getMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, minScore = 40, refresh = false } = req.query;

    // Sync user to vector store if not present
    if (!vectorStore.hasUser(userId.toString())) {
      await matchingService.syncUserToVectorStore(userId);
    }

    const matches = await matchingService.findMatches(userId, {
      limit: parseInt(limit),
      minScore: parseInt(minScore),
      refresh: refresh === 'true'
    });

    res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding matches',
      error: error.message
    });
  }
};

/**
 * @desc    Get next match (for swipe interface)
 * @route   GET /api/matchmaking/next
 * @access  Private
 */
exports.getNextMatch = async (req, res) => {
  try {
    const userId = req.user._id;
    const { excludeIds = '[]' } = req.query;
    
    const excluded = JSON.parse(excludeIds);
    
    const matches = await matchingService.findMatches(userId, {
      limit: 1,
      excludeIds: excluded
    });

    if (matches.length === 0) {
      return res.json({
        success: true,
        match: null,
        message: 'No more matches available'
      });
    }

    res.json({
      success: true,
      match: matches[0]
    });
  } catch (error) {
    console.error('Error getting next match:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting next match',
      error: error.message
    });
  }
};

/**
 * @desc    Record match interaction (like/pass)
 * @route   POST /api/matchmaking/interact
 * @access  Private
 */
exports.recordInteraction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId, action } = req.body;

    if (!targetUserId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID and action are required'
      });
    }

    if (!['like', 'pass', 'superlike'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be like, pass, or superlike'
      });
    }

    const interaction = await matchingService.recordInteraction(
      userId,
      targetUserId,
      action
    );

    // Check for mutual match
    const mutualMatch = await matchingService.checkMutualMatch(userId, targetUserId);

    res.json({
      success: true,
      interaction,
      mutualMatch
    });
  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording interaction',
      error: error.message
    });
  }
};

/**
 * @desc    Get match compatibility details
 * @route   GET /api/matchmaking/compatibility/:userId
 * @access  Private
 */
exports.getCompatibility = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    const currentUser = await User.findById(currentUserId)
      .select('courses skills interests learningStyle studyPreferences availableHours department major bio')
      .lean();

    const targetUser = await User.findById(userId)
      .select('courses skills interests learningStyle studyPreferences availableHours department major bio')
      .lean();

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Ensure users are in vector store
    if (!vectorStore.hasUser(currentUserId.toString())) {
      vectorStore.addUser(currentUserId.toString(), currentUser);
    }
    if (!vectorStore.hasUser(userId)) {
      vectorStore.addUser(userId, targetUser);
    }

    const compatibilityScore = matchingService.calculateCompatibility(
      currentUser,
      targetUser
    );

    const matchReasons = matchingService.generateMatchReasons(
      currentUser,
      targetUser
    );

    const vectorSimilarity = vectorStore.calculateSimilarity(
      currentUserId.toString(),
      userId
    );

    res.json({
      success: true,
      compatibility: {
        score: compatibilityScore,
        reasons: matchReasons,
        vectorSimilarity,
        breakdown: {
          courses: this.getCourseOverlap(currentUser, targetUser),
          interests: this.getInterestOverlap(currentUser, targetUser),
          learningStyle: matchingService.calculateLearningStyleScore(
            currentUser.learningStyle,
            targetUser.learningStyle
          ),
          availability: matchingService.calculateAvailabilityOverlap(
            currentUser.availableHours || [],
            targetUser.availableHours || []
          )
        }
      }
    });
  } catch (error) {
    console.error('Error calculating compatibility:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating compatibility',
      error: error.message
    });
  }
};

/**
 * @desc    Sync user profile to vector store
 * @route   POST /api/matchmaking/sync
 * @access  Private
 */
exports.syncProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await matchingService.syncUserToVectorStore(userId);
    matchingService.clearCache(userId);

    res.json({
      success: true,
      message: 'Profile synced successfully'
    });
  } catch (error) {
    console.error('Error syncing profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing profile',
      error: error.message
    });
  }
};

/**
 * @desc    Sync all users to vector store (admin only)
 * @route   POST /api/matchmaking/sync-all
 * @access  Private/Admin
 */
exports.syncAllUsers = async (req, res) => {
  try {
    const count = await matchingService.syncAllUsers();

    res.json({
      success: true,
      message: `Synced ${count} users to vector store`
    });
  } catch (error) {
    console.error('Error syncing all users:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing users',
      error: error.message
    });
  }
};

/**
 * @desc    Search for study buddies by text query
 * @route   GET /api/matchmaking/search
 * @access  Private
 */
exports.searchStudyBuddies = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const results = vectorStore.searchByText(q, {
      limit: parseInt(limit),
      minScore: 0.1
    });

    // Fetch user details
    const userIds = results.map(r => r.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name profilePicture bio courses skills interests department')
      .lean();

    const enrichedResults = results.map(result => {
      const user = users.find(u => u._id.toString() === result.userId);
      return {
        ...result,
        user
      };
    });

    res.json({
      success: true,
      count: enrichedResults.length,
      results: enrichedResults
    });
  } catch (error) {
    console.error('Error searching study buddies:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching study buddies',
      error: error.message
    });
  }
};

// Helper methods
exports.getCourseOverlap = (user1, user2) => {
  const courses1 = new Set((user1.courses || []).map(c => (c.name || c).toLowerCase()));
  const courses2 = new Set((user2.courses || []).map(c => (c.name || c).toLowerCase()));
  const common = [...courses1].filter(c => courses2.has(c));
  return {
    common: common.length,
    total: courses1.size + courses2.size - common.length,
    percentage: common.length / Math.max(courses1.size, courses2.size, 1)
  };
};

exports.getInterestOverlap = (user1, user2) => {
  const interests1 = new Set((user1.interests || []).map(i => i.toLowerCase()));
  const interests2 = new Set((user2.interests || []).map(i => i.toLowerCase()));
  const common = [...interests1].filter(i => interests2.has(i));
  return {
    common: common.length,
    total: interests1.size + interests2.size - common.length,
    percentage: common.length / Math.max(interests1.size, interests2.size, 1)
  };
};
