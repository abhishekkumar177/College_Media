const { MeiliSearch } = require('meilisearch');
const logger = require('../utils/logger');

const MEILI_HOST = process.env.MEILI_HOST || 'http://127.0.0.1:7700';
const MEILI_KEY = process.env.MEILI_MASTER_KEY || 'masterKey';

class SearchIndexService {
    constructor() {
        this.client = new MeiliSearch({
            host: MEILI_HOST,
            apiKey: MEILI_KEY
        });
        this.indexes = {
            posts: this.client.index('posts'),
            users: this.client.index('users'),
            products: this.client.index('products')
        };
        this.initIndexes();
    }

    async initIndexes() {
        try {
            // Configure Post Index
            await this.indexes.posts.updateSettings({
                searchableAttributes: ['content', 'caption', 'tags'],
                filterableAttributes: ['tags', 'authorId', 'createdAt', 'visibility'],
                sortableAttributes: ['createdAt', 'likeCount'],
                rankingRules: ['words', 'typo', 'attribute', 'exactness', 'createdAt:desc']
            });

            // Configure User Index
            await this.indexes.users.updateSettings({
                searchableAttributes: ['username', 'email', 'fullName', 'bio'],
                filterableAttributes: ['role', 'isVerified'],
                sortableAttributes: ['followersCount']
            });

            logger.info('MeiliSearch indexes initialized.');
        } catch (error) {
            logger.warn('MeiliSearch initialization warning (is server running?):', error.message);
        }
    }

    /**
     * Add or Update document
     * @param {string} indexName - 'posts' | 'users'
     * @param {Object} data 
     */
    async upsertDocument(indexName, data) {
        try {
            if (!this.indexes[indexName]) return;
            const response = await this.indexes[indexName].addDocuments([data]);
            return response;
        } catch (error) {
            logger.error(`Search Index Upsert Error (${indexName}):`, error.message);
        }
    }

    /**
     * Delete document
     */
    async deleteDocument(indexName, id) {
        try {
            if (!this.indexes[indexName]) return;
            await this.indexes[indexName].deleteDocument(id);
        } catch (error) {
            logger.error(`Search Index Delete Error (${indexName}):`, error.message);
        }
    }

    /**
     * Search Global
     */
    async searchGlobal(query, filters = {}) {
        try {
            const [posts, users, products] = await Promise.all([
                this.indexes.posts.search(query, { limit: 5, filter: filters.posts }),
                this.indexes.users.search(query, { limit: 5, filter: filters.users }),
                this.indexes.products.search(query, { limit: 5 })
            ]);

            return {
                posts: posts.hits,
                users: users.hits,
                products: products.hits
            };
        } catch (error) {
            logger.error('Global Search Error:', error.message);
            return { posts: [], users: [], products: [] }; // Fail safe
        }
    }
}

module.exports = new SearchIndexService();
