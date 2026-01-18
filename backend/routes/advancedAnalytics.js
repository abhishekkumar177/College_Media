/**
 * Advanced Analytics Routes
 * Routes for analytics events, metrics, and reports
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const analyticsController = require('../controllers/advancedAnalyticsController');

// Event tracking
router.post('/events', analyticsController.trackEvent);
router.post('/events/batch', analyticsController.trackEventBatch);

// Metrics and analytics
router.get('/dashboard', protect, analyticsController.getDashboardMetrics);
router.get('/realtime', protect, analyticsController.getRealTimeMetrics);
router.get('/engagement/:userId', protect, analyticsController.getUserEngagement);
router.get('/content/performance', protect, analyticsController.getContentPerformance);
router.get('/timeseries', protect, analyticsController.getTimeSeries);
router.get('/anomalies', protect, analyticsController.detectAnomalies);

// Advanced analytics
router.post('/funnel', protect, analyticsController.getFunnelAnalysis);
router.post('/cohort', protect, analyticsController.getCohortAnalysis);
router.post('/growth', protect, analyticsController.getGrowthMetrics);

// Reports
router.post('/reports/generate', protect, analyticsController.generateReport);
router.get('/reports/download/:fileName', protect, analyticsController.downloadReport);

// Scheduled reports
router.post('/reports/schedule', protect, analyticsController.createScheduledReport);
router.get('/reports/schedule', protect, analyticsController.getScheduledReports);
router.put('/reports/schedule/:id', protect, analyticsController.updateScheduledReport);
router.delete('/reports/schedule/:id', protect, analyticsController.deleteScheduledReport);

// System status
router.get('/status', protect, analyticsController.getIngestionStatus);

module.exports = router;
