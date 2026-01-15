const Post = require('../models/Post');
const User = require('../models/User');
const Product = require('../models/Product');
const SearchIndexService = require('../services/searchIndexService');
const logger = require('../utils/logger');

const initMongoSync = () => {
    logger.info('Initializing MongoDB Change Streams for Search Sync...');

    try {
        // --- POST SYNC ---
        const postStream = Post.watch([], { fullDocument: 'updateLookup' });

        postStream.on('change', async (change) => {
            try {
                if (change.operationType === 'insert' || change.operationType === 'update') {
                    const doc = change.fullDocument;
                    if (doc.visibility === 'public' && !doc.isDeleted) {
                        await SearchIndexService.upsertDocument('posts', {
                            id: doc._id.toString(),
                            content: doc.content,
                            caption: doc.caption,
                            tags: doc.tags,
                            authorId: doc.user.toString(),
                            createdAt: doc.createdAt,
                            likeCount: doc.likeCount
                        });
                    } else {
                        // If private or deleted, remove from index
                        await SearchIndexService.deleteDocument('posts', doc._id.toString());
                    }
                } else if (change.operationType === 'delete') {
                    await SearchIndexService.deleteDocument('posts', change.documentKey._id.toString());
                }
            } catch (err) {
                logger.error('Post Sync Error:', err);
            }
        });

        // --- USER SYNC ---
        const userStream = User.watch([], { fullDocument: 'updateLookup' });

        userStream.on('change', async (change) => {
            try {
                if (change.operationType === 'insert' || change.operationType === 'update') {
                    const doc = change.fullDocument;
                    await SearchIndexService.upsertDocument('users', {
                        id: doc._id.toString(),
                        username: doc.username,
                        fullName: doc.fullName || '',
                        bio: doc.bio || '',
                        role: doc.role,
                        isVerified: !!doc.isVerified,
                        followersCount: doc.followers?.length || 0
                    });
                } else if (change.operationType === 'delete') {
                    await SearchIndexService.deleteDocument('users', change.documentKey._id.toString());
                }
            } catch (err) {
                logger.error('User Sync Error:', err);
            }
        });

        // --- PRODUCT SYNC (Marketplace) ---
        // Verify model exists before watching (Product might be optional in some deploys)
        if (Product && Product.watch) {
            const productStream = Product.watch([], { fullDocument: 'updateLookup' });
            productStream.on('change', async (change) => {
                if (change.operationType === 'insert' || change.operationType === 'update') {
                    const doc = change.fullDocument;
                    if (doc.status === 'active') {
                        await SearchIndexService.upsertDocument('products', {
                            id: doc._id.toString(),
                            title: doc.title,
                            description: doc.description,
                            price: doc.price,
                            category: doc.category
                        });
                    } else {
                        await SearchIndexService.deleteDocument('products', doc._id.toString());
                    }
                } else if (change.operationType === 'delete') {
                    await SearchIndexService.deleteDocument('products', change.documentKey._id.toString());
                }
            });
        }

    } catch (error) {
        logger.warn('Change Streams Initialization Failed (Replica Set required):', error.message);
    }
};

module.exports = initMongoSync;
