/**
 * ContentMetrics Model
 * Issue #908: Advanced Analytics Dashboard with Data Visualization
 * 
 * Stores aggregated content performance metrics.
 */

const mongoose = require('mongoose');

const contentMetricsSchema = new mongoose.Schema({
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

    contentType: {
        type: String,
        required: true,
        enum: ['post', 'comment', 'video', 'image'],
        index: true
    },

    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Performance metrics
    performance: {
        views: { type: Number, default: 0 },
        uniqueViews: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        saves: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 }
    },

    // Engagement rates
    engagement: {
        likeRate: { type: Number, default: 0 }, // likes / views
        commentRate: { type: Number, default: 0 },
        shareRate: { type: Number, default: 0 },
        engagementRate: { type: Number, default: 0 }, // (likes + comments + shares) / views
        viralityScore: { type: Number, default: 0 }
    },

    // Reach metrics
    reach: {
        totalReach: { type: Number, default: 0 },
        organicReach: { type: Number, default: 0 },
        viralReach: { type: Number, default: 0 },
        impressions: { type: Number, default: 0 }
    },

    // Time-based performance
    hourly: [{
        hour: Date,
        views: Number,
        likes: Number,
        comments: Number
    }],

    daily: [{
        date: Date,
        views: Number,
        likes: Number,
        comments: Number,
        shares: Number
    }],

    // Audience demographics
    audience: {
        topCountries: [{ country: String, count: Number }],
        topCities: [{ city: String, count: Number }],
        deviceBreakdown: {
            desktop: Number,
            mobile: Number,
            tablet: Number
        },
        ageGroups: [{
            range: String,
            count: Number
        }]
    },

    // Performance score
    performanceScore: {
        type: Number,
        default: 0,
        index: true
    },

    // Timestamps
    publishedAt: Date,
    lastCalculated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound indexes
contentMetricsSchema.index({ contentType: 1, performanceScore: -1 });
contentMetricsSchema.index({ authorId: 1, performanceScore: -1 });
contentMetricsSchema.index({ publishedAt: -1 });

// Calculate engagement rates
contentMetricsSchema.methods.calculateEngagementRates = function () {
    const views = this.performance.views || 1; // Avoid division by zero

    this.engagement.likeRate = (this.performance.likes / views) * 100;
    this.engagement.commentRate = (this.performance.comments / views) * 100;
    this.engagement.shareRate = (this.performance.shares / views) * 100;

    const totalEngagement = this.performance.likes + this.performance.comments + this.performance.shares;
    this.engagement.engagementRate = (totalEngagement / views) * 100;

    // Virality score based on shares and reach
    const shareMultiplier = this.performance.shares * 10;
    const reachBonus = (this.reach.viralReach / this.reach.totalReach) * 50;
    this.engagement.viralityScore = shareMultiplier + reachBonus;

    return this.engagement;
};

// Calculate performance score
contentMetricsSchema.methods.calculatePerformanceScore = function () {
    const weights = {
        views: 1,
        likes: 5,
        comments: 10,
        shares: 15,
        engagementRate: 20
    };

    const score =
        (this.performance.views * weights.views) +
        (this.performance.likes * weights.likes) +
        (this.performance.comments * weights.comments) +
        (this.performance.shares * weights.shares) +
        (this.engagement.engagementRate * weights.engagementRate);

    this.performanceScore = Math.round(score);
    return this.performanceScore;
};

// Get top performing content
contentMetricsSchema.statics.getTopContent = function (contentType, limit = 10, metric = 'performanceScore') {
    const query = contentType ? { contentType } : {};
    return this.find(query)
        .sort({ [metric]: -1 })
        .limit(limit)
        .populate('authorId', 'username avatar')
        .lean();
};

// Get content performance over time
contentMetricsSchema.statics.getPerformanceOverTime = async function (contentId, days = 30) {
    const content = await this.findOne({ contentId });
    if (!content) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return content.daily.filter(d => d.date >= startDate).sort((a, b) => a.date - b.date);
};

const ContentMetrics = mongoose.model('ContentMetrics', contentMetricsSchema);

module.exports = ContentMetrics;
