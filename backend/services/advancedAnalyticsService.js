/**
 * Advanced Analytics Service
 * Issue #908: Advanced Analytics Dashboard with Data Visualization
 * 
 * Enhanced analytics service for dashboard metrics and visualizations.
 */

const AnalyticsEvent = require('../models/AnalyticsEvent');
const UserMetrics = require('../models/UserMetrics');
const ContentMetrics = require('../models/ContentMetrics');

class AdvancedAnalyticsService {

    /**
     * Track an event
     */
    async trackEvent(eventData) {
        try {
            const event = await AnalyticsEvent.create({
                eventType: eventData.eventType,
                userId: eventData.userId,
                sessionId: eventData.sessionId,
                metadata: eventData.metadata || {},
                device: eventData.device || {},
                location: eventData.location || {},
                performance: eventData.performance || {},
                timestamp: eventData.timestamp || new Date()
            });

            return event;
        } catch (error) {
            console.error('[Analytics] Track event error:', error);
            throw error;
        }
    }

    /**
     * Get dashboard overview
     */
    async getDashboardOverview(startDate, endDate) {
        try {
            const [
                totalEvents,
                uniqueUsers,
                eventCounts,
                topEvents
            ] = await Promise.all([
                AnalyticsEvent.countDocuments({
                    timestamp: { $gte: startDate, $lte: endDate }
                }),
                AnalyticsEvent.getUniqueUsers(startDate, endDate),
                AnalyticsEvent.getEventCounts(startDate, endDate),
                AnalyticsEvent.getEventCounts(startDate, endDate, ['post_view', 'post_like', 'comment_create'])
            ]);

            return {
                totalEvents,
                uniqueUsers,
                eventCounts,
                topEvents
            };
        } catch (error) {
            console.error('[Analytics] Dashboard overview error:', error);
            throw error;
        }
    }

    /**
     * Get real-time metrics
     */
    async getRealTimeMetrics() {
        try {
            const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);

            const [activeUsers, recentEvents] = await Promise.all([
                AnalyticsEvent.distinct('userId', {
                    timestamp: { $gte: last5Minutes }
                }).then(users => users.length),

                AnalyticsEvent.countDocuments({
                    timestamp: { $gte: last5Minutes }
                })
            ]);

            return {
                activeUsers,
                recentEvents,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('[Analytics] Real-time metrics error:', error);
            throw error;
        }
    }

    /**
     * Get events over time
     */
    async getEventsOverTime(startDate, endDate, interval = 'day') {
        try {
            const events = await AnalyticsEvent.getEventsOverTime(startDate, endDate, interval);
            return events;
        } catch (error) {
            console.error('[Analytics] Events over time error:', error);
            throw error;
        }
    }

    /**
     * Get content performance
     */
    async getContentPerformance(limit = 10) {
        try {
            const topContent = await ContentMetrics.getTopContent(null, limit);
            return topContent;
        } catch (error) {
            console.error('[Analytics] Content performance error:', error);
            throw error;
        }
    }
}

module.exports = new AdvancedAnalyticsService();
