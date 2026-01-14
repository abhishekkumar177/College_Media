const UserInterest = require('../models/UserInterest');
const Post = require('../models/Post');
const User = require('../models/User');
const redisClient = require('../utils/redisClient');
const logger = require('../utils/logger');

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = 'rec:';

/**
 * Recommendation Service - AI-powered content and user recommendations
 */
class RecommenderService {

    /**
     * Get personalized feed for a user
     */
    static async getRecommendedFeed(userId, options = {}) {
        const { page = 1, limit = 20, forceRefresh = false } = options;
        const cacheKey = `${CACHE_PREFIX}feed:${userId}:${page}`;

        try {
            // Check cache first
            if (!forceRefresh && redisClient.isConnected()) {
                const cached = await redisClient.get(cacheKey);
                if (cached) {
                    logger.debug(`Cache hit for recommendations: ${userId}`);
                    return JSON.parse(cached);
                }
            }

            // Get user interest profile
            const userInterest = await UserInterest.getOrCreate(userId);
            const topTags = userInterest.getTopTags(15);
            const topAffinities = userInterest.getTopAffinities(10);

            // Build recommendation query using aggregation
            const recommendations = await this.buildRecommendationPipeline(
                userId,
                topTags,
                topAffinities,
                page,
                limit
            );

            const result = {
                posts: recommendations,
                page,
                hasMore: recommendations.length === limit,
                generatedAt: new Date()
            };

            // Cache results
            if (redisClient.isConnected()) {
                await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
            }

            return result;
        } catch (error) {
            logger.error('Get recommended feed error:', error);
            // Fallback to chronological feed
            return this.getFallbackFeed(userId, page, limit);
        }
    }

