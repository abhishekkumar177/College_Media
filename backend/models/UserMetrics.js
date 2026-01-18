/**
 * UserMetrics Model
 * Issue #908: Advanced Analytics Dashboard with Data Visualization
 * 
 * Stores aggregated user engagement metrics.
 */

const mongoose = require('mongoose');

const userMetricsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // Engagement metrics
    engagement: {
        totalPosts: { type: Number, default: 0 },
        totalComments: { type: Number, default: 0 },
        totalLikes: { type: Number, default: 0 },
        totalShares: { type: Number, default: 0 },
        totalViews: { type: Number, default: 0 },
        engagementScore: { type: Number, default: 0 }, // Calculated score
        lastActiveAt: Date
    },

    // Social metrics
    social: {
        followers: { type: Number, default: 0 },
        following: { type: Number, default: 0 },
        followersGrowth: { type: Number, default: 0 }, // % change
        followingGrowth: { type: Number, default: 0 }
    },

    // Content performance
    content: {
        avgLikesPerPost: { type: Number, default: 0 },
        avgCommentsPerPost: { type: Number, default: 0 },
        avgSharesPerPost: { type: Number, default: 0 },
        avgViewsPerPost: { type: Number, default: 0 },
        topPerformingPostId: mongoose.Schema.Types.ObjectId,
        totalReach: { type: Number, default: 0 }
    },

    // Activity patterns
    activity: {
        avgSessionDuration: { type: Number, default: 0 }, // in minutes
        avgPostsPerWeek: { type: Number, default: 0 },
        mostActiveDay: String,
        mostActiveHour: Number,
        totalSessions: { type: Number, default: 0 }
    },

    // Time-based metrics
    daily: [{
        date: Date,
        posts: Number,
        comments: Number,
        likes: Number,
        views: Number,
        sessions: Number
    }],

    weekly: [{
        weekStart: Date,
        posts: Number,
        comments: Number,
        likes: Number,
        views: Number,
        engagementScore: Number
    }],

    monthly: [{
        month: Date,
        posts: Number,
        comments: Number,
        likes: Number,
        views: Number,
        engagementScore: Number
    }],

    // Cohort data
    cohort: {
        signupDate: Date,
        cohortId: String,
        retentionDay7: Boolean,
        retentionDay30: Boolean,
        retentionDay90: Boolean
    },

    // Last calculated
    lastCalculated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
userMetricsSchema.index({ 'engagement.engagementScore': -1 });
userMetricsSchema.index({ 'social.followers': -1 });
userMetricsSchema.index({ lastCalculated: 1 });

// Calculate engagement score
userMetricsSchema.methods.calculateEngagementScore = function () {
    const weights = {
        posts: 5,
        comments: 3,
        likes: 1,
        shares: 4,
        views: 0.1
    };

    const score =
        (this.engagement.totalPosts * weights.posts) +
        (this.engagement.totalComments * weights.comments) +
        (this.engagement.totalLikes * weights.likes) +
        (this.engagement.totalShares * weights.shares) +
        (this.engagement.totalViews * weights.views);

    this.engagement.engagementScore = Math.round(score);
    return this.engagement.engagementScore;
};

// Get top users by engagement
userMetricsSchema.statics.getTopUsers = function (limit = 10, metric = 'engagementScore') {
    const sortField = `engagement.${metric}`;
    return this.find()
        .sort({ [sortField]: -1 })
        .limit(limit)
        .populate('userId', 'username avatar')
        .lean();
};

const UserMetrics = mongoose.model('UserMetrics', userMetricsSchema);

module.exports = UserMetrics;
