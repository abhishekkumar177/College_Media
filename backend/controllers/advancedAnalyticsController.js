/**
 * Advanced Analytics Controller
 * Handles analytics events, metrics, and reports
 */

const eventIngestionService = require('../services/eventIngestionService');
const analyticsAggregationService = require('../services/analyticsAggregationService');
const reportGenerationService = require('../services/reportGenerationService');
const scheduledReportService = require('../services/scheduledReportService');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

/**
 * Track analytics event
 * @route POST /api/analytics/events
 */
exports.trackEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      userId: req.user?._id,
      sessionId: req.sessionID,
      context: {
        ...req.body.context,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress
      }
    };
    
    const result = await eventIngestionService.ingestEvent(eventData);
    
    res.status(202).json({
      success: true,
      message: 'Event queued for processing',
      data: result
    });
  } catch (error) {
    logger.error('Error tracking event', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error tracking event',
      error: error.message
    });
  }
};

/**
 * Track batch of events
 * @route POST /api/analytics/events/batch
 */
exports.trackEventBatch = async (req, res) => {
  try {
    const { events } = req.body;
    
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Events array is required'
      });
    }
    
    const enrichedEvents = events.map(event => ({
      ...event,
      userId: req.user?._id,
      sessionId: req.sessionID,
      context: {
        ...event.context,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress
      }
    }));
    
    const results = await eventIngestionService.ingestBatch(enrichedEvents);
    
    res.status(202).json({
      success: true,
      message: 'Events queued for processing',
      data: results
    });
  } catch (error) {
    logger.error('Error tracking event batch', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error tracking events',
      error: error.message
    });
  }
};

/**
 * Get dashboard metrics
 * @route GET /api/analytics/dashboard
 */
exports.getDashboardMetrics = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }
    
    const metrics = await analyticsAggregationService.getDashboardMetrics(
      userId || req.user?._id,
      startDate,
      endDate
    );
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error getting dashboard metrics', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error retrieving metrics',
      error: error.message
    });
  }
};

/**
 * Get real-time metrics
 * @route GET /api/analytics/realtime
 */
exports.getRealTimeMetrics = async (req, res) => {
  try {
    const { minutes = 5 } = req.query;
    
    const metrics = await analyticsAggregationService.getRealTimeMetrics(parseInt(minutes));
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error getting real-time metrics', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error retrieving real-time metrics',
      error: error.message
    });
  }
};

/**
 * Get user engagement metrics
 * @route GET /api/analytics/engagement/:userId
 */
exports.getUserEngagement = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }
    
    const engagement = await analyticsAggregationService.getUserEngagement(
      userId,
      startDate,
      endDate
    );
    
    res.json({
      success: true,
      data: engagement
    });
  } catch (error) {
    logger.error('Error getting user engagement', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error retrieving engagement metrics',
      error: error.message
    });
  }
};

/**
 * Get content performance
 * @route GET /api/analytics/content/performance
 */
exports.getContentPerformance = async (req, res) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }
    
    const performance = await analyticsAggregationService.getContentPerformance(
      startDate,
      endDate,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    logger.error('Error getting content performance', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error retrieving content performance',
      error: error.message
    });
  }
};

/**
 * Get time-series data
 * @route GET /api/analytics/timeseries
 */
exports.getTimeSeries = async (req, res) => {
  try {
    const { eventType, startDate, endDate, granularity = 'hour' } = req.query;
    
    if (!eventType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'eventType, startDate, and endDate are required'
      });
    }
    
    const timeSeries = await AnalyticsEvent.getTimeSeries(
      eventType,
      new Date(startDate),
      new Date(endDate),
      granularity
    );
    
    res.json({
      success: true,
      data: timeSeries
    });
  } catch (error) {
    logger.error('Error getting time series', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error retrieving time series data',
      error: error.message
    });
  }
};

/**
 * Get funnel analysis
 * @route POST /api/analytics/funnel
 */
exports.getFunnelAnalysis = async (req, res) => {
  try {
    const { steps, startDate, endDate } = req.body;
    
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'steps array is required'
      });
    }
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }
    
    const funnel = await AnalyticsEvent.getFunnelAnalysis(
      steps,
      new Date(startDate),
      new Date(endDate)
    );
    
    res.json({
      success: true,
      data: funnel
    });
  } catch (error) {
    logger.error('Error getting funnel analysis', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error performing funnel analysis',
      error: error.message
    });
  }
};

