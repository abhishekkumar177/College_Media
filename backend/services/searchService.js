const Post = require('../models/Post');
const User = require('../models/User');
const Event = require('../models/Event');
const logger = require('../utils/logger');

/**
 * Global Full-Text Search Service
 * Aggregates results from multiple collections with advanced filtering
 * Issue #883: Global Full-Text Search with Filters
 */
class SearchService {
  /**
   * Parse filter query string
   * @param {string} filterString - Filter string like "type:post date:last_week role:moderator"
   * @returns {Object} Parsed filters
   */
  static parseFilters(filterString) {
    const filters = {
      type: null,
      date: null,
      role: null,
      sortBy: 'relevance',
      verified: null,
      limit: 20,
      skip: 0
    };

    if (!filterString) return filters;

    const filterPairs = filterString.match(/(\w+):(\w+)/g) || [];

    filterPairs.forEach(pair => {
      const [key, value] = pair.split(':');
      switch (key) {
        case 'type':
          filters.type = ['post', 'user', 'event'].includes(value) ? value : null;
          break;
        case 'date':
          filters.date = ['last_day', 'last_week', 'last_month', 'last_year'].includes(value) ? value : null;
          break;
        case 'role':
          filters.role = ['admin', 'moderator', 'user'].includes(value) ? value : null;
          break;
        case 'sort':
          filters.sortBy = ['relevance', 'recent', 'popular', 'trending'].includes(value) ? value : 'relevance';
          break;
        case 'verified':
          filters.verified = value === 'true';
          break;
        case 'limit':
          filters.limit = Math.min(parseInt(value) || 20, 100);
          break;
        case 'skip':
          filters.skip = Math.max(parseInt(value) || 0, 0);
          break;
      }
    });

    return filters;
  }

  /**
   * Build date range query
   * @param {string} dateFilter - 'last_day', 'last_week', 'last_month', 'last_year'
   * @returns {Object} MongoDB date range query
   */
  static getDateRange(dateFilter) {
    const now = new Date();
    let startDate;

    switch (dateFilter) {
      case 'last_day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'last_week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last_month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last_year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return {};
    }

    return { createdAt: { $gte: startDate } };
  }

  /**
   * Search Posts with full-text search and filters
   */
  static async searchPosts(query, filters = {}) {
    try {
      let searchQuery = {
        isDeleted: false,
        visibility: 'public'
      };

      // Text search
      if (query && query.trim()) {
        searchQuery.$text = { $search: query };
      }

      // Date filter
      if (filters.date) {
        Object.assign(searchQuery, this.getDateRange(filters.date));
      }

      // Build sort
      let sort = { createdAt: -1 };
      if (query && filters.sortBy === 'relevance') {
        sort = { score: { $meta: 'textScore' }, createdAt: -1 };
      } else if (filters.sortBy === 'popular') {
        sort = { likeCount: -1, createdAt: -1 };
      } else if (filters.sortBy === 'trending') {
        // Trending: Recent + Popular
        sort = { likeCount: -1, createdAt: -1 };
      }

      // Execute query
      let queryBuilder = Post.find(searchQuery)
        .select('title caption content author likeCount commentCount visibility createdAt tags')
        .populate('author', 'username profilePicture role')
        .skip(filters.skip || 0)
        .limit(filters.limit || 20);

      // Add text score if searching
      if (query && query.trim()) {
        queryBuilder = queryBuilder.select({ score: { $meta: 'textScore' } });
      }

      const [posts, total] = await Promise.all([
        queryBuilder.sort(sort).exec(),
        Post.countDocuments(searchQuery)
      ]);

      return {
        results: posts.map(post => ({
          _id: post._id,
          type: 'post',
          title: post.title || post.caption,
          description: post.content?.substring(0, 150),
          author: post.author,
          likes: post.likeCount,
          comments: post.commentCount,
          createdAt: post.createdAt,
          score: post.score
        })),
        total,
        type: 'post'
      };
    } catch (error) {
      logger.error('Search posts error:', error);
      return { results: [], total: 0, type: 'post' };
    }
  }

  /**
   * Search Users with full-text search and filters
   */
  static async searchUsers(query, filters = {}) {
    try {
      let searchQuery = {
        isDeleted: false,
        isActive: true
      };

      // Text search
      if (query && query.trim()) {
        searchQuery.$text = { $search: query };
      }

      // Role filter
      if (filters.role) {
        searchQuery.role = filters.role;
      }

      // Verified filter
      if (filters.verified !== null && filters.verified !== undefined) {
        searchQuery.isVerified = filters.verified;
      }

      // Build sort
      let sort = { createdAt: -1 };
      if (query && filters.sortBy === 'relevance') {
        sort = { score: { $meta: 'textScore' }, followerCount: -1 };
      } else if (filters.sortBy === 'popular') {
        sort = { followerCount: -1 };
      }

      // Execute query
      let queryBuilder = User.find(searchQuery)
        .select('username firstName lastName bio profilePicture role isVerified followerCount createdAt')
        .skip(filters.skip || 0)
        .limit(filters.limit || 20);

      if (query && query.trim()) {
        queryBuilder = queryBuilder.select({ score: { $meta: 'textScore' } });
      }

      const [users, total] = await Promise.all([
        queryBuilder.sort(sort).exec(),
        User.countDocuments(searchQuery)
      ]);

      return {
        results: users.map(user => ({
          _id: user._id,
          type: 'user',
          title: `${user.firstName} ${user.lastName}`,
          username: user.username,
          description: user.bio,
          profilePicture: user.profilePicture,
          role: user.role,
          verified: user.isVerified,
          followers: user.followerCount,
          createdAt: user.createdAt,
          score: user.score
        })),
        total,
        type: 'user'
      };
    } catch (error) {
      logger.error('Search users error:', error);
      return { results: [], total: 0, type: 'user' };
    }
  }

