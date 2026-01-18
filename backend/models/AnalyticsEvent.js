/**
 * AnalyticsEvent Model
 * Tracks user actions and events for analytics
 */

const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  // Event identification
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_view', 'click', 'form_submit', 'search', 'download',
      'video_play', 'video_pause', 'video_complete',
      'post_create', 'post_view', 'post_like', 'post_share', 'post_comment',
      'comment_create', 'comment_like', 'comment_reply',
      'user_signup', 'user_login', 'user_logout', 'profile_view', 'profile_update',
      'message_sent', 'message_read',
      'product_view', 'product_add_to_cart', 'product_purchase',
      'notification_sent', 'notification_clicked', 'notification_dismissed',
      'feature_used', 'error_occurred', 'custom'
    ],
    index: true
  },
  eventCategory: {
    type: String,
    required: true,
    enum: ['user', 'content', 'engagement', 'commerce', 'system', 'custom'],
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
  anonymousId: {
    type: String,
    index: true
  },
  
  // Event data
  properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Context information
  context: {
    page: {
      url: String,
      path: String,
      title: String,
      referrer: String
    },
    userAgent: String,
    ip: String,
    location: {
      country: String,
      region: String,
      city: String,
      timezone: String
    },
    device: {
      type: { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'] },
      os: String,
      browser: String,
      screenWidth: Number,
      screenHeight: Number
    },
    campaign: {
      source: String,
      medium: String,
      name: String,
      term: String,
      content: String
    }
  },
  
  // A/B Testing
  experiments: [{
    experimentId: String,
    variantId: String,
    variantName: String
  }],
  
  // Metadata
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  serverTimestamp: {
    type: Date,
    default: Date.now
  },
  processingDelay: {
    type: Number // milliseconds
  },
  
  // Batch information
  batchId: {
    type: String,
    index: true
  },
  
  // Related entities
  relatedEntities: [{
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId
  }],
  
  // Data quality
  isValid: {
    type: Boolean,
    default: true
  },
  validationErrors: [String],
  
  // Archived flag for data retention
  archived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedAt: Date
}, {
  timestamps: true,
  // Use timeseries collection for better performance
  timeseries: {
    timeField: 'timestamp',
    metaField: 'userId',
    granularity: 'minutes'
  }
});

// Compound indexes for common queries
analyticsEventSchema.index({ userId: 1, timestamp: -1 });
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ eventCategory: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: 1 });
analyticsEventSchema.index({ 'context.device.type': 1, timestamp: -1 });
analyticsEventSchema.index({ timestamp: -1, archived: 1 });

// TTL index for automatic deletion of old events (180 days)
analyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 15552000 });

// Virtual for age in days
analyticsEventSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.timestamp.getTime()) / (1000 * 60 * 60 * 24));
});

// Static method to get event counts by type
analyticsEventSchema.statics.getEventCountsByType = async function(startDate, endDate, userId = null) {
  const match = {
    timestamp: { $gte: startDate, $lte: endDate },
    archived: false
  };
  
  if (userId) {
    match.userId = mongoose.Types.ObjectId(userId);
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        eventType: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method for time-series aggregation
analyticsEventSchema.statics.getTimeSeries = async function(
  eventType,
  startDate,
  endDate,
  granularity = 'hour'
) {
  const granularityMap = {
    minute: { $minute: '$timestamp' },
    hour: { $hour: '$timestamp' },
    day: { $dayOfMonth: '$timestamp' },
    week: { $week: '$timestamp' },
    month: { $month: '$timestamp' }
  };
  
  return this.aggregate([
    {
      $match: {
        eventType,
        timestamp: { $gte: startDate, $lte: endDate },
        archived: false
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          [granularity]: granularityMap[granularity],
          date: {
            $dateToString: {
              format: granularity === 'hour' ? '%Y-%m-%d %H:00' : '%Y-%m-%d',
              date: '$timestamp'
            }
          }
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        date: '$_id.date',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { '_id.year': 1, [`_id.${granularity}`]: 1 } }
  ]);
};

// Static method for funnel analysis
analyticsEventSchema.statics.getFunnelAnalysis = async function(
  steps,
  startDate,
  endDate
) {
  const results = [];
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const match = {
      eventType: step.eventType,
      timestamp: { $gte: startDate, $lte: endDate },
      archived: false
    };
    
    if (step.properties) {
      Object.keys(step.properties).forEach(key => {
        match[`properties.${key}`] = step.properties[key];
      });
    }
    
    const count = await this.countDocuments(match);
    const uniqueUsers = await this.distinct('userId', match);
    
    results.push({
      step: i + 1,
      name: step.name,
      eventType: step.eventType,
      count,
      uniqueUsers: uniqueUsers.length,
      conversionRate: i === 0 ? 100 : (uniqueUsers.length / results[0].uniqueUsers * 100).toFixed(2),
      dropoffRate: i === 0 ? 0 : (100 - (uniqueUsers.length / results[i-1].uniqueUsers * 100)).toFixed(2)
    });
  }
  
  return results;
};

// Static method for cohort analysis
analyticsEventSchema.statics.getCohortAnalysis = async function(
  cohortEvent,
  retentionEvent,
  startDate,
  endDate,
  periods = 12
) {
  // Get users who performed cohort event (e.g., signup)
  const cohortUsers = await this.aggregate([
    {
      $match: {
        eventType: cohortEvent,
        timestamp: { $gte: startDate, $lte: endDate },
        archived: false
      }
    },
    {
      $group: {
        _id: {
          week: { $week: '$timestamp' },
          year: { $year: '$timestamp' }
        },
        users: { $addToSet: '$userId' },
        cohortDate: { $min: '$timestamp' }
      }
    },
    { $sort: { cohortDate: 1 } }
  ]);
  
  const cohorts = [];
  
  for (const cohort of cohortUsers) {
    const cohortData = {
      cohortDate: cohort.cohortDate,
      cohortSize: cohort.users.length,
      retention: []
    };
    
    // Calculate retention for each period
    for (let period = 0; period < periods; period++) {
      const periodStart = new Date(cohort.cohortDate);
      periodStart.setDate(periodStart.getDate() + (period * 7));
      
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 7);
      
      const activeUsers = await this.distinct('userId', {
        eventType: retentionEvent,
        userId: { $in: cohort.users },
        timestamp: { $gte: periodStart, $lte: periodEnd },
        archived: false
      });
      
      cohortData.retention.push({
        period,
        activeUsers: activeUsers.length,
        retentionRate: ((activeUsers.length / cohort.users.length) * 100).toFixed(2)
      });
    }
    
    cohorts.push(cohortData);
  }
  
  return cohorts;
};

// Method to archive old events
analyticsEventSchema.methods.archive = async function() {
  this.archived = true;
  this.archivedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
