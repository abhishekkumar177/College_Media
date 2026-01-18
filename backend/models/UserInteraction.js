/**
 * UserInteraction Model
 * Issue #921: AI-Powered Content Recommendation Engine
 * 
 * Tracks user behavior for recommendation algorithms.
 */

const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema({
    // User performing the interaction
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Item interacted with
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

    // Item type
    itemType: {
        type: String,
        required: true,
        enum: ['post', 'user', 'comment', 'topic', 'hashtag'],
        index: true
    },

    // Interaction type
    interactionType: {
        type: String,
        required: true,
        enum: [
            'view', 'like', 'unlike', 'comment', 'share', 'save', 'unsave',
            'follow', 'unfollow', 'click', 'scroll', 'dwell', 'skip',
            'search', 'reply', 'report', 'hide'
        ],
        index: true
    },

    // Interaction weight (for scoring)
    weight: {
        type: Number,
        default: 1
    },

    // Context
    context: {
        source: String, // 'feed', 'search', 'profile', 'recommendation'
        position: Number, // Position in feed/list
        sessionId: String,
        referrer: String
    },

    // Engagement metrics
    engagement: {
        dwellTime: Number, // Time spent viewing (ms)
        scrollDepth: Number, // 0-100%
        completionRate: Number, // For videos
        readProgress: Number // For long posts
    },

    // Device info
    device: {
        type: String,
        platform: String,
        browser: String
    },

    // Timestamp
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
userInteractionSchema.index({ userId: 1, itemType: 1, timestamp: -1 });
userInteractionSchema.index({ itemId: 1, interactionType: 1 });
userInteractionSchema.index({ userId: 1, interactionType: 1, timestamp: -1 });

// Interaction weights for scoring
const INTERACTION_WEIGHTS = {
    like: 5,
    comment: 8,
    share: 10,
    save: 7,
    follow: 15,
    view: 1,
    click: 2,
    dwell: 3,
    skip: -1,
    hide: -5,
    unlike: -3,
    unfollow: -10,
    report: -10
};

// Pre-save hook to set weight
userInteractionSchema.pre('save', function (next) {
    if (!this.weight) {
        this.weight = INTERACTION_WEIGHTS[this.interactionType] || 1;
    }
    next();
});

// Get user interaction history
userInteractionSchema.statics.getUserHistory = function (userId, options = {}) {
    const { type, limit = 100, since } = options;

    const query = { userId };
    if (type) query.itemType = type;
    if (since) query.timestamp = { $gte: since };

    return this.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
};

// Get items user has interacted with
userInteractionSchema.statics.getUserInteractedItems = async function (userId, itemType, interactionTypes = ['like', 'save', 'share']) {
    const interactions = await this.find({
        userId,
        itemType,
        interactionType: { $in: interactionTypes }
    })
        .distinct('itemId');

    return interactions;
};

// Calculate user affinity for an item
userInteractionSchema.statics.calculateAffinity = async function (userId, itemId) {
    const interactions = await this.find({ userId, itemId });

    let affinity = 0;
    for (const interaction of interactions) {
        affinity += INTERACTION_WEIGHTS[interaction.interactionType] || 0;
    }

    return affinity;
};

// Get similar users based on interactions
userInteractionSchema.statics.findSimilarUsers = async function (userId, limit = 20) {
    // Find items user has liked
    const userLikes = await this.find({
        userId,
        interactionType: { $in: ['like', 'save'] }
    }).distinct('itemId');

    if (userLikes.length === 0) return [];

    // Find users who liked the same items
    const similarUsers = await this.aggregate([
        {
            $match: {
                itemId: { $in: userLikes },
                interactionType: { $in: ['like', 'save'] },
                userId: { $ne: userId }
            }
        },
        {
            $group: {
                _id: '$userId',
                commonItems: { $sum: 1 },
                interactions: { $push: '$itemId' }
            }
        },
        {
            $project: {
                userId: '$_id',
                commonItems: 1,
                similarity: { $divide: ['$commonItems', userLikes.length] },
                _id: 0
            }
        },
        { $sort: { similarity: -1 } },
        { $limit: limit }
    ]);

    return similarUsers;
};

// Get trending items
userInteractionSchema.statics.getTrendingItems = async function (itemType, hours = 24, limit = 20) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.aggregate([
        {
            $match: {
                itemType,
                timestamp: { $gte: since },
                interactionType: { $in: ['like', 'share', 'comment'] }
            }
        },
        {
            $group: {
                _id: '$itemId',
                totalWeight: { $sum: '$weight' },
                interactionCount: { $sum: 1 },
                uniqueUsers: { $addToSet: '$userId' }
            }
        },
        {
            $project: {
                itemId: '$_id',
                totalWeight: 1,
                interactionCount: 1,
                uniqueUsers: { $size: '$uniqueUsers' },
                _id: 0
            }
        },
        {
            $addFields: {
                trendScore: {
                    $add: [
                        { $multiply: ['$totalWeight', 1] },
                        { $multiply: ['$uniqueUsers', 2] }
                    ]
                }
            }
        },
        { $sort: { trendScore: -1 } },
        { $limit: limit }
    ]);
};

const UserInteraction = mongoose.model('UserInteraction', userInteractionSchema);

module.exports = UserInteraction;
