/**
 * Vector Store Service
 * Handles user profile embeddings for semantic similarity matching
 * Uses TF-IDF vectorization for lightweight local implementation
 */

const natural = require('natural');
const TfIdf = natural.TfIdf;

class VectorStore {
  constructor() {
    this.tfidf = new TfIdf();
    this.userVectors = new Map(); // userId -> { vector, metadata }
    this.documentIndex = new Map(); // userId -> documentIndex
  }

  /**
   * Generate text representation from user profile
   */
  generateProfileText(user) {
    const parts = [];
    
    // Add bio/description
    if (user.bio) parts.push(user.bio);
    if (user.description) parts.push(user.description);
    
    // Add skills/interests
    if (user.skills && Array.isArray(user.skills)) {
      parts.push(user.skills.join(' '));
    }
    if (user.interests && Array.isArray(user.interests)) {
      parts.push(user.interests.join(' '));
    }
    
    // Add courses
    if (user.courses && Array.isArray(user.courses)) {
      parts.push(user.courses.map(c => c.name || c).join(' '));
    }
    
    // Add major/department
    if (user.major) parts.push(user.major);
    if (user.department) parts.push(user.department);
    
    // Add learning style preferences
    if (user.learningStyle) {
      parts.push(user.learningStyle.replace(/_/g, ' '));
    }
    
    // Add study preferences
    if (user.studyPreferences) {
      if (user.studyPreferences.environment) {
        parts.push(user.studyPreferences.environment);
      }
      if (user.studyPreferences.groupSize) {
        parts.push(user.studyPreferences.groupSize);
      }
      if (user.studyPreferences.subjects && Array.isArray(user.studyPreferences.subjects)) {
        parts.push(user.studyPreferences.subjects.join(' '));
      }
    }
    
    return parts.join(' ').toLowerCase();
  }

  /**
   * Add or update user profile in vector store
   */
  addUser(userId, userProfile) {
    const profileText = this.generateProfileText(userProfile);
    
    // Remove old document if exists
    if (this.documentIndex.has(userId)) {
      const oldIndex = this.documentIndex.get(userId);
      // TF-IDF doesn't support removal, so we'll rebuild when needed
    }
    
    // Add new document
    this.tfidf.addDocument(profileText);
    const docIndex = this.tfidf.documents.length - 1;
    this.documentIndex.set(userId, docIndex);
    
    // Store metadata
    this.userVectors.set(userId, {
      docIndex,
      profileText,
      metadata: {
        courses: userProfile.courses || [],
        skills: userProfile.skills || [],
        interests: userProfile.interests || [],
        learningStyle: userProfile.learningStyle,
        studyPreferences: userProfile.studyPreferences || {},
        availableHours: userProfile.availableHours || [],
        timezone: userProfile.timezone
      }
    });
    
    return docIndex;
  }

  /**
   * Remove user from vector store
   */
  removeUser(userId) {
    this.userVectors.delete(userId);
    this.documentIndex.delete(userId);
  }

  /**
   * Calculate cosine similarity between two users
   */
  calculateSimilarity(userId1, userId2) {
    const doc1 = this.userVectors.get(userId1);
    const doc2 = this.userVectors.get(userId2);
    
    if (!doc1 || !doc2) return 0;
    
    // Get term vectors
    const terms1 = new Map();
    const terms2 = new Map();
    
    this.tfidf.listTerms(doc1.docIndex).forEach(item => {
      terms1.set(item.term, item.tfidf);
    });
    
    this.tfidf.listTerms(doc2.docIndex).forEach(item => {
      terms2.set(item.term, item.tfidf);
    });
    
    // Calculate cosine similarity
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    // Combine all unique terms
    const allTerms = new Set([...terms1.keys(), ...terms2.keys()]);
    
    allTerms.forEach(term => {
      const val1 = terms1.get(term) || 0;
      const val2 = terms2.get(term) || 0;
      dotProduct += val1 * val2;
      magnitude1 += val1 * val1;
      magnitude2 += val2 * val2;
    });
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
  }

  /**
   * Find similar users based on profile similarity
   */
  findSimilarUsers(userId, options = {}) {
    const {
      limit = 10,
      minSimilarity = 0.1,
      excludeIds = []
    } = options;
    
    if (!this.userVectors.has(userId)) {
      return [];
    }
    
    const similarities = [];
    const excludeSet = new Set([userId, ...excludeIds]);
    
    for (const [otherUserId, _] of this.userVectors) {
      if (excludeSet.has(otherUserId)) continue;
      
      const similarity = this.calculateSimilarity(userId, otherUserId);
      
      if (similarity >= minSimilarity) {
        similarities.push({
          userId: otherUserId,
          similarity,
          metadata: this.userVectors.get(otherUserId).metadata
        });
      }
    }
    
    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return similarities.slice(0, limit);
  }

  /**
   * Search users by text query
   */
  searchByText(query, options = {}) {
    const {
      limit = 10,
      minScore = 0.1
    } = options;
    
    // Create temporary document for query
    const queryText = query.toLowerCase();
    this.tfidf.addDocument(queryText);
    const queryIndex = this.tfidf.documents.length - 1;
    
    const results = [];
    
    for (const [userId, userData] of this.userVectors) {
      const score = this.calculateSimilarityByIndex(queryIndex, userData.docIndex);
      
      if (score >= minScore) {
        results.push({
          userId,
          score,
          metadata: userData.metadata
        });
      }
    }
    
    // Remove temporary query document
    this.tfidf.documents.pop();
    
    // Sort by score
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, limit);
  }

  /**
   * Calculate similarity between document indices
   */
  calculateSimilarityByIndex(index1, index2) {
    const terms1 = new Map();
    const terms2 = new Map();
    
    this.tfidf.listTerms(index1).forEach(item => {
      terms1.set(item.term, item.tfidf);
    });
    
    this.tfidf.listTerms(index2).forEach(item => {
      terms2.set(item.term, item.tfidf);
    });
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    const allTerms = new Set([...terms1.keys(), ...terms2.keys()]);
    
    allTerms.forEach(term => {
      const val1 = terms1.get(term) || 0;
      const val2 = terms2.get(term) || 0;
      dotProduct += val1 * val2;
      magnitude1 += val1 * val1;
      magnitude2 += val2 * val2;
    });
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
  }

  /**
   * Get total number of users in vector store
   */
  getUserCount() {
    return this.userVectors.size;
  }

  /**
   * Check if user exists in vector store
   */
  hasUser(userId) {
    return this.userVectors.has(userId);
  }

  /**
   * Clear all vectors
   */
  clear() {
    this.tfidf = new TfIdf();
    this.userVectors.clear();
    this.documentIndex.clear();
  }

  /**
   * Rebuild entire index (useful after bulk deletions)
   */
  rebuildIndex(users) {
    this.clear();
    users.forEach(user => {
      this.addUser(user._id.toString(), user);
    });
  }
}

// Singleton instance
const vectorStore = new VectorStore();

module.exports = vectorStore;
