/**
 * RecommendationScore Model
 * Issue #921: AI-Powered Content Recommendation Engine
 * 
 * Stores pre-computed recommendation scores for users.
 */

const mongoose = require('mongoose');

const recommendationScoreSchema = new mongoose.Schema({
    // User receiving recommendations
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Recommendation type
    type: {
        type: String,
        required: true,
        enum: ['post', 'user', 'topic', 'hashtag'],
        index: true
    },

    // Recommended item
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

    // Scores from different algorithms
    scores: {
        collaborative: { type: Number, default: 0 }, // User-user similarity
        contentBased: { type: Number, default: 0 }, // Content similarity
        popularity: { type: Number, default: 0 }, // Trending/popularity
        hybrid: { type: Number, default: 0 }, // Combined score
        recency: { type: Number, default: 0 }, // Time decay
        diversity: { type: Number, default: 0 } // Diversity bonus
    },

    // Final recommendation score
    finalScore: {
        type: Number,
        required: true,
        index: true
    },

    // Explanation for recommendation
    explanation: {
        reason: String, // 'similar_to_liked', 'followed_by_friends', 'trending'
        relatedItems: [mongoose.Schema.Types.ObjectId],
        confidence: Number
    },

    // Algorithm metadata
    algorithm: {
        version: String,
        weights: {
            collaborative: Number,
            contentBased: Number,
            popularity: Number
        }
    },

    // User feedback
    feedback: {
        shown: { type: Boolean, default: false },
        clicked: { type: Boolean, default: false },
        liked: { type: Boolean, default: false },
        dismissed: { type: Boolean, default: false },
        timestamp: Date
    },

    // Expiration
    expiresAt: {
        type: Date,
        index: true
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Compound indexes
recommendationScoreSchema.index({ userId: 1, type: 1, finalScore: -1 });
recommendationScoreSchema.index({ userId: 1, itemId: 1, type: 1 }, { unique: true });
recommendationScoreSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Get top recommendations for user
recommendationScoreSchema.statics.getTopRecommendations = function (userId, type, limit = 20) {
    return this.find({
        userId,
        type,
        'feedback.dismissed': { $ne: true }
    })
        .sort({ finalScore: -1 })
        .limit(limit)
        .lean();
};

// Update feedback
recommendationScoreSchema.statics.updateFeedback = async function (userId, itemId, type, feedback) {
    return this.findOneAndUpdate(
        { userId, itemId, type },
        {
            $set: {
                [`feedback.${feedback}`]: true,
                'feedback.timestamp': new Date()
            }
        },
        { new: true }
    );
};

// Get recommendation statistics
recommendationScoreSchema.statics.getStatistics = async function (userId) {
    return this.aggregate([
        { $match: { userId } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                avgScore: { $avg: '$finalScore' },
                shown: { $sum: { $cond: ['$feedback.shown', 1, 0] } },
                clicked: { $sum: { $cond: ['$feedback.clicked', 1, 0] } },
                liked: { $sum: { $cond: ['$feedback.liked', 1, 0] } }
            }
        }
    ]);
};

const RecommendationScore = mongoose.model('RecommendationScore', recommendationScoreSchema);

module.exports = RecommendationScore;
