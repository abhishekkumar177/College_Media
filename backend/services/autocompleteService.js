/**
 * Autocomplete Service
 * Issue #910: Advanced Search with Elasticsearch Integration
 * 
 * Provides intelligent autocomplete suggestions.
 */

const elasticsearchService = require('./elasticsearchService');
const SearchQuery = require('../models/SearchQuery');

class AutocompleteService {

    /**
     * Get autocomplete suggestions
     */
    async getSuggestions(prefix, options = {}) {
        const {
            type = 'all',
            limit = 10,
            userId = null
        } = options;

        if (!prefix || prefix.length < 2) {
            return {
                suggestions: [],
                categories: []
            };
        }

        try {
            // Get Elasticsearch suggestions
            const esSuggestions = await elasticsearchService.autocomplete(prefix, type, limit);

            // Get user's search history suggestions
            const historySuggestions = userId
                ? await this.getUserHistorySuggestions(userId, prefix, 5)
                : [];

            // Get popular search suggestions
            const popularSuggestions = await SearchQuery.getSuggestions(prefix, 5);

            // Combine and deduplicate
            const allSuggestions = [
                ...historySuggestions.map(s => ({ ...s, source: 'history' })),
                ...popularSuggestions.map(s => ({ ...s, source: 'popular' })),
                ...esSuggestions.elasticsearch.map(s => ({ ...s, source: 'content' }))
            ];

            // Remove duplicates and limit
            const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions);
            const limitedSuggestions = uniqueSuggestions.slice(0, limit);

            // Categorize suggestions
            const categorized = this.categorizeSuggestions(limitedSuggestions);

            return {
                suggestions: limitedSuggestions,
                categories: categorized
            };
        } catch (error) {
            console.error('[Autocomplete] Error:', error);
            return {
                suggestions: [],
                categories: []
            };
        }
    }

    /**
     * Get user's search history suggestions
     */
    async getUserHistorySuggestions(userId, prefix, limit) {
        try {
            const recentSearches = await SearchQuery.find({
                userId,
                query: new RegExp(`^${prefix}`, 'i')
            })
                .sort({ searchedAt: -1 })
                .limit(limit)
                .select('query resultsCount')
                .lean();

            return recentSearches.map(s => ({
                text: s.query,
                score: 1,
                resultsCount: s.resultsCount
            }));
        } catch (error) {
            console.error('[Autocomplete] History error:', error);
            return [];
        }
    }

    /**
     * Deduplicate suggestions
     */
    deduplicateSuggestions(suggestions) {
        const seen = new Set();
        return suggestions.filter(s => {
            const key = s.text?.toLowerCase() || s.query?.toLowerCase();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * Categorize suggestions
     */
    categorizeSuggestions(suggestions) {
        const categories = {
            history: [],
            popular: [],
            content: []
        };

        suggestions.forEach(s => {
            if (s.source && categories[s.source]) {
                categories[s.source].push(s);
            }
        });

        return Object.entries(categories)
            .filter(([_, items]) => items.length > 0)
            .map(([name, items]) => ({
                name,
                label: this.getCategoryLabel(name),
                items
            }));
    }

    /**
     * Get category label
     */
    getCategoryLabel(category) {
        const labels = {
            history: 'Recent Searches',
            popular: 'Popular Searches',
            content: 'Suggestions'
        };
        return labels[category] || category;
    }

    /**
     * Get trending searches
     */
    async getTrendingSearches(limit = 10, timeframe = 7) {
        try {
            return await SearchQuery.getPopularSearches(limit, timeframe);
        } catch (error) {
            console.error('[Autocomplete] Trending error:', error);
            return [];
        }
    }

    /**
     * Get search suggestions for specific types
     */
    async getTypedSuggestions(prefix, type) {
        try {
            const suggestions = await elasticsearchService.autocomplete(prefix, type, 10);
            return suggestions.elasticsearch;
        } catch (error) {
            console.error('[Autocomplete] Typed suggestions error:', error);
            return [];
        }
    }
}

module.exports = new AutocompleteService();
