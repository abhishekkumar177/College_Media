/**
 * Elasticsearch Service
 * Issue #910: Advanced Search with Elasticsearch Integration
 * 
 * Core service for Elasticsearch operations including indexing, searching, and autocomplete.
 */

const { client, INDICES } = require('../config/elasticsearch');
const SearchQuery = require('../models/SearchQuery');

class ElasticsearchService {

    /**
     * Index a document
     */
    async indexDocument(index, id, document) {
        try {
            const response = await client.index({
                index: INDICES[index.toUpperCase()],
                id: id.toString(),
                body: document,
                refresh: 'wait_for'
            });

            return response;
        } catch (error) {
            console.error(`[ES] Index error for ${index}:${id}:`, error);
            throw error;
        }
    }

    /**
     * Update a document
     */
    async updateDocument(index, id, updates) {
        try {
            const response = await client.update({
                index: INDICES[index.toUpperCase()],
                id: id.toString(),
                body: {
                    doc: updates
                },
                refresh: 'wait_for'
            });

            return response;
        } catch (error) {
            console.error(`[ES] Update error for ${index}:${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete a document
     */
    async deleteDocument(index, id) {
        try {
            const response = await client.delete({
                index: INDICES[index.toUpperCase()],
                id: id.toString(),
                refresh: 'wait_for'
            });

            return response;
        } catch (error) {
            console.error(`[ES] Delete error for ${index}:${id}:`, error);
            throw error;
        }
    }

    /**
     * Full-text search with highlighting
     */
    async search(options = {}) {
        const {
            query,
            type = 'all',
            filters = {},
            from = 0,
            size = 20,
            sortBy = 'relevance',
            userId = null
        } = options;

        const startTime = Date.now();

        try {
            // Build search query
            const searchBody = this.buildSearchQuery(query, filters, sortBy);

            // Determine indices to search
            const indices = type === 'all'
                ? Object.values(INDICES)
                : [INDICES[type.toUpperCase()]];

            // Execute search
            const response = await client.search({
                index: indices,
                body: searchBody,
                from,
                size
            });

            const executionTime = Date.now() - startTime;

            // Log search query for analytics
            if (userId) {
                await this.logSearchQuery(userId, query, filters, response.hits.total.value, executionTime);
            }

            // Format results
            return {
                total: response.hits.total.value,
                results: response.hits.hits.map(hit => ({
                    id: hit._id,
                    type: this.getTypeFromIndex(hit._index),
                    score: hit._score,
                    data: hit._source,
                    highlights: hit.highlight || {}
                })),
                aggregations: response.aggregations || {},
                executionTime
            };
        } catch (error) {
            console.error('[ES] Search error:', error);
            throw error;
        }
    }

    /**
     * Build Elasticsearch query
     */
    buildSearchQuery(query, filters, sortBy) {
        const must = [];
        const filter = [];

        // Main search query
        if (query && query.trim()) {
            must.push({
                multi_match: {
                    query,
                    fields: ['caption^3', 'content^2', 'username^2', 'bio', 'tags^2'],
                    type: 'best_fields',
                    fuzziness: 'AUTO',
                    prefix_length: 2
                }
            });
        } else {
            must.push({ match_all: {} });
        }

        // Apply filters
        if (filters.tags && filters.tags.length > 0) {
            filter.push({ terms: { tags: filters.tags } });
        }

        if (filters.author) {
            filter.push({ term: { 'username.keyword': filters.author } });
        }

        if (filters.dateRange) {
            const dateFilter = { range: { createdAt: {} } };
            if (filters.dateRange.from) dateFilter.range.createdAt.gte = filters.dateRange.from;
            if (filters.dateRange.to) dateFilter.range.createdAt.lte = filters.dateRange.to;
            filter.push(dateFilter);
        }

        if (filters.category) {
            filter.push({ term: { category: filters.category } });
        }

        // Build query body
        const body = {
            query: {
                bool: {
                    must,
                    filter
                }
            },
            highlight: {
                fields: {
                    caption: { pre_tags: ['<mark>'], post_tags: ['</mark>'] },
                    content: { pre_tags: ['<mark>'], post_tags: ['</mark>'] },
                    bio: { pre_tags: ['<mark>'], post_tags: ['</mark>'] }
                },
                fragment_size: 150,
                number_of_fragments: 3
            },
            aggs: {
                types: {
                    terms: { field: '_index' }
                },
                tags: {
                    terms: { field: 'tags', size: 20 }
                },
                dateHistogram: {
                    date_histogram: {
                        field: 'createdAt',
                        calendar_interval: 'day'
                    }
                }
            }
        };

        // Apply sorting
        body.sort = this.buildSortQuery(sortBy);

        return body;
    }

    /**
     * Build sort query
     */
    buildSortQuery(sortBy) {
        switch (sortBy) {
            case 'newest':
                return [{ createdAt: 'desc' }];
            case 'oldest':
                return [{ createdAt: 'asc' }];
            case 'popular':
                return [{ likes: 'desc' }, { views: 'desc' }];
            case 'relevance':
            default:
                return ['_score', { createdAt: 'desc' }];
        }
    }

    /**
     * Autocomplete suggestions
     */
    async autocomplete(prefix, type = 'all', limit = 10) {
        try {
            const indices = type === 'all'
                ? Object.values(INDICES)
                : [INDICES[type.toUpperCase()]];

            const response = await client.search({
                index: indices,
                body: {
                    suggest: {
                        suggestions: {
                            prefix,
                            completion: {
                                field: 'caption.autocomplete',
                                size: limit,
                                skip_duplicates: true,
                                fuzzy: {
                                    fuzziness: 'AUTO'
                                }
                            }
                        }
                    }
                }
            });

            // Also get query-based suggestions from search history
            const historySuggestions = await SearchQuery.getSuggestions(prefix, 5);

            return {
                elasticsearch: response.suggest.suggestions[0].options.map(opt => ({
                    text: opt.text,
                    score: opt._score
                })),
                history: historySuggestions
            };
        } catch (error) {
            console.error('[ES] Autocomplete error:', error);
            return { elasticsearch: [], history: [] };
        }
    }

    /**
     * Search within results
     */
    async searchWithinResults(previousResults, newQuery) {
        try {
            const resultIds = previousResults.map(r => r.id);

            const response = await client.search({
                index: Object.values(INDICES),
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    multi_match: {
                                        query: newQuery,
                                        fields: ['caption', 'content', 'username', 'bio'],
                                        fuzziness: 'AUTO'
                                    }
                                },
                                {
                                    ids: {
                                        values: resultIds
                                    }
                                }
                            ]
                        }
                    }
                }
            });

            return response.hits.hits.map(hit => ({
                id: hit._id,
                type: this.getTypeFromIndex(hit._index),
                score: hit._score,
                data: hit._source
            }));
        } catch (error) {
            console.error('[ES] Search within results error:', error);
            throw error;
        }
    }

    /**
     * Log search query for analytics
     */
    async logSearchQuery(userId, query, filters, resultsCount, executionTime) {
        try {
            await SearchQuery.create({
                userId,
                query,
                filters,
                resultsCount,
                executionTime,
                sessionId: `session_${Date.now()}`
            });
        } catch (error) {
            console.error('[ES] Log search query error:', error);
        }
    }

    /**
     * Get type from index name
     */
    getTypeFromIndex(indexName) {
        for (const [key, value] of Object.entries(INDICES)) {
            if (value === indexName) {
                return key.toLowerCase();
            }
        }
        return 'unknown';
    }

    /**
     * Bulk index documents
     */
    async bulkIndex(index, documents) {
        try {
            const body = documents.flatMap(doc => [
                { index: { _index: INDICES[index.toUpperCase()], _id: doc._id.toString() } },
                doc
            ]);

            const response = await client.bulk({ body, refresh: true });

            if (response.errors) {
                console.error('[ES] Bulk index had errors');
            }

            return response;
        } catch (error) {
            console.error('[ES] Bulk index error:', error);
            throw error;
        }
    }

    /**
     * Count documents
     */
    async count(index, query = {}) {
        try {
            const response = await client.count({
                index: INDICES[index.toUpperCase()],
                body: { query }
            });

            return response.count;
        } catch (error) {
            console.error('[ES] Count error:', error);
            return 0;
        }
    }
}

module.exports = new ElasticsearchService();
