/**
 * Analytics Aggregation Service
 * Computes metrics and aggregations from analytics events
 */

const AnalyticsEvent = require('../models/AnalyticsEvent');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

class AnalyticsAggregationService {
  /**
   * Get dashboard overview metrics
   */
  async getDashboardMetrics(userId, startDate, endDate) {
    try {
      const match = {
        timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
        archived: false
      };
      
      if (userId) {
        match.userId = mongoose.Types.ObjectId(userId);
      }
      
      const [
        totalEvents,
        uniqueUsers,
        sessionStats,
        topEvents,
        deviceBreakdown,
        locationStats
      ] = await Promise.all([
        this.getTotalEvents(match),
        this.getUniqueUsers(match),
        this.getSessionStats(match),
        this.getTopEvents(match, 10),
        this.getDeviceBreakdown(match),
        this.getLocationStats(match)
      ]);
      
      return {
        totalEvents,
        uniqueUsers,
        sessionStats,
        topEvents,
        deviceBreakdown,
        locationStats,
        period: { startDate, endDate }
      };
    } catch (error) {
      logger.error('Error getting dashboard metrics', { error: error.message });
      throw error;
    }
  }

  /**
   * Get total events count
   */
  async getTotalEvents(match) {
    return AnalyticsEvent.countDocuments(match);
  }

  /**
   * Get unique users count
   */
  async getUniqueUsers(match) {
    const users = await AnalyticsEvent.distinct('userId', match);
    return users.filter(u => u !== null).length;
  }