    /**
     * Build MongoDB aggregation pipeline for recommendations
     */
    static async buildRecommendationPipeline(userId, topTags, topAffinities, page, limit) {
        const skip = (page - 1) * limit;
        const tagNames = topTags.map(t => t.tag);
        const affinityUserIds = topAffinities.map(a => a.userId);

        // Calculate tag weight map for scoring
        const tagWeightMap = {};
        topTags.forEach(t => { tagWeightMap[t.tag] = t.weight; });

        const pipeline = [
            // Match non-deleted, public posts
            {
                $match: {
                    isDeleted: false,
                    visibility: 'public',
                    author: { $ne: userId } // Exclude own posts
                }
            },
            // Add relevance score
            {
                $addFields: {
                    // Tag match score
                    tagScore: {
                        $size: {
                            $ifNull: [
                                { $setIntersection: ['$tags', tagNames] },
                                []
                            ]
                        }
                    },
                    // Author affinity score (if from followed/interacted users)
                    affinityScore: {
                        $cond: [
                            { $in: [{ $toString: '$author' }, affinityUserIds] },
                            2,
                            0
                        ]
                    },
                    // Recency score (decay over time)
                    recencyScore: {
                        $divide: [
                            1,
                            {
                                $add: [
                                    1,
                                    {
                                        $divide: [
                                            { $subtract: [new Date(), '$createdAt'] },
                                            86400000 // 1 day in ms
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    // Engagement score
                    engagementScore: {
                        $add: [
                            { $ifNull: ['$likeCount', 0] },
                            { $multiply: [{ $ifNull: ['$commentCount', 0] }, 2] }
                        ]
                    }
                }
            },
            // Calculate final relevance score
            {
                $addFields: {
                    relevanceScore: {
                        $add: [
                            { $multiply: ['$tagScore', 3] },
                            { $multiply: ['$affinityScore', 2] },
                            { $multiply: ['$recencyScore', 1] },
                            { $multiply: ['$engagementScore', 0.1] }
                        ]
                    }
                }
            },
            // Sort by relevance
            { $sort: { relevanceScore: -1, createdAt: -1 } },
            // Pagination
            { $skip: skip },
            { $limit: limit },
            // Populate author
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                    pipeline: [
                        { $project: { username: 1, firstName: 1, lastName: 1, profilePicture: 1 } }
                    ]
                }
            },
            { $unwind: '$author' },
            // Clean up response
            {
                $project: {
                    content: 1,
                    tags: 1,
                    images: 1,
                    author: 1,
                    likeCount: 1,
                    commentCount: 1,
                    createdAt: 1,
                    relevanceScore: 1
                }
            }
        ];

        return Post.aggregate(pipeline);
    }

    /**
     * Fallback to simple chronological feed
     */
    static async getFallbackFeed(userId, page, limit) {
        const skip = (page - 1) * limit;

        const posts = await Post.find({
            isDeleted: false,
            visibility: 'public',
            author: { $ne: userId }
        })
            .populate('author', 'username firstName lastName profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return {
            posts,
            page,
            hasMore: posts.length === limit,
            generatedAt: new Date(),
            isFallback: true
        };
    }

    /**
     * Get recommended users to follow
     */
    static async getRecommendedUsers(userId, limit = 10) {
        const cacheKey = `${CACHE_PREFIX}users:${userId}`;

        try {
            // Check cache
            if (redisClient.isConnected()) {
                const cached = await redisClient.get(cacheKey);
                if (cached) return JSON.parse(cached);
            }

            const userInterest = await UserInterest.getOrCreate(userId);
            const topTags = userInterest.getTopTags(10);
            const tagNames = topTags.map(t => t.tag);

            // Find users with similar interests
            const similarUsers = await UserInterest.aggregate([
                { $match: { user: { $ne: userId } } },
                {
                    $addFields: {
                        tagArray: { $objectToArray: '$tagWeights' }
                    }
                },
                {
                    $addFields: {
                        matchingTags: {
                            $size: {
                                $filter: {
                                    input: '$tagArray',
                                    as: 'tag',
                                    cond: { $in: ['$$tag.k', tagNames] }
                                }
                            }
                        }
                    }
                },
                { $sort: { matchingTags: -1 } },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: '$userDetails' },
                {
                    $project: {
                        user: '$userDetails',
                        matchingTags: 1,
                        similarity: { $divide: ['$matchingTags', { $max: [tagNames.length, 1] }] }
                    }
                }
            ]);

            // Cache results
            if (redisClient.isConnected()) {
                await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(similarUsers));
            }

            return similarUsers;
        } catch (error) {
            logger.error('Get recommended users error:', error);
            return [];
        }
    }

    /**
     * Track user interaction for learning
     */
    static async trackInteraction(userId, targetId, targetType, interactionType) {
        try {
            const userInterest = await UserInterest.getOrCreate(userId);

            if (targetType === 'post') {
                // Get post tags and update weights
                const post = await Post.findById(targetId).select('tags author');
                if (post) {
                    // Update tag weights
                    if (post.tags && post.tags.length > 0) {
                        post.tags.forEach(tag => {
                            userInterest.updateTagWeight(tag, interactionType);
                        });
                    }
                    // Update author affinity
                    if (post.author) {
                        userInterest.updateUserAffinity(post.author, interactionType);
                    }
                }
            } else if (targetType === 'user') {
                userInterest.updateUserAffinity(targetId, interactionType);
            }

            // Update engagement stats
            if (interactionType === 'like') userInterest.engagementStats.totalLikes++;
            if (interactionType === 'comment') userInterest.engagementStats.totalComments++;
            if (interactionType === 'view') userInterest.engagementStats.totalViews++;

            await userInterest.save();

            // Invalidate cache
            if (redisClient.isConnected()) {
                await redisClient.del(`${CACHE_PREFIX}feed:${userId}:1`);
            }

            logger.debug(`Tracked ${interactionType} for user ${userId}`);
        } catch (error) {
            logger.error('Track interaction error:', error);
        }
    }
}

module.exports = RecommenderService;
