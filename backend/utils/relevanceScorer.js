/**
 * Relevance Scorer
 * Issue #910: Advanced Search with Elasticsearch Integration
 * 
 * Custom relevance scoring for personalized search results.
 */

class RelevanceScorer {

    /**
     * Calculate personalized relevance score
     */
    calculateScore(result, user, searchContext = {}) {
        let score = result.score || 0;

        // Boost based on user interactions
        score += this.getUserInteractionBoost(result, user);

        // Boost based on recency
        score += this.getRecencyBoost(result);

        // Boost based on popularity
        score += this.getPopularityBoost(result);

        // Boost based on user preferences
        score += this.getPreferenceBoost(result, user);

        // Boost based on search context
        score += this.getContextBoost(result, searchContext);

        return score;
    }

    /**
     * Boost based on user interactions
     */
    getUserInteractionBoost(result, user) {
        if (!user) return 0;

        let boost = 0;

        // Boost if user follows the author
        if (result.data.userId && user.following?.includes(result.data.userId)) {
            boost += 2.0;
        }

        // Boost if user has interacted with similar content
        if (result.data.tags) {
            const userTags = user.interests || [];
            const commonTags = result.data.tags.filter(tag => userTags.includes(tag));
            boost += commonTags.length * 0.5;
        }

        return boost;
    }

    /**
     * Boost based on recency
     */
    getRecencyBoost(result) {
        if (!result.data.createdAt) return 0;

        const now = new Date();
        const created = new Date(result.data.createdAt);
        const ageInDays = (now - created) / (1000 * 60 * 60 * 24);

        // Exponential decay: newer content gets higher boost
        if (ageInDays < 1) return 3.0;
        if (ageInDays < 7) return 2.0;
        if (ageInDays < 30) return 1.0;
        if (ageInDays < 90) return 0.5;

        return 0;
    }

    /**
     * Boost based on popularity
     */
    getPopularityBoost(result) {
        let boost = 0;

        // Likes boost
        const likes = result.data.likes || 0;
        boost += Math.log10(likes + 1) * 0.5;

        // Comments boost
        const comments = result.data.comments || 0;
        boost += Math.log10(comments + 1) * 0.3;

        // Views boost
        const views = result.data.views || 0;
        boost += Math.log10(views + 1) * 0.2;

        // Shares boost
        const shares = result.data.shares || 0;
        boost += Math.log10(shares + 1) * 0.4;

        return Math.min(boost, 5.0); // Cap at 5.0
    }

    /**
     * Boost based on user preferences
     */
    getPreferenceBoost(result, user) {
        if (!user || !user.preferences) return 0;

        let boost = 0;

        // Category preference
        if (user.preferences.categories && result.data.category) {
            if (user.preferences.categories.includes(result.data.category)) {
                boost += 1.5;
            }
        }

        // Content type preference
        if (user.preferences.contentTypes && result.type) {
            if (user.preferences.contentTypes.includes(result.type)) {
                boost += 1.0;
            }
        }

        return boost;
    }

    /**
     * Boost based on search context
     */
    getContextBoost(result, context) {
        let boost = 0;

        // If searching within a specific category
        if (context.category && result.data.category === context.category) {
            boost += 1.0;
        }

        // If searching for specific author
        if (context.author && result.data.username === context.author) {
            boost += 2.0;
        }

        // If searching with specific tags
        if (context.tags && result.data.tags) {
            const matchingTags = context.tags.filter(tag =>
                result.data.tags.includes(tag)
            );
            boost += matchingTags.length * 0.8;
        }

        return boost;
    }

    /**
     * Rank results based on calculated scores
     */
    rankResults(results, user, searchContext = {}) {
        return results
            .map(result => ({
                ...result,
                personalizedScore: this.calculateScore(result, user, searchContext)
            }))
            .sort((a, b) => b.personalizedScore - a.personalizedScore);
    }

    /**
     * Apply diversity to results (avoid showing too similar content)
     */
    diversifyResults(results, options = {}) {
        const {
            maxSameAuthor = 3,
            maxSameCategory = 5
        } = options;

        const authorCounts = {};
        const categoryCounts = {};
        const diversified = [];

        for (const result of results) {
            const author = result.data.username;
            const category = result.data.category;

            const authorCount = authorCounts[author] || 0;
            const categoryCount = categoryCounts[category] || 0;

            // Skip if too many from same author or category
            if (authorCount >= maxSameAuthor || categoryCount >= maxSameCategory) {
                continue;
            }

            diversified.push(result);
            authorCounts[author] = authorCount + 1;
            categoryCounts[category] = categoryCount + 1;
        }

        return diversified;
    }

    /**
     * Explain score (for debugging/transparency)
     */
    explainScore(result, user, searchContext = {}) {
        return {
            baseScore: result.score || 0,
            userInteractionBoost: this.getUserInteractionBoost(result, user),
            recencyBoost: this.getRecencyBoost(result),
            popularityBoost: this.getPopularityBoost(result),
            preferenceBoost: this.getPreferenceBoost(result, user),
            contextBoost: this.getContextBoost(result, searchContext),
            totalScore: this.calculateScore(result, user, searchContext)
        };
    }
}

module.exports = new RelevanceScorer();
