/**
 * AnalyticsEvent Model
 * Issue #908: Advanced Analytics Dashboard with Data Visualization
 * 
 * Tracks user actions and events for analytics.
 */

const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
    // Event identification
    eventType: {
        type: String,
        required: true,
        enum: [
            'page_view', 'post_view', 'post_like', 'post_unlike', 'post_share',
            'comment_create', 'comment_like', 'follow', 'unfollow',
            'search', 'click', 'signup', 'login', 'logout',
            'profile_view', 'message_send', 'notification_click',
            'video_play', 'video_complete', 'image_view'
        ],
        index: true
    },

    // User information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    sessionId: {
        type: String,
        index: true
    },

    // Event metadata
    metadata: {
        postId: mongoose.Schema.Types.ObjectId,
        commentId: mongoose.Schema.Types.ObjectId,
        targetUserId: mongoose.Schema.Types.ObjectId,
        searchQuery: String,
        url: String,
        referrer: String,
        duration: Number, // in milliseconds
        value: Number,
        category: String,
        label: String
    },

    // Device and location
    device: {
        type: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet']
        },
        os: String,
        browser: String,
        screenResolution: String
    },

    location: {
        country: String,
        city: String,
        region: String,
        timezone: String,
        coordinates: {
            type: { type: String, default: 'Point' },
            coordinates: [Number] // [longitude, latitude]
        }
    },

    // Timestamp
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },

    // Performance metrics
    performance: {
        pageLoadTime: Number,
        renderTime: Number,
        apiResponseTime: Number
    }
}, {
    timestamps: true,
    // Use time-series collection for better performance (MongoDB 5.0+)
    timeseries: {
        timeField: 'timestamp',
        metaField: 'metadata',
        granularity: 'minutes'
    }
});

// Compound indexes for common queries
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: -1 });
analyticsEventSchema.index({ 'metadata.postId': 1, timestamp: -1 });

// Static methods for analytics queries

/**
 * Get event count by type
 */
analyticsEventSchema.statics.getEventCounts = async function (startDate, endDate, eventTypes = null) {
    const match = {
        timestamp: {
            $gte: startDate,
            $lte: endDate
        }
    };

    if (eventTypes) {
        match.eventType = { $in: eventTypes };
    }

    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$eventType',
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                eventType: '$_id',
                count: 1,
                _id: 0
            }
        }
    ]);
};

/**
 * Get events over time
 */
analyticsEventSchema.statics.getEventsOverTime = async function (startDate, endDate, interval = 'day') {
    const dateFormat = interval === 'hour' ? '%Y-%m-%d %H:00' : '%Y-%m-%d';

    return this.aggregate([
        {
            $match: {
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: dateFormat, date: '$timestamp' } },
                    eventType: '$eventType'
                },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: '$_id.date',
                events: {
                    $push: {
                        type: '$_id.eventType',
                        count: '$count'
                    }
                },
                total: { $sum: '$count' }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                date: '$_id',
                events: 1,
                total: 1,
                _id: 0
            }
        }
    ]);
};

/**
 * Get unique users count
 */
analyticsEventSchema.statics.getUniqueUsers = async function (startDate, endDate) {
    const result = await this.aggregate([
        {
            $match: {
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                },
                userId: { $exists: true }
            }
        },
        {
            $group: {
                _id: '$userId'
            }
        },
        {
            $count: 'uniqueUsers'
        }
    ]);

    return result[0]?.uniqueUsers || 0;
};

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

module.exports = AnalyticsEvent;
