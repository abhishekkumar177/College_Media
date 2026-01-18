/**
 * Content-Based Filtering Service
 * Issue #921: AI-Powered Content Recommendation Engine
 * 
 * Implements content-based filtering using TF-IDF and cosine similarity.
 */

const UserInteraction = require('../models/UserInteraction');
const similarityCalculator = require('../utils/similarityCalculator');

class ContentBasedFilteringService {

    constructor() {
        this.documentVectors = new Map();
        this.idfCache = new Map();
    }

    /**
     * Get recommendations based on content similarity
     */
    async getRecommendations(userId, likedPosts, candidatePosts, limit = 20) {
        try {
            if (likedPosts.length === 0 || candidatePosts.length === 0) {
                return [];
            }

            // Build user profile from liked posts
            const userProfile = this.buildUserProfile(likedPosts);

            // Score each candidate post
            const scoredPosts = candidatePosts.map(post => {
                const postVector = this.extractFeatures(post);
                const similarity = similarityCalculator.cosineSimilarity(userProfile, postVector);

                return {
                    itemId: post._id,
                    score: similarity,
                    reason: 'similar_to_liked_content',
                    features: this.getTopFeatures(postVector, userProfile)
                };
            });

            // Sort by similarity and return top items
            scoredPosts.sort((a, b) => b.score - a.score);

            return scoredPosts.slice(0, limit);
        } catch (error) {
            console.error('[ContentBasedFiltering] Recommendation error:', error);
            return [];
        }
    }

    /**
     * Build user profile from liked posts
     */
    buildUserProfile(posts) {
        const profile = {};

        for (const post of posts) {
            const features = this.extractFeatures(post);

            for (const [feature, weight] of Object.entries(features)) {
                profile[feature] = (profile[feature] || 0) + weight;
            }
        }

        // Normalize
        const magnitude = Math.sqrt(
            Object.values(profile).reduce((sum, val) => sum + val * val, 0)
        );

        if (magnitude > 0) {
            for (const feature in profile) {
                profile[feature] /= magnitude;
            }
        }

        return profile;
    }

    /**
     * Extract features from post content
     */
    extractFeatures(post) {
        const features = {};

        // Text features from caption
        if (post.caption) {
            const words = this.tokenize(post.caption);
            const tf = this.calculateTF(words);

            for (const [word, freq] of Object.entries(tf)) {
                const idf = this.getIDF(word);
                features[`word:${word}`] = freq * idf;
            }
        }

        // Hashtag features
        if (post.hashtags && post.hashtags.length > 0) {
            for (const hashtag of post.hashtags) {
                features[`hashtag:${hashtag.toLowerCase()}`] = 2.0; // Higher weight for hashtags
            }
        }

        // Category/topic features
        if (post.category) {
            features[`category:${post.category}`] = 3.0;
        }

        // Author features
        if (post.author) {
            features[`author:${post.author}`] = 0.5;
        }

        // Media type features
        if (post.mediaType) {
            features[`mediaType:${post.mediaType}`] = 1.0;
        }

        return features;
    }

    /**
     * Tokenize text
     */
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2)
            .filter(word => !this.isStopWord(word));
    }

    /**
     * Calculate term frequency
     */
    calculateTF(words) {
        const tf = {};

        for (const word of words) {
            tf[word] = (tf[word] || 0) + 1;
        }

        // Normalize by document length
        const maxFreq = Math.max(...Object.values(tf));

        for (const word in tf) {
            tf[word] = 0.5 + (0.5 * tf[word] / maxFreq);
        }

        return tf;
    }

    /**
     * Get IDF for a word (cached)
     */
    getIDF(word) {
        if (this.idfCache.has(word)) {
            return this.idfCache.get(word);
        }

        // Default IDF if not computed
        return 1.0;
    }

    /**
     * Update IDF cache from document collection
     */
    async updateIDF(documents) {
        const documentCount = documents.length;
        const wordDocCounts = {};

        for (const doc of documents) {
            const words = new Set(this.tokenize(doc.caption || ''));

            for (const word of words) {
                wordDocCounts[word] = (wordDocCounts[word] || 0) + 1;
            }
        }

        for (const [word, count] of Object.entries(wordDocCounts)) {
            const idf = Math.log(documentCount / (1 + count)) + 1;
            this.idfCache.set(word, idf);
        }
    }

    /**
     * Check if word is a stop word
     */
    isStopWord(word) {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this',
            'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
            'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each'
        ]);

        return stopWords.has(word);
    }

    /**
     * Get top features explaining the match
     */
    getTopFeatures(postVector, userProfile, limit = 3) {
        const commonFeatures = [];

        for (const feature in postVector) {
            if (userProfile[feature]) {
                commonFeatures.push({
                    feature,
                    contribution: postVector[feature] * userProfile[feature]
                });
            }
        }

        commonFeatures.sort((a, b) => b.contribution - a.contribution);

        return commonFeatures.slice(0, limit).map(f => f.feature);
    }

    /**
     * Find similar posts to a given post
     */
    async findSimilarPosts(postId, allPosts, limit = 10) {
        const targetPost = allPosts.find(p => p._id.toString() === postId.toString());

        if (!targetPost) return [];

        const targetVector = this.extractFeatures(targetPost);

        const similarities = allPosts
            .filter(p => p._id.toString() !== postId.toString())
            .map(post => {
                const postVector = this.extractFeatures(post);
                const similarity = similarityCalculator.cosineSimilarity(targetVector, postVector);

                return {
                    itemId: post._id,
                    score: similarity,
                    reason: 'similar_content'
                };
            })
            .filter(p => p.score > 0.1)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return similarities;
    }

    /**
     * Get topic recommendations
     */
    async getTopicRecommendations(userId, userPosts, allTopics, limit = 5) {
        // Build user interest profile from posts
        const topicScores = {};

        for (const post of userPosts) {
            if (post.category) {
                topicScores[post.category] = (topicScores[post.category] || 0) + 1;
            }

            if (post.hashtags) {
                for (const tag of post.hashtags) {
                    topicScores[tag] = (topicScores[tag] || 0) + 0.5;
                }
            }
        }

        // Find related topics user hasn't explored
        const recommendations = allTopics
            .filter(topic => !topicScores[topic.name])
            .map(topic => ({
                itemId: topic._id,
                score: this.calculateTopicAffinity(topic, topicScores),
                reason: 'related_to_interests'
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return recommendations;
    }

    /**
     * Calculate topic affinity
     */
    calculateTopicAffinity(topic, userInterests) {
        let affinity = 0;

        if (topic.relatedTopics) {
            for (const related of topic.relatedTopics) {
                if (userInterests[related]) {
                    affinity += userInterests[related];
                }
            }
        }

        return affinity;
    }
}

module.exports = new ContentBasedFilteringService();
