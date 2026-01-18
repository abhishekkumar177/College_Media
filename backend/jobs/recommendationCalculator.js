/**
 * Recommendation Calculator Job
 * Issue #921: AI-Powered Content Recommendation Engine
 * 
 * Background job for pre-computing recommendations.
 */

const RecommendationScore = require('../models/RecommendationScore');
const UserInteraction = require('../models/UserInteraction');
const recommendationEngine = require('../services/recommendationEngine');
const collaborativeFilteringService = require('../services/collaborativeFilteringService');
const contentBasedFilteringService = require('../services/contentBasedFilteringService');

class RecommendationCalculator {

    constructor() {
        this.isRunning = false;
        this.batchSize = 50;
        this.interval = null;
    }

    /**
     * Start periodic calculation
     */
    start(intervalMs = 60 * 60 * 1000) { // Default: every hour
        if (this.isRunning) return;

        this.isRunning = true;
        console.log('[RecommendationCalculator] Started');

        // Initial run
        this.calculateAll();

        // Schedule periodic runs
        this.interval = setInterval(() => this.calculateAll(), intervalMs);
    }

    /**
     * Stop calculator
     */
    stop() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        console.log('[RecommendationCalculator] Stopped');
    }

    /**
     * Calculate recommendations for all active users
     */
    async calculateAll() {
        console.log('[RecommendationCalculator] Starting batch calculation...');

        try {
            // Get active users (users with recent interactions)
            const activeUsers = await this.getActiveUsers();

            console.log(`[RecommendationCalculator] Processing ${activeUsers.length} users`);

            // Process in batches
            for (let i = 0; i < activeUsers.length; i += this.batchSize) {
                const batch = activeUsers.slice(i, i + this.batchSize);
                await this.processBatch(batch);

                // Small delay between batches
                await this.sleep(1000);
            }

            // Update trending content
            await this.updateTrending();

            console.log('[RecommendationCalculator] Batch calculation complete');
        } catch (error) {
            console.error('[RecommendationCalculator] Error:', error);
        }
    }

    /**
     * Get active users
     */
    async getActiveUsers() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const users = await UserInteraction.aggregate([
            {
                $match: {
                    timestamp: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    lastActivity: { $max: '$timestamp' },
                    interactionCount: { $sum: 1 }
                }
            },
            {
                $match: {
                    interactionCount: { $gte: 5 } // Minimum activity threshold
                }
            },
            { $sort: { lastActivity: -1 } },
            { $limit: 10000 }
        ]);

        return users.map(u => u._id);
    }

    /**
     * Process batch of users
     */
    async processBatch(userIds) {
        const promises = userIds.map(userId =>
            this.calculateForUser(userId).catch(err => {
                console.error(`[RecommendationCalculator] User ${userId} error:`, err);
            })
        );

        await Promise.all(promises);
    }

    /**
     * Calculate recommendations for single user
     */
    async calculateForUser(userId) {
        try {
            // Calculate post recommendations
            await recommendationEngine.getRecommendations(userId, {
                type: 'post',
                limit: 50,
                includeExplanations: true
            });

            // Calculate user recommendations
            await recommendationEngine.getUserRecommendations(userId, 20);

            // Update similar users cache
            await collaborativeFilteringService.findSimilarUsers(userId);

        } catch (error) {
            throw error;
        }
    }

    /**
     * Update trending content
     */
    async updateTrending() {
        try {
            console.log('[RecommendationCalculator] Updating trending content...');

            // Calculate trending for different time windows
            const timeWindows = [1, 6, 24, 168]; // 1h, 6h, 24h, 7d

            for (const hours of timeWindows) {
                await UserInteraction.getTrendingItems('post', hours, 100);
            }

        } catch (error) {
            console.error('[RecommendationCalculator] Trending update error:', error);
        }
    }

    /**
     * Recalculate for specific user (on-demand)
     */
    async recalculateForUser(userId) {
        console.log(`[RecommendationCalculator] Recalculating for user ${userId}`);

        // Clear caches
        recommendationEngine.clearCache(userId);
        collaborativeFilteringService.clearCache(userId);

        // Delete old recommendations
        await RecommendationScore.deleteMany({
            userId,
            expiresAt: { $lt: new Date() }
        });

        // Calculate new recommendations
        await this.calculateForUser(userId);

        return true;
    }

    /**
     * Update IDF for content-based filtering
     */
    async updateIDF() {
        try {
            console.log('[RecommendationCalculator] Updating IDF...');

            // In production, would fetch recent posts
            const recentPosts = [];

            await contentBasedFilteringService.updateIDF(recentPosts);

        } catch (error) {
            console.error('[RecommendationCalculator] IDF update error:', error);
        }
    }

    /**
     * Clean up expired recommendations
     */
    async cleanup() {
        try {
            console.log('[RecommendationCalculator] Cleaning up expired recommendations...');

            const result = await RecommendationScore.deleteMany({
                expiresAt: { $lt: new Date() }
            });

            console.log(`[RecommendationCalculator] Deleted ${result.deletedCount} expired recommendations`);

        } catch (error) {
            console.error('[RecommendationCalculator] Cleanup error:', error);
        }
    }

    /**
     * Get job statistics
     */
    async getStats() {
        const [totalRecommendations, activeUsers, recentInteractions] = await Promise.all([
            RecommendationScore.countDocuments(),
            this.getActiveUsers(),
            UserInteraction.countDocuments({
                timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            })
        ]);

        return {
            totalRecommendations,
            activeUsersCount: activeUsers.length,
            recentInteractions,
            isRunning: this.isRunning
        };
    }

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new RecommendationCalculator();
