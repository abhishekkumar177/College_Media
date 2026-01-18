/**
 * Advanced Search Controller
 * Issue #910: Advanced Search with Elasticsearch Integration
 * 
 * API endpoints for Elasticsearch-powered advanced search.
 */

const elasticsearchService = require('../services/elasticsearchService');
const autocompleteService = require('../services/autocompleteService');
const searchAnalyticsService = require('../services/searchAnalyticsService');
const searchSyncService = require('../services/searchSyncService');
const SearchQuery = require('../models/SearchQuery');

const advancedSearchController = {

    /**
     * POST /api/search/advanced
     * Perform advanced search with Elasticsearch
     */
    async advancedSearch(req, res) {
        try {
            const {
                query,
                type = 'all',
                filters = {},
                page = 1,
                limit = 20,
                sortBy = 'relevance'
            } = req.body;

            const from = (page - 1) * limit;

            const results = await elasticsearchService.search({
                query,
                type,
                filters,
                from,
                size: limit,
                sortBy,
                userId: req.user?._id
            });

            res.json({
                success: true,
                data: {
                    ...results,
                    page,
                    limit,
                    totalPages: Math.ceil(results.total / limit)
                }
            });
        } catch (error) {
            console.error('Advanced search error:', error);
            res.status(500).json({
                success: false,
                message: 'Search failed',
                error: error.message
            });
        }
    },

    /**
     * GET /api/search/advanced/autocomplete
     * Get autocomplete suggestions
     */
    async autocomplete(req, res) {
        try {
            const { q, type = 'all', limit = 10 } = req.query;

            const suggestions = await autocompleteService.getSuggestions(q, {
                type,
                limit: parseInt(limit),
                userId: req.user?._id
            });

            res.json({
                success: true,
                data: suggestions
            });
        } catch (error) {
            console.error('Autocomplete error:', error);
            res.status(500).json({
                success: false,
                message: 'Autocomplete failed'
            });
        }
    },

    /**
     * POST /api/search/advanced/sync
     * Trigger manual sync (admin only)
     */
    async triggerSync(req, res) {
        try {
            const { type = 'all' } = req.body;

            let result;
            if (type === 'posts') {
                result = await searchSyncService.syncAllPosts();
            } else if (type === 'users') {
                result = await searchSyncService.syncAllUsers();
            } else {
                result = await searchSyncService.syncAll();
            }

            res.json({
                success: true,
                message: 'Sync completed',
                data: result
            });
        } catch (error) {
            console.error('Sync error:', error);
            res.status(500).json({
                success: false,
                message: 'Sync failed'
            });
        }
    },

    /**
     * GET /api/search/advanced/analytics
     * Get search analytics
     */
    async getAnalytics(req, res) {
        try {
            const { startDate, endDate } = req.query;

            const analytics = await searchAnalyticsService.getAnalytics(startDate, endDate);

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get analytics'
            });
        }
    }
};

module.exports = advancedSearchController;
