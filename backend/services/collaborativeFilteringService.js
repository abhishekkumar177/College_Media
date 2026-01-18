/**
 * Collaborative Filtering Service
 * Issue #921: AI-Powered Content Recommendation Engine
 * 
 * Implements user-user collaborative filtering for recommendations.
 */

const UserInteraction = require('../models/UserInteraction');
const similarityCalculator = require('../utils/similarityCalculator');

class CollaborativeFilteringService {

    constructor() {
        this.userSimilarityCache = new Map();
        this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Get recommendations using user-user collaborative filtering
     */
    async getRecommendations(userId, itemType = 'post', limit = 20) {
        try {
            // Step 1: Find similar users
            const similarUsers = await this.findSimilarUsers(userId);

            if (similarUsers.length === 0) {
                return [];
            }

            // Step 2: Get items liked by similar users that current user hasn't seen
            const recommendations = await this.getItemsFromSimilarUsers(
                userId,
                similarUsers,
                itemType,
                limit
            );

            return recommendations;
        } catch (error) {
            console.error('[CollaborativeFiltering] Recommendation error:', error);
            return [];
        }
    }

    /**
     * Find users similar to target user
     */
    async findSimilarUsers(userId, limit = 50) {
        // Check cache
        const cacheKey = userId.toString();
        const cached = this.userSimilarityCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.users;
        }

        try {
            // Get user's interaction history
            const userInteractions = await UserInteraction.find({
                userId,
                interactionType: { $in: ['like', 'save', 'share', 'comment'] }
            }).lean();

            if (userInteractions.length === 0) {
                return [];
            }

            // Build user's item set
            const userItems = new Set(userInteractions.map(i => i.itemId.toString()));

            // Find users who interacted with same items
            const candidateUsers = await UserInteraction.aggregate([
                {
                    $match: {
                        itemId: { $in: Array.from(userItems).map(id => new require('mongoose').Types.ObjectId(id)) },
                        userId: { $ne: userId },
                        interactionType: { $in: ['like', 'save', 'share', 'comment'] }
                    }
                },
                {
                    $group: {
                        _id: '$userId',
                        items: { $addToSet: '$itemId' }
                    }
                }
            ]);

            // Calculate similarity for each candidate
            const similarUsers = [];

            for (const candidate of candidateUsers) {
                const candidateItems = new Set(candidate.items.map(i => i.toString()));

                const similarity = similarityCalculator.jaccardSimilarity(userItems, candidateItems);

                if (similarity > 0.1) { // Minimum similarity threshold
                    similarUsers.push({
                        userId: candidate._id,
                        similarity,
                        commonItems: Array.from(userItems).filter(i => candidateItems.has(i)).length
                    });
                }
            }

            // Sort by similarity
            similarUsers.sort((a, b) => b.similarity - a.similarity);
            const topUsers = similarUsers.slice(0, limit);

            // Cache results
            this.userSimilarityCache.set(cacheKey, {
                users: topUsers,
                timestamp: Date.now()
            });

            return topUsers;
        } catch (error) {
            console.error('[CollaborativeFiltering] Find similar users error:', error);
            return [];
        }
    }

    /**
     * Get items from similar users
     */
    async getItemsFromSimilarUsers(userId, similarUsers, itemType, limit) {
        try {
            // Get items current user has already interacted with
            const userInteractedItems = await UserInteraction.find({
                userId,
                itemType
            }).distinct('itemId');

            const seenItems = new Set(userInteractedItems.map(i => i.toString()));

            // Get items from similar users weighted by similarity
            const itemScores = new Map();

            for (const simUser of similarUsers) {
                const simUserInteractions = await UserInteraction.find({
                    userId: simUser.userId,
                    itemType,
                    interactionType: { $in: ['like', 'save', 'share'] }
                }).lean();

                for (const interaction of simUserInteractions) {
                    const itemId = interaction.itemId.toString();

                    if (seenItems.has(itemId)) continue;

                    const currentScore = itemScores.get(itemId) || { score: 0, users: 0 };

                    // Weight by similarity and interaction weight
                    const weight = interaction.weight * simUser.similarity;

                    itemScores.set(itemId, {
                        score: currentScore.score + weight,
                        users: currentScore.users + 1,
                        itemId
                    });
                }
            }

            // Sort by score and return top items
            const recommendations = Array.from(itemScores.values())
                .sort((a, b) => b.score - a.score)
                .slice(0, limit)
                .map(item => ({
                    itemId: item.itemId,
                    score: item.score,
                    reason: 'liked_by_similar_users',
                    similarUsers: item.users
                }));

            return recommendations;
        } catch (error) {
            console.error('[CollaborativeFiltering] Get items error:', error);
            return [];
        }
    }

    /**
     * Calculate user-user similarity matrix (for batch processing)
     */
    async buildSimilarityMatrix(userIds) {
        const matrix = {};

        for (let i = 0; i < userIds.length; i++) {
            matrix[userIds[i]] = {};

            for (let j = i + 1; j < userIds.length; j++) {
                const similarity = await this.calculateUserSimilarity(userIds[i], userIds[j]);

                matrix[userIds[i]][userIds[j]] = similarity;

                if (!matrix[userIds[j]]) matrix[userIds[j]] = {};
                matrix[userIds[j]][userIds[i]] = similarity;
            }
        }

        return matrix;
    }

    /**
     * Calculate similarity between two users
     */
    async calculateUserSimilarity(userId1, userId2) {
        const [user1Items, user2Items] = await Promise.all([
            UserInteraction.find({
                userId: userId1,
                interactionType: { $in: ['like', 'save'] }
            }).distinct('itemId'),
            UserInteraction.find({
                userId: userId2,
                interactionType: { $in: ['like', 'save'] }
            }).distinct('itemId')
        ]);

        const set1 = new Set(user1Items.map(i => i.toString()));
        const set2 = new Set(user2Items.map(i => i.toString()));

        return similarityCalculator.jaccardSimilarity(set1, set2);
    }

    /**
     * Clear similarity cache
     */
    clearCache(userId = null) {
        if (userId) {
            this.userSimilarityCache.delete(userId.toString());
        } else {
            this.userSimilarityCache.clear();
        }
    }
}

module.exports = new CollaborativeFilteringService();