  /**
   * Get session statistics
   */
  async getSessionStats(match) {
    const sessions = await AnalyticsEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$sessionId',
          eventCount: { $sum: 1 },
          startTime: { $min: '$timestamp' },
          endTime: { $max: '$timestamp' },
          userId: { $first: '$userId' }
        }
      },
      {
        $project: {
          eventCount: 1,
          duration: {
            $divide: [
              { $subtract: ['$endTime', '$startTime'] },
              1000 // Convert to seconds
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          avgEventsPerSession: { $avg: '$eventCount' },
          avgSessionDuration: { $avg: '$duration' },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);
    
    return sessions[0] || {
      totalSessions: 0,
      avgEventsPerSession: 0,
      avgSessionDuration: 0,
      totalDuration: 0
    };
  }

  /**
   * Get top events by count
   */
  async getTopEvents(match, limit = 10) {
    return AnalyticsEvent.aggregate([
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
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
  }

  /**
   * Get device breakdown
   */
  async getDeviceBreakdown(match) {
    return AnalyticsEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$context.device.type',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          deviceType: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  /**
   * Get location statistics
   */
  async getLocationStats(match) {
    return AnalyticsEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            country: '$context.location.country',
            region: '$context.location.region'
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          country: '$_id.country',
          region: '$_id.region',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
  }

  /**
   * Get real-time metrics (last N minutes)
   */
  async getRealTimeMetrics(minutes = 5) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    
    const [eventsPerMinute, topEvents, activeUsers] = await Promise.all([
      this.getEventsPerMinute(since),
      this.getTopEvents({ timestamp: { $gte: since }, archived: false }, 5),
      this.getActiveUsers(since)
    ]);
    
    return {
      eventsPerMinute,
      topEvents,
      activeUsers,
      lastUpdated: new Date()
    };
  }

  /**
   * Get events per minute for real-time chart
   */
  async getEventsPerMinute(since) {
    return AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: since },
          archived: false
        }
      },
      {
        $group: {
          _id: {
            minute: {
              $dateToString: {
                format: '%Y-%m-%d %H:%M',
                date: '$timestamp'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.minute': 1 } },
      {
        $project: {
          minute: '$_id.minute',
          count: 1,
          _id: 0
        }
      }
    ]);
  }

  /**
   * Get active users in time window
   */
  async getActiveUsers(since) {
    const users = await AnalyticsEvent.distinct('userId', {
      timestamp: { $gte: since },
      archived: false
    });
    
    return users.filter(u => u !== null).length;
  }

  /**
   * Get user engagement metrics
   */
  async getUserEngagement(userId, startDate, endDate) {
    const match = {
      userId: mongoose.Types.ObjectId(userId),
      timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
      archived: false
    };
    
    const [
      eventsByType,
      sessionActivity,
      engagementTrend,
      contentInteractions
    ] = await Promise.all([
      AnalyticsEvent.getEventCountsByType(new Date(startDate), new Date(endDate), userId),
      this.getUserSessionActivity(userId, match),
      this.getUserEngagementTrend(userId, new Date(startDate), new Date(endDate)),
      this.getUserContentInteractions(userId, match)
    ]);
    
    return {
      eventsByType,
      sessionActivity,
      engagementTrend,
      contentInteractions
    };
  }

  /**
   * Get user session activity
   */
  async getUserSessionActivity(userId, match) {
    return AnalyticsEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$sessionId',
          eventCount: { $sum: 1 },
          startTime: { $min: '$timestamp' },
          endTime: { $max: '$timestamp' },
          events: { $push: '$eventType' }
        }
      },
      {
        $project: {
          sessionId: '$_id',
          eventCount: 1,
          startTime: 1,
          endTime: 1,
          duration: {
            $divide: [
              { $subtract: ['$endTime', '$startTime'] },
              1000
            ]
          },
          uniqueEvents: { $size: { $setUnion: ['$events', []] } }
        }
      },
      { $sort: { startTime: -1 } }
    ]);
  }

  /**
   * Get user engagement trend over time
   */
  async getUserEngagementTrend(userId, startDate, endDate) {
    return AnalyticsEvent.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          timestamp: { $gte: startDate, $lte: endDate },
          archived: false
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } },
      {
        $project: {
          date: '$_id.date',
          count: 1,
          _id: 0
        }
      }
    ]);
  }

  /**
   * Get user content interactions
   */
  async getUserContentInteractions(userId, match) {
    return AnalyticsEvent.aggregate([
      { 
        $match: {
          ...match,
          eventCategory: 'engagement'
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          interactionType: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  /**
   * Get content performance metrics
   */
  async getContentPerformance(startDate, endDate, limit = 20) {
    const match = {
      eventCategory: 'engagement',
      timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
      archived: false,
      'relatedEntities.entityType': 'Post'
    };
    
    return AnalyticsEvent.aggregate([
      { $match: match },
      { $unwind: '$relatedEntities' },
      {
        $match: {
          'relatedEntities.entityType': 'Post'
        }
      },
      {
        $group: {
          _id: '$relatedEntities.entityId',
          views: {
            $sum: { $cond: [{ $eq: ['$eventType', 'post_view'] }, 1, 0] }
          },
          likes: {
            $sum: { $cond: [{ $eq: ['$eventType', 'post_like'] }, 1, 0] }
          },
          comments: {
            $sum: { $cond: [{ $eq: ['$eventType', 'post_comment'] }, 1, 0] }
          },
          shares: {
            $sum: { $cond: [{ $eq: ['$eventType', 'post_share'] }, 1, 0] }
          },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          postId: '$_id',
          views: 1,
          likes: 1,
          comments: 1,
          shares: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          engagementScore: {
            $add: [
              '$views',
              { $multiply: ['$likes', 2] },
              { $multiply: ['$comments', 3] },
              { $multiply: ['$shares', 5] }
            ]
          }
        }
      },
      { $sort: { engagementScore: -1 } },
      { $limit: limit }
    ]);
  }

  /**
   * Detect anomalies in event patterns
   */
  async detectAnomalies(eventType, days = 7) {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    // Get hourly counts for the period
    const hourlyCounts = await AnalyticsEvent.aggregate([
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
            hour: {
              $dateToString: {
                format: '%Y-%m-%d %H:00',
                date: '$timestamp'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.hour': 1 } }
    ]);
    
    if (hourlyCounts.length < 24) {
      return { anomalies: [], message: 'Insufficient data for anomaly detection' };
    }
    
    // Calculate mean and standard deviation
    const counts = hourlyCounts.map(h => h.count);
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);
    
    // Detect anomalies (values beyond 2 standard deviations)
    const threshold = 2;
    const anomalies = hourlyCounts
      .filter(h => Math.abs(h.count - mean) > threshold * stdDev)
      .map(h => ({
        hour: h._id.hour,
        count: h.count,
        expectedRange: {
          min: Math.round(mean - threshold * stdDev),
          max: Math.round(mean + threshold * stdDev)
        },
        deviation: ((h.count - mean) / stdDev).toFixed(2)
      }));
    
    return {
      eventType,
      period: { startDate, endDate },
      statistics: {
        mean: Math.round(mean),
        stdDev: Math.round(stdDev),
        min: Math.min(...counts),
        max: Math.max(...counts)
      },
      anomalies
    };
  }

  /**
   * Calculate growth metrics
   */
  async getGrowthMetrics(metric, currentStart, currentEnd, previousStart, previousEnd) {
    const currentMatch = {
      timestamp: { $gte: new Date(currentStart), $lte: new Date(currentEnd) },
      archived: false
    };
    
    const previousMatch = {
      timestamp: { $gte: new Date(previousStart), $lte: new Date(previousEnd) },
      archived: false
    };
    
    let currentValue, previousValue;
    
    switch (metric) {
      case 'users':
        currentValue = await this.getUniqueUsers(currentMatch);
        previousValue = await this.getUniqueUsers(previousMatch);
        break;
      case 'events':
        currentValue = await this.getTotalEvents(currentMatch);
        previousValue = await this.getTotalEvents(previousMatch);
        break;
      case 'sessions':
        const currentSessions = await this.getSessionStats(currentMatch);
        const previousSessions = await this.getSessionStats(previousMatch);
        currentValue = currentSessions.totalSessions;
        previousValue = previousSessions.totalSessions;
        break;
      default:
        throw new Error(`Unknown metric: ${metric}`);
    }
    
    const change = currentValue - previousValue;
    const percentChange = previousValue === 0 ? 0 : ((change / previousValue) * 100).toFixed(2);
    
    return {
      metric,
      currentPeriod: { start: currentStart, end: currentEnd, value: currentValue },
      previousPeriod: { start: previousStart, end: previousEnd, value: previousValue },
      change,
      percentChange: parseFloat(percentChange),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }
}

module.exports = new AnalyticsAggregationService();
