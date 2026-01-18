/**
 * Search Analytics Service
 * Issue #910: Advanced Search with Elasticsearch Integration
 * 
 * Tracks and analyzes search behavior and performance.
 */

const SearchQuery = require('../models/SearchQuery');

class SearchAnalyticsService {

    /**
     * Get search analytics for a time period
     */
    async getAnalytics(startDate, endDate) {
        try {
            const query = {};
            if (startDate || endDate) {
                query.searchedAt = {};
                if (startDate) query.searchedAt.$gte = new Date(startDate);
                if (endDate) query.searchedAt.$lte = new Date(endDate);
            }

            const [
                totalSearches,
                uniqueQueries,
                avgExecutionTime,
                avgResultsCount,
                topSearches,
                zeroResultSearches,
                searchesByType
            ] = await Promise.all([
                SearchQuery.countDocuments(query),
                SearchQuery.distinct('query', query).then(q => q.length),
                SearchQuery.aggregate([
                    { $match: query },
                    { $group: { _id: null, avg: { $avg: '$executionTime' } } }
                ]).then(r => r[0]?.avg || 0),
                SearchQuery.aggregate([
                    { $match: query },
                    { $group: { _id: null, avg: { $avg: '$resultsCount' } } }
                ]).then(r => r[0]?.avg || 0),
                this.getTopSearches(query, 10),
                SearchQuery.countDocuments({ ...query, resultsCount: 0 }),
                this.getSearchesByType(query)
            ]);

            return {
                totalSearches,
                uniqueQueries,
                avgExecutionTime: Math.round(avgExecutionTime),
                avgResultsCount: Math.round(avgResultsCount),
                topSearches,
                zeroResultSearches,
                zeroResultRate: totalSearches > 0 ? (zeroResultSearches / totalSearches * 100).toFixed(2) : 0,
                searchesByType
            };
        } catch (error) {
            console.error('[Analytics] Error:', error);
            throw error;
        }
    }

    /**
     * Get top searches
     */
    async getTopSearches(query, limit = 10) {
        try {
            return await SearchQuery.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$query',
                        count: { $sum: 1 },
                        avgResults: { $avg: '$resultsCount' },
                        avgExecutionTime: { $avg: '$executionTime' }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: limit },
                {
                    $project: {
                        query: '$_id',
                        count: 1,
                        avgResults: { $round: ['$avgResults', 0] },
                        avgExecutionTime: { $round: ['$avgExecutionTime', 0] },
                        _id: 0
                    }
                }
            ]);
        } catch (error) {
            console.error('[Analytics] Top searches error:', error);
            return [];
        }
    }

    /**
     * Get searches by type
     */
    async getSearchesByType(query) {
        try {
            return await SearchQuery.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$filters.type',
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        type: { $ifNull: ['$_id', 'all'] },
                        count: 1,
                        _id: 0
                    }
                }
            ]);
        } catch (error) {
            console.error('[Analytics] Searches by type error:', error);
            return [];
        }
    }

    /**
     * Get click-through rate
     */
    async getClickThroughRate(startDate, endDate) {
        try {
            const query = {};
            if (startDate || endDate) {
                query.searchedAt = {};
                if (startDate) query.searchedAt.$gte = new Date(startDate);
                if (endDate) query.searchedAt.$lte = new Date(endDate);
            }

            const [totalSearches, searchesWithClicks] = await Promise.all([
                SearchQuery.countDocuments(query),
                SearchQuery.countDocuments({
                    ...query,
                    'clickedResults.0': { $exists: true }
                })
            ]);

            return {
                totalSearches,
                searchesWithClicks,
                ctr: totalSearches > 0 ? (searchesWithClicks / totalSearches * 100).toFixed(2) : 0
            };
        } catch (error) {
            console.error('[Analytics] CTR error:', error);
            return { totalSearches: 0, searchesWithClicks: 0, ctr: 0 };
        }
    }

    /**
     * Get search trends over time
     */
    async getSearchTrends(days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            return await SearchQuery.aggregate([
                {
                    $match: {
                        searchedAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$searchedAt' }
                        },
                        count: { $sum: 1 },
                        avgResults: { $avg: '$resultsCount' },
                        avgExecutionTime: { $avg: '$executionTime' }
                    }
                },
                { $sort: { _id: 1 } },
                {
                    $project: {
                        date: '$_id',
                        count: 1,
                        avgResults: { $round: ['$avgResults', 0] },
                        avgExecutionTime: { $round: ['$avgExecutionTime', 0] },
                        _id: 0
                    }
                }
            ]);
        } catch (error) {
            console.error('[Analytics] Trends error:', error);
            return [];
        }
    }

    /**
     * Track result click
     */
    async trackResultClick(searchQueryId, resultId, resultType, position) {
        try {
            await SearchQuery.findByIdAndUpdate(searchQueryId, {
                $push: {
                    clickedResults: {
                        resultId,
                        resultType,
                        position,
                        clickedAt: new Date()
                    }
                }
            });
        } catch (error) {
            console.error('[Analytics] Track click error:', error);
        }
    }

    /**
     * Get user search behavior
     */
    async getUserSearchBehavior(userId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const [
                totalSearches,
                uniqueQueries,
                avgResultsClicked,
                topQueries
            ] = await Promise.all([
                SearchQuery.countDocuments({
                    userId,
                    searchedAt: { $gte: startDate }
                }),
                SearchQuery.distinct('query', {
                    userId,
                    searchedAt: { $gte: startDate }
                }).then(q => q.length),
                SearchQuery.aggregate([
                    {
                        $match: {
                            userId,
                            searchedAt: { $gte: startDate }
                        }
                    },
                    {
                        $project: {
                            clickCount: { $size: { $ifNull: ['$clickedResults', []] } }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            avg: { $avg: '$clickCount' }
                        }
                    }
                ]).then(r => r[0]?.avg || 0),
                SearchQuery.aggregate([
                    {
                        $match: {
                            userId,
                            searchedAt: { $gte: startDate }
                        }
                    },
                    {
                        $group: {
                            _id: '$query',
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { count: -1 } },
                    { $limit: 5 },
                    {
                        $project: {
                            query: '$_id',
                            count: 1,
                            _id: 0
                        }
                    }
                ])
            ]);

            return {
                totalSearches,
                uniqueQueries,
                avgResultsClicked: Math.round(avgResultsClicked * 10) / 10,
                topQueries
            };
        } catch (error) {
            console.error('[Analytics] User behavior error:', error);
            return null;
        }
    }
}

module.exports = new SearchAnalyticsService();
