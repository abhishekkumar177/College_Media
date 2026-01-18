/**
 * SearchQuery Model
 * Issue #910: Advanced Search with Elasticsearch Integration
 * 
 * Stores search queries for analytics and suggestions.
 */

const mongoose = require('mongoose');

const searchQuerySchema = new mongoose.Schema({
    // User who performed the search
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },

    // Search query text
    query: {
        type: String,
        required: true,
        trim: true
    },

    // Search filters applied
    filters: {
        type: {
            type: String,
            enum: ['all', 'posts', 'users', 'comments']
        },
        dateRange: {
            from: Date,
            to: Date
        },
        tags: [String],
        author: String,
        sortBy: String
    },

    // Results metadata
    resultsCount: {
        type: Number,
        default: 0
    },

    // Click-through data
    clickedResults: [{
        resultId: String,
        resultType: String,
        position: Number,
        clickedAt: { type: Date, default: Date.now }
    }],

    // Search session
    sessionId: String,

    // Performance metrics
    executionTime: Number, // in milliseconds

    // User interaction
    saved: {
        type: Boolean,
        default: false
    },

    // Timestamps
    searchedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Indexes for analytics
searchQuerySchema.index({ query: 'text' });
searchQuerySchema.index({ searchedAt: -1 });
searchQuerySchema.index({ userId: 1, searchedAt: -1 });

// Get popular searches
searchQuerySchema.statics.getPopularSearches = async function (limit = 10, timeframe = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    return this.aggregate([
        {
            $match: {
                searchedAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$query',
                count: { $sum: 1 },
                avgResults: { $avg: '$resultsCount' },
                lastSearched: { $max: '$searchedAt' }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: limit
        },
        {
            $project: {
                query: '$_id',
                count: 1,
                avgResults: { $round: ['$avgResults', 0] },
                lastSearched: 1,
                _id: 0
            }
        }
    ]);
};

// Get user's recent searches
searchQuerySchema.statics.getUserRecentSearches = function (userId, limit = 10) {
    return this.find({ userId })
        .sort({ searchedAt: -1 })
        .limit(limit)
        .select('query filters resultsCount searchedAt')
        .lean();
};

// Get search suggestions based on partial query
searchQuerySchema.statics.getSuggestions = async function (partialQuery, limit = 5) {
    return this.aggregate([
        {
            $match: {
                query: new RegExp(`^${partialQuery}`, 'i'),
                resultsCount: { $gt: 0 }
            }
        },
        {
            $group: {
                _id: '$query',
                count: { $sum: 1 },
                avgResults: { $avg: '$resultsCount' }
            }
        },
        {
            $sort: { count: -1, avgResults: -1 }
        },
        {
            $limit: limit
        },
        {
            $project: {
                query: '$_id',
                popularity: '$count',
                _id: 0
            }
        }
    ]);
};

const SearchQuery = mongoose.model('SearchQuery', searchQuerySchema);

module.exports = SearchQuery;
