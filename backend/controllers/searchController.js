const User = require('../models/User');
const Post = require('../models/Post');
const logger = require('../utils/logger');

/**
 * Search Controller - Handles unified search across collections
 */
class SearchController {
    /**
     * Search users by query
     * @param {string} query - Search query
     * @param {object} options - Search options (limit, skip, filters)
     */
    static async searchUsers(query, options = {}) {
        const {
            limit = 20,
            skip = 0,
            sortBy = 'relevance', // 'relevance', 'recent', 'followers'
            filters = {}
        } = options;

        try {
            let searchQuery = {
                isDeleted: false,
                isActive: true
            };

            // Apply text search if query provided
            if (query && query.trim()) {
                searchQuery.$text = { $search: query };
            }

            // Apply additional filters
            if (filters.role) {
                searchQuery.role = filters.role;
            }

            // Build sort
            let sort = {};
            if (query && sortBy === 'relevance') {
                sort = { score: { $meta: 'textScore' } };
            } else if (sortBy === 'recent') {
                sort = { createdAt: -1 };
            } else if (sortBy === 'followers') {
                sort = { followersCount: -1 };
            } else {
                sort = { createdAt: -1 };
            }

            // Execute query
            let queryBuilder = User.find(searchQuery)
                .select('username firstName lastName bio profilePicture role createdAt')
                .skip(skip)
                .limit(limit);

            // Add text score projection if text search
            if (query && query.trim()) {
                queryBuilder = queryBuilder.select({ score: { $meta: 'textScore' } });
            }

            queryBuilder = queryBuilder.sort(sort);

            const [users, total] = await Promise.all([
                queryBuilder.exec(),
                User.countDocuments(searchQuery)
            ]);

            return {
                results: users,
                total,
                page: Math.floor(skip / limit) + 1,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            logger.error('Search users error:', error);
            throw error;
        }
    }

    /**
     * Search posts by query
     * @param {string} query - Search query
     * @param {object} options - Search options
     */
    static async searchPosts(query, options = {}) {
        const {
            limit = 20,
            skip = 0,
            sortBy = 'relevance', // 'relevance', 'recent', 'popular'
            filters = {}
        } = options;

        try {
            let searchQuery = {
                isDeleted: false,
                visibility: 'public'
            };

            // Apply text search
            if (query && query.trim()) {
                searchQuery.$text = { $search: query };
            }

            // Apply filters
            if (filters.tag) {
                searchQuery.tags = filters.tag.toLowerCase();
            }
            if (filters.author) {
                searchQuery.author = filters.author;
            }
            if (filters.dateFrom) {
                searchQuery.createdAt = { ...searchQuery.createdAt, $gte: new Date(filters.dateFrom) };
            }
            if (filters.dateTo) {
                searchQuery.createdAt = { ...searchQuery.createdAt, $lte: new Date(filters.dateTo) };
            }

            // Build sort
            let sort = {};
            if (query && sortBy === 'relevance') {
                sort = { score: { $meta: 'textScore' } };
            } else if (sortBy === 'recent') {
                sort = { createdAt: -1 };
            } else if (sortBy === 'popular') {
                sort = { likesCount: -1, commentsCount: -1 };
            } else {
                sort = { createdAt: -1 };
            }

            let queryBuilder = Post.find(searchQuery)
                .populate('author', 'username firstName lastName profilePicture')
                .skip(skip)
                .limit(limit);

            if (query && query.trim()) {
                queryBuilder = queryBuilder.select({ score: { $meta: 'textScore' } });
            }

            queryBuilder = queryBuilder.sort(sort);

            const [posts, total] = await Promise.all([
                queryBuilder.exec(),
                Post.countDocuments(searchQuery)
            ]);

            return {
                results: posts,
                total,
                page: Math.floor(skip / limit) + 1,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            logger.error('Search posts error:', error);
            throw error;
        }
    }

    /**
     * Unified search across all collections
     * @param {string} query - Search query
     * @param {object} options - Search options
     */
    static async searchAll(query, options = {}) {
        const { limit = 10 } = options;

        try {
            const [users, posts] = await Promise.all([
                this.searchUsers(query, { ...options, limit }),
                this.searchPosts(query, { ...options, limit })
            ]);

            return {
                users: users.results,
                posts: posts.results,
                totals: {
                    users: users.total,
                    posts: posts.total
                }
            };
        } catch (error) {
            logger.error('Unified search error:', error);
            throw error;
        }
    }

    /**
     * Get trending tags
     */
    static async getTrendingTags(limit = 10) {
        try {
            const result = await Post.aggregate([
                { $match: { isDeleted: false, visibility: 'public' } },
                { $unwind: '$tags' },
                { $group: { _id: '$tags', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: limit },
                { $project: { tag: '$_id', count: 1, _id: 0 } }
            ]);

            return result;
        } catch (error) {
            logger.error('Get trending tags error:', error);
            throw error;
        }
    }

    /**
     * Get search suggestions based on partial query
     * @param {string} query - Partial search query
     */
    static async getSuggestions(query, limit = 5) {
        if (!query || query.length < 2) return [];

        try {
            const regex = new RegExp(`^${query}`, 'i');

            const [users, tags] = await Promise.all([
                User.find({
                    $or: [
                        { username: regex },
                        { firstName: regex },
                        { lastName: regex }
                    ],
                    isDeleted: false,
                    isActive: true
                })
                    .select('username firstName lastName profilePicture')
                    .limit(limit),
                Post.aggregate([
                    { $match: { isDeleted: false, tags: regex } },
                    { $unwind: '$tags' },
                    { $match: { tags: regex } },
                    { $group: { _id: '$tags' } },
                    { $limit: limit },
                    { $project: { tag: '$_id', _id: 0 } }
                ])
            ]);

            return {
                users: users.map(u => ({
                    type: 'user',
                    id: u._id,
                    text: u.username,
                    subtitle: `${u.firstName} ${u.lastName}`,
                    image: u.profilePicture
                })),
                tags: tags.map(t => ({
                    type: 'tag',
                    text: `#${t.tag}`
                }))
            };
        } catch (error) {
            logger.error('Get suggestions error:', error);
            throw error;
        }
    }
}

module.exports = SearchController;
