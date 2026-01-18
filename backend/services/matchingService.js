/**
 * Matching Service
 * Implements intelligent study buddy matching algorithm
 * Considers learning styles, courses, availability, and semantic similarity
 */

const vectorStore = require('./vectorStore');
const User = require('../models/User');

class MatchingService {
  constructor() {
    this.matchCache = new Map(); // userId -> cached matches
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Calculate compatibility score between two users
   * Returns score from 0-100
   */
  calculateCompatibility(user1, user2) {
    let score = 0;
    let weights = {
      vectorSimilarity: 30,
      commonCourses: 25,
      learningStyle: 15,
      availabilityOverlap: 15,
      commonInterests: 10,
      proximityBonus: 5
    };

    // 1. Vector Similarity (30 points)
    const vectorSim = vectorStore.calculateSimilarity(
      user1._id.toString(),
      user2._id.toString()
    );
    score += vectorSim * weights.vectorSimilarity;

    // 2. Common Courses (25 points)
    const courses1 = new Set(
      (user1.courses || []).map(c => (c.name || c).toLowerCase())
    );
    const courses2 = new Set(
      (user2.courses || []).map(c => (c.name || c).toLowerCase())
    );
    const commonCourses = [...courses1].filter(c => courses2.has(c));
    const courseScore = Math.min(commonCourses.length / 3, 1); // Max at 3 common courses
    score += courseScore * weights.commonCourses;

    // 3. Learning Style Compatibility (15 points)
    const learningScore = this.calculateLearningStyleScore(
      user1.learningStyle,
      user2.learningStyle
    );
    score += learningScore * weights.learningStyle;

    // 4. Availability Overlap (15 points)
    const availabilityScore = this.calculateAvailabilityOverlap(
      user1.availableHours || [],
      user2.availableHours || []
    );
    score += availabilityScore * weights.availabilityOverlap;

    // 5. Common Interests (10 points)
    const interests1 = new Set((user1.interests || []).map(i => i.toLowerCase()));
    const interests2 = new Set((user2.interests || []).map(i => i.toLowerCase()));
    const commonInterests = [...interests1].filter(i => interests2.has(i));
    const interestScore = Math.min(commonInterests.length / 5, 1);
    score += interestScore * weights.commonInterests;

    // 6. Proximity Bonus (5 points) - same department/major
    if (user1.department && user2.department && 
        user1.department.toLowerCase() === user2.department.toLowerCase()) {
      score += weights.proximityBonus;
    }

    return Math.round(score);
  }

  /**
   * Calculate learning style compatibility
   */
  calculateLearningStyleScore(style1, style2) {
    if (!style1 || !style2) return 0.5; // Neutral if not specified

    // Compatible learning styles
    const compatibilityMatrix = {
      'visual': ['visual', 'reading_writing'],
      'auditory': ['auditory', 'kinesthetic'],
      'reading_writing': ['reading_writing', 'visual'],
      'kinesthetic': ['kinesthetic', 'auditory'],
      'collaborative': ['collaborative', 'social'],
      'independent': ['independent', 'solitary'],
      'social': ['social', 'collaborative'],
      'solitary': ['solitary', 'independent']
    };

    const style1Lower = style1.toLowerCase();
    const style2Lower = style2.toLowerCase();

    if (style1Lower === style2Lower) return 1.0; // Perfect match
    
    const compatible = compatibilityMatrix[style1Lower] || [];
    if (compatible.includes(style2Lower)) return 0.75; // Compatible
    
    return 0.3; // Different but workable
  }

  /**
   * Calculate availability overlap
   * availableHours format: ['monday_morning', 'tuesday_afternoon', ...]
   */
  calculateAvailabilityOverlap(hours1, hours2) {
    if (!hours1.length || !hours2.length) return 0.5; // Neutral if not specified

    const set1 = new Set(hours1.map(h => h.toLowerCase()));
    const set2 = new Set(hours2.map(h => h.toLowerCase()));
    
    const overlap = [...set1].filter(h => set2.has(h));
    const union = new Set([...set1, ...set2]);
    
    if (union.size === 0) return 0;
    
    return overlap.length / union.size; // Jaccard similarity
  }

  /**
   * Find matches for a user
   */
  async findMatches(userId, options = {}) {
    const {
      limit = 20,
      minScore = 40,
      excludeIds = [],
      refresh = false
    } = options;

    // Check cache
    const cacheKey = userId.toString();
    if (!refresh && this.matchCache.has(cacheKey)) {
      const cached = this.matchCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.matches.slice(0, limit);
      }
    }

    // Get current user
    const currentUser = await User.findById(userId)
      .select('courses skills interests learningStyle studyPreferences availableHours department major bio')
      .lean();

    if (!currentUser) {
      throw new Error('User not found');
    }

    // Ensure user is in vector store
    if (!vectorStore.hasUser(userId.toString())) {
      vectorStore.addUser(userId.toString(), currentUser);
    }

    // Get similar users from vector store
    const similarUsers = vectorStore.findSimilarUsers(userId.toString(), {
      limit: 100, // Get more candidates than needed
      minSimilarity: 0.05,
      excludeIds: excludeIds.map(id => id.toString())
    });

    // Fetch full user data for candidates
    const candidateIds = similarUsers.map(s => s.userId);
    const candidates = await User.find({
      _id: { $in: candidateIds }
    })
    .select('name profilePicture courses skills interests learningStyle studyPreferences availableHours department major bio')
    .lean();

    // Calculate compatibility scores
    const matches = candidates.map(candidate => {
      const compatibility = this.calculateCompatibility(currentUser, candidate);
      const vectorSim = similarUsers.find(s => s.userId === candidate._id.toString());
      
      return {
        user: {
          _id: candidate._id,
          name: candidate.name,
          profilePicture: candidate.profilePicture,
          bio: candidate.bio,
          courses: candidate.courses,
          skills: candidate.skills,
          interests: candidate.interests,
          learningStyle: candidate.learningStyle,
          department: candidate.department
        },
        compatibilityScore: compatibility,
        matchReasons: this.generateMatchReasons(currentUser, candidate),
        vectorSimilarity: vectorSim ? vectorSim.similarity : 0
      };
    });

    // Filter by minimum score and sort
    const filteredMatches = matches
      .filter(m => m.compatibilityScore >= minScore)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Cache results
    this.matchCache.set(cacheKey, {
      matches: filteredMatches,
      timestamp: Date.now()
    });

    return filteredMatches.slice(0, limit);
  }

