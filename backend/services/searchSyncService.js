/**
 * Search Sync Service
 * Issue #910: Advanced Search with Elasticsearch Integration
 * 
 * Synchronizes data from MongoDB to Elasticsearch.
 */

const elasticsearchService = require('./elasticsearchService');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

class SearchSyncService {

    /**
     * Sync a single post to Elasticsearch
     */
    async syncPost(postId) {
        try {
            const post = await Post.findById(postId)
                .populate('userId', 'username')
                .lean();

            if (!post) {
                console.log(`[Sync] Post ${postId} not found`);
                return;
            }

            const document = {
                userId: post.userId._id.toString(),
                username: post.userId.username,
                caption: post.caption || '',
                content: post.content || '',
                tags: post.tags || [],
                category: post.category || 'general',
                likes: post.likes?.length || 0,
                comments: post.comments?.length || 0,
                shares: post.shares || 0,
                views: post.views || 0,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                isPublic: post.isPublic !== false
            };

            await elasticsearchService.indexDocument('posts', postId, document);
            console.log(`[Sync] Post ${postId} synced successfully`);
        } catch (error) {
            console.error(`[Sync] Error syncing post ${postId}:`, error);
        }
    }

    /**
     * Sync a single user to Elasticsearch
     */
    async syncUser(userId) {
        try {
            const user = await User.findById(userId).lean();

            if (!user) {
                console.log(`[Sync] User ${userId} not found`);
                return;
            }

            const document = {
                username: user.username,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                bio: user.bio || '',
                email: user.email,
                college: user.college || '',
                department: user.department || '',
                followers: user.followers?.length || 0,
                following: user.following?.length || 0,
                posts: user.posts || 0,
                verified: user.verified || false,
                createdAt: user.createdAt
            };

            await elasticsearchService.indexDocument('users', userId, document);
            console.log(`[Sync] User ${userId} synced successfully`);
        } catch (error) {
            console.error(`[Sync] Error syncing user ${userId}:`, error);
        }
    }

    /**
     * Sync a single comment to Elasticsearch
     */
    async syncComment(commentId) {
        try {
            const comment = await Comment.findById(commentId)
                .populate('userId', 'username')
                .lean();

            if (!comment) {
                console.log(`[Sync] Comment ${commentId} not found`);
                return;
            }

            const document = {
                postId: comment.postId.toString(),
                userId: comment.userId._id.toString(),
                username: comment.userId.username,
                content: comment.content || '',
                likes: comment.likes?.length || 0,
                createdAt: comment.createdAt
            };

            await elasticsearchService.indexDocument('comments', commentId, document);
            console.log(`[Sync] Comment ${commentId} synced successfully`);
        } catch (error) {
            console.error(`[Sync] Error syncing comment ${commentId}:`, error);
        }
    }

    /**
     * Bulk sync all posts
     */
    async syncAllPosts(batchSize = 100) {
        try {
            console.log('[Sync] Starting bulk post sync...');
            let skip = 0;
            let synced = 0;

            while (true) {
                const posts = await Post.find()
                    .populate('userId', 'username')
                    .skip(skip)
                    .limit(batchSize)
                    .lean();

                if (posts.length === 0) break;

                const documents = posts.map(post => ({
                    _id: post._id,
                    userId: post.userId._id.toString(),
                    username: post.userId.username,
                    caption: post.caption || '',
                    content: post.content || '',
                    tags: post.tags || [],
                    category: post.category || 'general',
                    likes: post.likes?.length || 0,
                    comments: post.comments?.length || 0,
                    shares: post.shares || 0,
                    views: post.views || 0,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                    isPublic: post.isPublic !== false
                }));

                await elasticsearchService.bulkIndex('posts', documents);

                synced += documents.length;
                skip += batchSize;

                console.log(`[Sync] Synced ${synced} posts...`);
            }

            console.log(`[Sync] Completed! Total posts synced: ${synced}`);
            return synced;
        } catch (error) {
            console.error('[Sync] Error in bulk post sync:', error);
            throw error;
        }
    }

    /**
     * Bulk sync all users
     */
    async syncAllUsers(batchSize = 100) {
        try {
            console.log('[Sync] Starting bulk user sync...');
            let skip = 0;
            let synced = 0;

            while (true) {
                const users = await User.find()
                    .skip(skip)
                    .limit(batchSize)
                    .lean();

                if (users.length === 0) break;

                const documents = users.map(user => ({
                    _id: user._id,
                    username: user.username,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    bio: user.bio || '',
                    email: user.email,
                    college: user.college || '',
                    department: user.department || '',
                    followers: user.followers?.length || 0,
                    following: user.following?.length || 0,
                    posts: user.posts || 0,
                    verified: user.verified || false,
                    createdAt: user.createdAt
                }));

                await elasticsearchService.bulkIndex('users', documents);

                synced += documents.length;
                skip += batchSize;

                console.log(`[Sync] Synced ${synced} users...`);
            }

            console.log(`[Sync] Completed! Total users synced: ${synced}`);
            return synced;
        } catch (error) {
            console.error('[Sync] Error in bulk user sync:', error);
            throw error;
        }
    }

    /**
     * Sync all data
     */
    async syncAll() {
        try {
            console.log('[Sync] Starting full sync...');

            const results = {
                posts: await this.syncAllPosts(),
                users: await this.syncAllUsers()
            };

            console.log('[Sync] Full sync completed:', results);
            return results;
        } catch (error) {
            console.error('[Sync] Error in full sync:', error);
            throw error;
        }
    }

    /**
     * Delete from Elasticsearch
     */
    async deletePost(postId) {
        try {
            await elasticsearchService.deleteDocument('posts', postId);
            console.log(`[Sync] Post ${postId} deleted from Elasticsearch`);
        } catch (error) {
            console.error(`[Sync] Error deleting post ${postId}:`, error);
        }
    }

    async deleteUser(userId) {
        try {
            await elasticsearchService.deleteDocument('users', userId);
            console.log(`[Sync] User ${userId} deleted from Elasticsearch`);
        } catch (error) {
            console.error(`[Sync] Error deleting user ${userId}:`, error);
        }
    }

    async deleteComment(commentId) {
        try {
            await elasticsearchService.deleteDocument('comments', commentId);
            console.log(`[Sync] Comment ${commentId} deleted from Elasticsearch`);
        } catch (error) {
            console.error(`[Sync] Error deleting comment ${commentId}:`, error);
        }
    }
}

module.exports = new SearchSyncService();
