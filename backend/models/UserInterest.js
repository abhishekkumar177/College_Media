const mongoose = require('mongoose');

/**
 * UserInterest Model - Tracks user preferences based on interactions
 * Used for personalized recommendations
 */
const userInterestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // Tag weights based on interactions (likes, comments, views)
    tagWeights: {
        type: Map,
        of: Number,
        default: new Map()
    },

    // Users this person frequently interacts with
    userAffinities: {
        type: Map,
        of: Number,
        default: new Map()
    },

    // Content type preferences
    contentPreferences: {
        posts: { type: Number, default: 1 },
        images: { type: Number, default: 1 },
        videos: { type: Number, default: 1 },
        articles: { type: Number, default: 1 }
    },

    // Engagement metrics for ML features
    engagementStats: {
        totalLikes: { type: Number, default: 0 },
        totalComments: { type: Number, default: 0 },
        totalViews: { type: Number, default: 0 },
        avgSessionTime: { type: Number, default: 0 } // minutes
    },

    // Last calculated embedding vector (for similarity search)
    embeddingVector: {
        type: [Number],
        default: []
    },

    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

/**
 * Update tag weight based on interaction
 */
userInterestSchema.methods.updateTagWeight = function (tag, interactionType) {
    const weights = {
        view: 0.1,
        like: 0.5,
        comment: 1.0,
        share: 1.5
    };

    const weight = weights[interactionType] || 0.1;
    const currentWeight = this.tagWeights.get(tag) || 0;
    this.tagWeights.set(tag, currentWeight + weight);
    this.lastUpdated = new Date();
};

/**
 * Update user affinity based on interaction
 */
userInterestSchema.methods.updateUserAffinity = function (targetUserId, interactionType) {
    const weights = {
        follow: 2.0,
        like: 0.3,
        comment: 0.8,
        message: 1.5
    };

    const weight = weights[interactionType] || 0.1;
    const userId = targetUserId.toString();
    const currentAffinity = this.userAffinities.get(userId) || 0;
    this.userAffinities.set(userId, currentAffinity + weight);
};

/**
 * Get top tags for this user
 */
userInterestSchema.methods.getTopTags = function (limit = 10) {
    const entries = Array.from(this.tagWeights.entries());
    return entries
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([tag, weight]) => ({ tag, weight }));
};

/**
 * Get top user affinities
 */
userInterestSchema.methods.getTopAffinities = function (limit = 10) {
    const entries = Array.from(this.userAffinities.entries());
    return entries
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([userId, score]) => ({ userId, score }));
};

// Static method to get or create interest profile
userInterestSchema.statics.getOrCreate = async function (userId) {
    let interest = await this.findOne({ user: userId });
    if (!interest) {
        interest = await this.create({ user: userId });
    }
    return interest;
};

module.exports = mongoose.model('UserInterest', userInterestSchema);
