const SearchService = require('../services/searchService');
const logger = require('../utils/logger');

/**
 * Search Controller - Unified search with advanced filtering
 * Issue #883: Global Full-Text Search with Filters
 */
class SearchController {
  /**
   * Global search endpoint
   * GET /api/search?q=query&filters=type:post date:last_week
   */
  static async globalSearch(req, res) {
    try {
      const { q, filters = '', type = null } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const result = await SearchService.globalSearch(q, filters, { type });

      res.json({
        success: true,
        data: result,
        query: q,
        filters
      });
    } catch (error) {
      logger.error('Global search error:', error);
      res.status(500).json({
        success: false,
        message: 'Search failed'
      });
    }
  }

  /**
   * Advanced search with pagination
   * GET /api/search/advanced?q=query&filters=type:post&page=1&limit=20
   */
  static async advancedSearch(req, res) {
    try {
      const { q, filters = '', page = 1, limit = 20 } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const result = await SearchService.advancedSearch(
        q,
        filters,
        parseInt(page),
        Math.min(parseInt(limit), 100)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Advanced search error:', error);
      res.status(500).json({
        success: false,
        message: 'Advanced search failed'
      });
    }
  }

  /**
   * Search posts only
   * GET /api/search/posts?q=query&filters=date:last_week
   */
  static async searchPosts(req, res) {
    try {
      const { q, filters = '' } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const parsedFilters = SearchService.parseFilters(filters);
      const result = await SearchService.searchPosts(q, parsedFilters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Search posts error:', error);
      res.status(500).json({
        success: false,
        message: 'Post search failed'
      });
    }
  }

  /**
   * Search users only
   * GET /api/search/users?q=query&filters=verified:true role:moderator
   */
  static async searchUsers(req, res) {
    try {
      const { q, filters = '' } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const parsedFilters = SearchService.parseFilters(filters);
      const result = await SearchService.searchUsers(q, parsedFilters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Search users error:', error);
      res.status(500).json({
        success: false,
        message: 'User search failed'
      });
    }
  }

  /**
   * Search events only
   * GET /api/search/events?q=query&filters=date:last_month
   */
  static async searchEvents(req, res) {
    try {
      const { q, filters = '' } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const parsedFilters = SearchService.parseFilters(filters);
      const result = await SearchService.searchEvents(q, parsedFilters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Search events error:', error);
      res.status(500).json({
        success: false,
        message: 'Event search failed'
      });
    }
  }

  /**
   * Get search suggestions for autocomplete
   * GET /api/search/suggestions?q=java&limit=10
   */
  static async getSuggestions(req, res) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.length < 2) {
        return res.json({ success: true, data: { suggestions: [] } });
      }

      const result = await SearchService.getSuggestions(q, parseInt(limit));

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get suggestions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get suggestions'
      });
    }
  }
}

module.exports = SearchController;
