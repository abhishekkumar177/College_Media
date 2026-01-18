/**
 * Elasticsearch Configuration
 * Issue #910: Advanced Search with Elasticsearch Integration
 * 
 * Configuration for Elasticsearch client connection.
 */

const { Client } = require('@elastic/elasticsearch');

// Elasticsearch client configuration
const elasticsearchConfig = {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
    },
    maxRetries: 5,
    requestTimeout: 60000,
    sniffOnStart: true
};

// Create Elasticsearch client
const client = new Client(elasticsearchConfig);

// Index names
const INDICES = {
    POSTS: 'college_media_posts',
    USERS: 'college_media_users',
    COMMENTS: 'college_media_comments'
};

// Index mappings
const INDEX_MAPPINGS = {
    posts: {
        properties: {
            userId: { type: 'keyword' },
            username: { type: 'keyword' },
            caption: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                    keyword: { type: 'keyword' },
                    autocomplete: {
                        type: 'text',
                        analyzer: 'autocomplete',
                        search_analyzer: 'standard'
                    }
                }
            },
            content: {
                type: 'text',
                analyzer: 'standard'
            },
            tags: {
                type: 'keyword'
            },
            category: { type: 'keyword' },
            likes: { type: 'integer' },
            comments: { type: 'integer' },
            shares: { type: 'integer' },
            views: { type: 'integer' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
            isPublic: { type: 'boolean' },
            location: { type: 'geo_point' }
        }
    },
    users: {
        properties: {
            username: {
                type: 'text',
                fields: {
                    keyword: { type: 'keyword' },
                    autocomplete: {
                        type: 'text',
                        analyzer: 'autocomplete',
                        search_analyzer: 'standard'
                    }
                }
            },
            firstName: { type: 'text' },
            lastName: { type: 'text' },
            bio: { type: 'text' },
            email: { type: 'keyword' },
            college: { type: 'keyword' },
            department: { type: 'keyword' },
            followers: { type: 'integer' },
            following: { type: 'integer' },
            posts: { type: 'integer' },
            verified: { type: 'boolean' },
            createdAt: { type: 'date' }
        }
    },
    comments: {
        properties: {
            postId: { type: 'keyword' },
            userId: { type: 'keyword' },
            username: { type: 'keyword' },
            content: {
                type: 'text',
                analyzer: 'standard'
            },
            likes: { type: 'integer' },
            createdAt: { type: 'date' }
        }
    }
};

// Custom analyzers
const INDEX_SETTINGS = {
    analysis: {
        analyzer: {
            autocomplete: {
                tokenizer: 'autocomplete',
                filter: ['lowercase']
            }
        },
        tokenizer: {
            autocomplete: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 10,
                token_chars: ['letter', 'digit']
            }
        }
    }
};

/**
 * Initialize Elasticsearch indices
 */
async function initializeIndices() {
    try {
        // Check connection
        await client.ping();
        console.log('[Elasticsearch] Connected successfully');

        // Create indices if they don't exist
        for (const [key, indexName] of Object.entries(INDICES)) {
            const exists = await client.indices.exists({ index: indexName });

            if (!exists) {
                const mappingKey = key.toLowerCase();
                await client.indices.create({
                    index: indexName,
                    body: {
                        settings: INDEX_SETTINGS,
                        mappings: INDEX_MAPPINGS[mappingKey]
                    }
                });
                console.log(`[Elasticsearch] Created index: ${indexName}`);
            }
        }

        return true;
    } catch (error) {
        console.error('[Elasticsearch] Initialization error:', error);
        return false;
    }
}

/**
 * Health check
 */
async function healthCheck() {
    try {
        const health = await client.cluster.health();
        return {
            status: health.status,
            numberOfNodes: health.number_of_nodes,
            activeShards: health.active_shards
        };
    } catch (error) {
        console.error('[Elasticsearch] Health check failed:', error);
        return null;
    }
}

module.exports = {
    client,
    INDICES,
    INDEX_MAPPINGS,
    initializeIndices,
    healthCheck
};