  /**
   * Search Events with full-text search and filters
   */
  static async searchEvents(query, filters = {}) {
    try {
      let searchQuery = {
        isDeleted: false,
        status: { $in: ['scheduled', 'ongoing'] }
      };

      // Text search
      if (query && query.trim()) {
        searchQuery.$text = { $search: query };
      }

      // Date filter (events happening)
      if (filters.date) {
        const dateRange = this.getDateRange(filters.date);
        if (dateRange.createdAt) {
          searchQuery.createdAt = dateRange.createdAt;
        }
      }

      // Build sort
      let sort = { startDate: 1 }; // Upcoming events first
      if (query && filters.sortBy === 'relevance') {
        sort = { score: { $meta: 'textScore' }, startDate: 1 };
      } else if (filters.sortBy === 'popular') {
        sort = { attendeeCount: -1, startDate: 1 };
      }

      // Execute query
      let queryBuilder = Event.find(searchQuery)
        .select('title description location startDate endDate attendeeCount creator category')
        .populate('creator', 'username profilePicture')
        .skip(filters.skip || 0)
        .limit(filters.limit || 20);

      if (query && query.trim()) {
        queryBuilder = queryBuilder.select({ score: { $meta: 'textScore' } });
      }

      const [events, total] = await Promise.all([
        queryBuilder.sort(sort).exec(),
        Event.countDocuments(searchQuery)
      ]);

      return {
        results: events.map(event => ({
          _id: event._id,
          type: 'event',
          title: event.title,
          description: event.description?.substring(0, 150),
          location: event.location,
          startDate: event.startDate,
          creator: event.creator,
          attendees: event.attendeeCount,
          category: event.category,
          createdAt: event.createdAt,
          score: event.score
        })),
        total,
        type: 'event'
      };
    } catch (error) {
      logger.error('Search events error:', error);
      return { results: [], total: 0, type: 'event' };
    }
  }

  /**
   * Global unified search across all types
   */
  static async globalSearch(query, filterString = '', options = {}) {
    try {
      const filters = this.parseFilters(filterString);
      const { type = null } = options;

      // Search based on type filter
      if (type === 'post') {
        return this.searchPosts(query, filters);
      } else if (type === 'user') {
        return this.searchUsers(query, filters);
      } else if (type === 'event') {
        return this.searchEvents(query, filters);
      }

      // Search all types if no type specified
      const [posts, users, events] = await Promise.all([
        this.searchPosts(query, { ...filters, limit: 5, skip: 0 }),
        this.searchUsers(query, { ...filters, limit: 5, skip: 0 }),
        this.searchEvents(query, { ...filters, limit: 5, skip: 0 })
      ]);

      return {
        posts: posts.results,
        users: users.results,
        events: events.results,
        total: posts.total + users.total + events.total,
        aggregated: true
      };
    } catch (error) {
      logger.error('Global search error:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions (autocomplete)
   */
  static async getSuggestions(query, limit = 10) {
    try {
      if (!query || query.length < 2) {
        return { suggestions: [] };
      }

      // Search for users
      const userSuggestions = await User.find(
        { $text: { $search: query }, isActive: true, isDeleted: false },
        { score: { $meta: 'textScore' } }
      )
        .select('username firstName')
        .limit(limit / 2)
        .sort({ score: { $meta: 'textScore' } })
        .exec();

      // Search for posts
      const postSuggestions = await Post.find(
        { $text: { $search: query }, visibility: 'public', isDeleted: false },
        { score: { $meta: 'textScore' } }
      )
        .select('title')
        .limit(limit / 2)
        .sort({ score: { $meta: 'textScore' } })
        .exec();

      const suggestions = [
        ...userSuggestions.map(u => ({
          text: u.username,
          type: 'user',
          icon: 'user'
        })),
        ...postSuggestions.map(p => ({
          text: p.title,
          type: 'post',
          icon: 'file'
        }))
      ].slice(0, limit);

      return { suggestions };
    } catch (error) {
      logger.error('Get suggestions error:', error);
      return { suggestions: [] };
    }
  }

  /**
   * Advanced search with pagination
   */
  static async advancedSearch(query, filterString = '', page = 1, limit = 20) {
    try {
      const filters = this.parseFilters(filterString);
      filters.skip = (page - 1) * limit;
      filters.limit = limit;

      // Get results based on type
      let result;
      if (filters.type === 'post') {
        result = await this.searchPosts(query, filters);
      } else if (filters.type === 'user') {
        result = await this.searchUsers(query, filters);
      } else if (filters.type === 'event') {
        result = await this.searchEvents(query, filters);
      } else {
        result = await this.globalSearch(query, filterString, { type: null });
      }

      return {
        ...result,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      };
    } catch (error) {
      logger.error('Advanced search error:', error);
      throw error;
    }
  }
}

module.exports = SearchService;
