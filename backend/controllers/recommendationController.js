/**
 * Recommendation Controller
 * Issue #921: AI-Powered Content Recommendation Engine
 * 
 * API endpoints for recommendations.
 */

const recommendationEngine = require('../services/recommendationEngine');
const RecommendationScore = require('../models/RecommendationScore');
const UserInteraction = require('../models/UserInteraction');

const recommendationController = {

    /**
     * GET /api/recommendations
     * Get personalized recommendations
     */
    async getRecommendations(req, res) {
        try {
            const userId = req.user._id;
            const { type = 'post', limit = 20 } = req.query;

            const recommendations = await recommendationEngine.getRecommendations(userId, {
                type,
                limit: parseInt(limit),
                includeExplanations: true
            });

            res.json({
                success: true,
                data: {
                    recommendations,
                    count: recommendations.length
                }
            });
        } catch (error) {
            console.error('Get recommendations error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get recommendations'
            });
        }
    },

    /**
     * GET /api/recommendations/users
     * Get user-to-follow recommendations
     */
    async getUserRecommendations(req, res) {
        try {
            const userId = req.user._id;
            const { limit = 10 } = req.query;

            const recommendations = await recommendationEngine.getUserRecommendations(
                userId,
                parseInt(limit)
            );

            res.json({
                success: true,
                data: { recommendations }
            });
        } catch (error) {
            console.error('Get user recommendations error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user recommendations'
            });
        }
    },

    /**
     * GET /api/recommendations/trending
     * Get trending content
     */
    async getTrending(req, res) {
        try {
            const { type = 'post', hours = 24, limit = 20 } = req.query;

            const trending = await UserInteraction.getTrendingItems(
                type,
                parseInt(hours),
                parseInt(limit)
            );

            res.json({
                success: true,
                data: { trending }
            });
        } catch (error) {
            console.error('Get trending error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get trending'
            });
        }
    },

    /**
     * POST /api/recommendations/interaction
     * Track user interaction
     */
    async trackInteraction(req, res) {
        try {
            const userId = req.user._id;
            const { itemId, itemType, interactionType, context, engagement } = req.body;

            await UserInteraction.create({
                userId,
                itemId,
                itemType,
                interactionType,
                context,
                engagement
            });

            // Clear user's recommendation cache
            recommendationEngine.clearCache(userId);

            res.json({
                success: true,
                message: 'Interaction tracked'
            });
        } catch (error) {
            console.error('Track interaction error:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to track interaction'
            });
        }
    },

    /**
     * POST /api/recommendations/feedback
     * Submit recommendation feedback
     */
    async submitFeedback(req, res) {
        try {
            const userId = req.user._id;
            const { itemId, type, feedback } = req.body; // feedback: 'clicked', 'liked', 'dismissed'

            await RecommendationScore.updateFeedback(userId, itemId, type, feedback);

            res.json({
                success: true,
                message: 'Feedback recorded'
            });
        } catch (error) {
            console.error('Submit feedback error:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to submit feedback'
            });
        }
    },

    /**
     * GET /api/recommendations/similar/:postId
     * Get similar posts
     */
    async getSimilarPosts(req, res) {
        try {
            const { postId } = req.params;
            const { limit = 10 } = req.query;

            // In production, would fetch posts from database
            const similar = await recommendationEngine.getRecommendations(req.user._id, {
                type: 'post',
                limit: parseInt(limit)
            });

            res.json({
                success: true,
                data: { similar }
            });
        } catch (error) {
            console.error('Get similar posts error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get similar posts'
            });
        }
    },

    /**
     * GET /api/recommendations/stats
     * Get recommendation statistics
     */
    async getStats(req, res) {
        try {
            const userId = req.user._id;

            const stats = await RecommendationScore.getStatistics(userId);

            res.json({
                success: true,
                data: { stats }
            });
        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get stats'
            });
        }
    },

    /**
     * DELETE /api/recommendations/cache
     * Clear recommendation cache (admin)
     */
    async clearCache(req, res) {
        try {
            const { userId } = req.query;

            recommendationEngine.clearCache(userId || null);

            res.json({
                success: true,
                message: 'Cache cleared'
            });
        } catch (error) {
            console.error('Clear cache error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to clear cache'
            });
        }
    }
};

module.exports = recommendationController;