  /**
   * Generate human-readable match reasons
   */
  generateMatchReasons(user1, user2) {
    const reasons = [];

    // Common courses
    const courses1 = (user1.courses || []).map(c => (c.name || c).toLowerCase());
    const courses2 = (user2.courses || []).map(c => (c.name || c).toLowerCase());
    const commonCourses = courses1.filter(c => courses2.includes(c));
    
    if (commonCourses.length > 0) {
      const courseNames = commonCourses.slice(0, 3).join(', ');
      reasons.push(`Taking ${commonCourses.length} common ${commonCourses.length === 1 ? 'course' : 'courses'}: ${courseNames}`);
    }

    // Learning style
    if (user1.learningStyle && user2.learningStyle) {
      if (user1.learningStyle === user2.learningStyle) {
        reasons.push(`Both prefer ${user1.learningStyle.replace(/_/g, ' ')} learning`);
      }
    }

    // Common interests
    const interests1 = (user1.interests || []).map(i => i.toLowerCase());
    const interests2 = (user2.interests || []).map(i => i.toLowerCase());
    const commonInterests = interests1.filter(i => interests2.includes(i));
    
    if (commonInterests.length > 0) {
      const interestNames = commonInterests.slice(0, 3).join(', ');
      reasons.push(`Shared interests: ${interestNames}`);
    }

    // Same department
    if (user1.department && user2.department && 
        user1.department.toLowerCase() === user2.department.toLowerCase()) {
      reasons.push(`Both in ${user1.department} department`);
    }

    // Availability overlap
    const overlap = this.calculateAvailabilityOverlap(
      user1.availableHours || [],
      user2.availableHours || []
    );
    if (overlap > 0.5) {
      reasons.push('Similar study schedules');
    }

    return reasons.length > 0 ? reasons : ['Compatible study preferences'];
  }

  /**
   * Record a match interaction (like/pass)
   */
  async recordInteraction(userId, targetUserId, action) {
    // This could be extended to store in database for learning
    // For now, just invalidate cache
    this.matchCache.delete(userId.toString());
    
    return {
      userId,
      targetUserId,
      action,
      timestamp: new Date()
    };
  }

  /**
   * Check if two users have mutually liked each other
   */
  async checkMutualMatch(user1Id, user2Id) {
    // This would query a MatchInteraction model
    // Placeholder for now
    return false;
  }

  /**
   * Clear match cache for user (call when profile updates)
   */
  clearCache(userId) {
    this.matchCache.delete(userId.toString());
  }

  /**
   * Sync user profile to vector store
   */
  async syncUserToVectorStore(userId) {
    const user = await User.findById(userId)
      .select('courses skills interests learningStyle studyPreferences availableHours department major bio description')
      .lean();
    
    if (user) {
      vectorStore.addUser(userId.toString(), user);
    }
  }

  /**
   * Bulk sync all users to vector store
   */
  async syncAllUsers() {
    const users = await User.find({})
      .select('courses skills interests learningStyle studyPreferences availableHours department major bio description')
      .lean();
    
    vectorStore.rebuildIndex(users);
    
    return users.length;
  }
}

// Singleton instance
const matchingService = new MatchingService();

module.exports = matchingService;
