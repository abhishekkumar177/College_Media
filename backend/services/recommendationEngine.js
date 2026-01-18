/**
 * Recommendation Engine
 * Issue #921: AI-Powered Content Recommendation Engine
 * 
 * Hybrid recommendation system combining multiple approaches.
 */

const RecommendationScore = require('../models/RecommendationScore');
const UserInteraction = require('../models/UserInteraction');
const collaborativeFilteringService = require('./collaborativeFilteringService');
const contentBasedFilteringService = require('./contentBasedFilteringService');

class RecommendationEngine {

    constructor() {
        // Algorithm weights
        this.weights = {
            collaborative: 0.4,
            contentBased: 0.3,
            popularity: 0.2,
            recency: 0.1
        };

        // Cache for frequent requests
        this.recommendationCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get personalized recommendations
     */
    async getRecommendations(userId, options = {}) {
        const {
            type = 'post',
            limit = 20,
            includeExplanations = true,
            minScore = 0.1
        } = options;

        try {
            // Check cache
            const cacheKey = `${userId}_${type}_${limit}`;
            const cached = this.recommendationCache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.recommendations;
            }

            // Get recommendations from each algorithm
            const [collaborative, contentBased, trending] = await Promise.all([
                this.getCollaborativeRecommendations(userId, type, limit * 2),
                this.getContentBasedRecommendations(userId, type, limit * 2),
                this.getTrendingRecommendations(type, limit)
            ]);

            // Merge and score recommendations
            const merged = this.mergeRecommendations(
                collaborative,
                contentBased,
                trending,
                userId
            );

            // Apply diversity
            const diversified = this.applyDiversity(merged, limit);

            // Filter by minimum score
            const filtered = diversified.filter(r => r.finalScore >= minScore);

            // Add explanations if requested
            const recommendations = includeExplanations
                ? filtered.map(r => this.addExplanation(r))
                : filtered;

            // Cache results
            this.recommendationCache.set(cacheKey, {
                recommendations,
                timestamp: Date.now()
            });

            // Store recommendations for metrics
            await this.storeRecommendations(userId, type, recommendations);

            return recommendations;
        } catch (error) {
            console.error('[RecommendationEngine] Error:', error);
            return [];
        }
    }

    /**
     * Get collaborative filtering recommendations
     */
    async getCollaborativeRecommendations(userId, type, limit) {
        return collaborativeFilteringService.getRecommendations(userId, type, limit);
    }

    /**
     * Get content-based recommendations
     */
    async getContentBasedRecommendations(userId, type, limit) {
        try {
            // Get user's liked posts
            const likedPosts = await this.getUserLikedItems(userId, type);

            if (likedPosts.length === 0) {
                return [];
            }

            // Get candidate posts (simplified - would query posts collection)
            const candidatePosts = await this.getCandidatePosts(userId, type, limit * 3);

            return contentBasedFilteringService.getRecommendations(
                userId,
                likedPosts,
                candidatePosts,
                limit
            );
        } catch (error) {
            console.error('[RecommendationEngine] Content-based error:', error);
            return [];
        }
    }

    /**
     * Get trending recommendations
     */
    async getTrendingRecommendations(type, limit) {
        try {
            const trending = await UserInteraction.getTrendingItems(type, 24, limit);

            return trending.map(item => ({
                itemId: item.itemId,
                score: item.trendScore / 100, // Normalize
                reason: 'trending',
                trendData: {
                    interactions: item.interactionCount,
                    uniqueUsers: item.uniqueUsers
                }
            }));
        } catch (error) {
            console.error('[RecommendationEngine] Trending error:', error);
            return [];
        }
    }

    /**
     * Merge recommendations from different sources
     */
    mergeRecommendations(collaborative, contentBased, trending, userId) {
        const scoreMap = new Map();

        // Add collaborative scores
        for (const rec of collaborative) {
            const key = rec.itemId.toString();
            scoreMap.set(key, {
                itemId: rec.itemId,
                scores: {
                    collaborative: rec.score * this.weights.collaborative,
                    contentBased: 0,
                    popularity: 0,
                    recency: 0
                },
                reasons: [rec.reason],
                metadata: rec
            });
        }

        // Add content-based scores
        for (const rec of contentBased) {
            const key = rec.itemId.toString();
            const existing = scoreMap.get(key);

            if (existing) {
                existing.scores.contentBased = rec.score * this.weights.contentBased;
                existing.reasons.push(rec.reason);
            } else {
                scoreMap.set(key, {
                    itemId: rec.itemId,
                    scores: {
                        collaborative: 0,
                        contentBased: rec.score * this.weights.contentBased,
                        popularity: 0,
                        recency: 0
                    },
                    reasons: [rec.reason],
                    metadata: rec
                });
            }
        }

        // Add trending scores
        for (const rec of trending) {
            const key = rec.itemId.toString();
            const existing = scoreMap.get(key);

            if (existing) {
                existing.scores.popularity = rec.score * this.weights.popularity;
                existing.reasons.push(rec.reason);
            } else {
                scoreMap.set(key, {
                    itemId: rec.itemId,
                    scores: {
                        collaborative: 0,
                        contentBased: 0,
                        popularity: rec.score * this.weights.popularity,
                        recency: 0
                    },
                    reasons: [rec.reason],
                    metadata: rec
                });
            }
        }

        // Calculate final scores
        const merged = Array.from(scoreMap.values()).map(item => {
            const finalScore =
                item.scores.collaborative +
                item.scores.contentBased +
                item.scores.popularity +
                item.scores.recency;

            return {
                itemId: item.itemId,
                scores: item.scores,
                finalScore,
                reasons: [...new Set(item.reasons)],
                metadata: item.metadata
            };
        });

        // Sort by final score
        merged.sort((a, b) => b.finalScore - a.finalScore);

        return merged;
    }