/**
 * Get cohort analysis
 * @route POST /api/analytics/cohort
 */
exports.getCohortAnalysis = async (req, res) => {
  try {
    const { 
      cohortEvent = 'user_signup',
      retentionEvent = 'user_login',
      startDate,
      endDate,
      periods = 12
    } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }
    
    const cohorts = await AnalyticsEvent.getCohortAnalysis(
      cohortEvent,
      retentionEvent,
      new Date(startDate),
      new Date(endDate),
      periods
    );
    
    res.json({
      success: true,
      data: cohorts
    });
  } catch (error) {
    logger.error('Error getting cohort analysis', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error performing cohort analysis',
      error: error.message
    });
  }
};

/**
 * Detect anomalies
 * @route GET /api/analytics/anomalies
 */
exports.detectAnomalies = async (req, res) => {
  try {
    const { eventType, days = 7 } = req.query;
    
    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: 'eventType is required'
      });
    }
    
    const anomalies = await analyticsAggregationService.detectAnomalies(
      eventType,
      parseInt(days)
    );
    
    res.json({
      success: true,
      data: anomalies
    });
  } catch (error) {
    logger.error('Error detecting anomalies', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error detecting anomalies',
      error: error.message
    });
  }
};

/**
 * Get growth metrics
 * @route POST /api/analytics/growth
 */
exports.getGrowthMetrics = async (req, res) => {
  try {
    const { metric, currentStart, currentEnd, previousStart, previousEnd } = req.body;
    
    if (!metric || !currentStart || !currentEnd || !previousStart || !previousEnd) {
      return res.status(400).json({
        success: false,
        message: 'All date parameters are required'
      });
    }
    
    const growth = await analyticsAggregationService.getGrowthMetrics(
      metric,
      currentStart,
      currentEnd,
      previousStart,
      previousEnd
    );
    
    res.json({
      success: true,
      data: growth
    });
  } catch (error) {
    logger.error('Error getting growth metrics', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error calculating growth metrics',
      error: error.message
    });
  }
};

/**
 * Generate report
 * @route POST /api/analytics/reports/generate
 */
exports.generateReport = async (req, res) => {
  try {
    const reportConfig = {
      ...req.body,
      userId: req.user?._id
    };
    
    const result = await reportGenerationService.generateReport(reportConfig);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error generating report', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};

/**
 * Download report
 * @route GET /api/analytics/reports/download/:fileName
 */
exports.downloadReport = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(reportGenerationService.reportsDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.download(filePath);
  } catch (error) {
    logger.error('Error downloading report', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error downloading report',
      error: error.message
    });
  }
};

/**
 * Create scheduled report
 * @route POST /api/analytics/reports/schedule
 */
exports.createScheduledReport = async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const scheduledReport = await scheduledReportService.createScheduledReport(reportData);
    
    res.status(201).json({
      success: true,
      data: scheduledReport
    });
  } catch (error) {
    logger.error('Error creating scheduled report', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error creating scheduled report',
      error: error.message
    });
  }
};

/**
 * Get scheduled reports
 * @route GET /api/analytics/reports/schedule
 */
exports.getScheduledReports = async (req, res) => {
  try {
    const reports = await scheduledReportService.getScheduledReports(req.user._id);
    
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    logger.error('Error getting scheduled reports', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error retrieving scheduled reports',
      error: error.message
    });
  }
};

/**
 * Update scheduled report
 * @route PUT /api/analytics/reports/schedule/:id
 */
exports.updateScheduledReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const report = await scheduledReportService.updateScheduledReport(id, updates);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error updating scheduled report', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error updating scheduled report',
      error: error.message
    });
  }
};

/**
 * Delete scheduled report
 * @route DELETE /api/analytics/reports/schedule/:id
 */
exports.deleteScheduledReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    await scheduledReportService.deleteScheduledReport(id);
    
    res.json({
      success: true,
      message: 'Scheduled report deleted'
    });
  } catch (error) {
    logger.error('Error deleting scheduled report', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error deleting scheduled report',
      error: error.message
    });
  }
};

/**
 * Get ingestion queue status
 * @route GET /api/analytics/status
 */
exports.getIngestionStatus = async (req, res) => {
  try {
    const status = eventIngestionService.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error getting ingestion status', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error retrieving status',
      error: error.message
    });
  }
};