    /**
     * Apply diversity to recommendations
     */
    applyDiversity(recommendations, limit) {
        // Simple diversity: don't recommend too many items from same source
        const diversified = [];
        const authorCounts = {};
        const maxPerAuthor = 3;

        for (const rec of recommendations) {
            if (diversified.length >= limit) break;

            const author = rec.metadata?.author?.toString() || 'unknown';
            authorCounts[author] = (authorCounts[author] || 0) + 1;

            if (authorCounts[author] <= maxPerAuthor) {
                diversified.push(rec);
            }
        }

        return diversified;
    }

    /**
     * Add explanation to recommendation
     */
    addExplanation(rec) {
        const explanations = {
            'liked_by_similar_users': 'People with similar interests liked this',
            'similar_to_liked_content': 'Similar to posts you\'ve enjoyed',
            'trending': 'Trending in your community',
            'related_to_interests': 'Based on your interests'
        };

        const primaryReason = rec.reasons[0];

        return {
            ...rec,
            explanation: {
                text: explanations[primaryReason] || 'Recommended for you',
                reasons: rec.reasons,
                confidence: Math.min(rec.finalScore * 100, 100).toFixed(1)
            }
        };
    }

    /**
     * Store recommendations for metrics
     */
    async storeRecommendations(userId, type, recommendations) {
        try {
            const operations = recommendations.slice(0, 50).map(rec => ({
                updateOne: {
                    filter: {
                        userId,
                        itemId: rec.itemId,
                        type
                    },
                    update: {
                        $set: {
                            scores: rec.scores,
                            finalScore: rec.finalScore,
                            explanation: rec.explanation,
                            algorithm: {
                                version: '1.0',
                                weights: this.weights
                            },
                            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                        }
                    },
                    upsert: true
                }
            }));

            await RecommendationScore.bulkWrite(operations);
        } catch (error) {
            console.error('[RecommendationEngine] Store error:', error);
        }
    }

    /**
     * Get user's liked items
     */
    async getUserLikedItems(userId, type) {
        // In production, would join with Posts collection
        return UserInteraction.find({
            userId,
            itemType: type,
            interactionType: { $in: ['like', 'save'] }
        })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();
    }

    /**
     * Get candidate posts for recommendations
     */
    async getCandidatePosts(userId, type, limit) {
        // In production, would query Posts collection
        // Excluding already seen posts
        return [];
    }

    /**
     * Handle cold start for new users
     */
    async getColdStartRecommendations(userId, limit = 20) {
        // For new users, return popular and trending content
        const trending = await this.getTrendingRecommendations('post', limit);

        return trending.map(rec => ({
            ...rec,
            explanation: {
                text: 'Popular in your community',
                reasons: ['cold_start', 'trending'],
                confidence: '75.0'
            }
        }));
    }

    /**
     * Get user-to-follow recommendations
     */
    async getUserRecommendations(userId, limit = 10) {
        try {
            const similarUsers = await collaborativeFilteringService.findSimilarUsers(userId, limit * 2);

            // Get who similar users follow
            const followSuggestions = await UserInteraction.aggregate([
                {
                    $match: {
                        userId: { $in: similarUsers.map(u => u.userId) },
                        interactionType: 'follow'
                    }
                },
                {
                    $group: {
                        _id: '$itemId',
                        count: { $sum: 1 },
                        similarUsers: { $push: '$userId' }
                    }
                },
                {
                    $match: { count: { $gte: 2 } }
                },
                { $sort: { count: -1 } },
                { $limit: limit }
            ]);

            return followSuggestions.map(s => ({
                itemId: s._id,
                score: s.count / similarUsers.length,
                reason: 'followed_by_similar_users',
                similarUsersCount: s.count
            }));
        } catch (error) {
            console.error('[RecommendationEngine] User recommendations error:', error);
            return [];
        }
    }

    /**
     * Update weights based on A/B testing
     */
    updateWeights(newWeights) {
        this.weights = { ...this.weights, ...newWeights };
        this.recommendationCache.clear();
    }

    /**
     * Clear cache
     */
    clearCache(userId = null) {
        if (userId) {
            for (const key of this.recommendationCache.keys()) {
                if (key.startsWith(userId)) {
                    this.recommendationCache.delete(key);
                }
            }
        } else {
            this.recommendationCache.clear();
        }
    }
}

module.exports = new RecommendationEngine();
