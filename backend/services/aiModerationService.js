/**
 * AI Moderation Service
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * Provides AI-powered content analysis using local patterns and external APIs.
 */

const ContentFilter = require('../models/ContentFilter');

class AIModerationService {
    constructor() {
        // Predefined patterns for basic detection (fallback when API unavailable)
        this.profanityPatterns = [
            /\b(fuck|shit|ass|bitch|damn|crap|hell)\b/gi,
            /\b(f+u+c+k+|s+h+i+t+)\b/gi
        ];

        this.spamPatterns = [
            /(.)\1{4,}/g, // Repeated characters
            /\b(buy now|click here|free money|limited offer|act now)\b/gi,
            /(https?:\/\/[^\s]+){3,}/g, // Multiple URLs
            /[A-Z]{10,}/g // Excessive caps
        ];

        this.hateSpeechPatterns = [
            /\b(hate|kill|die|threat)\b.*\b(all|every|group)\b/gi
        ];

        // Cache for compiled regex from database filters
        this.filterCache = null;
        this.cacheExpiry = null;
    }

    /**
     * Analyze content for moderation
     * @param {Object} content - { text, imageUrls, videoUrls }
     * @returns {Object} Analysis results
     */
    async analyzeContent(content) {
        const { text = '', imageUrls = [], videoUrls = [] } = content;

        const results = {
            profanityScore: 0,
            spamScore: 0,
            hateSpeechScore: 0,
            toxicityScore: 0,
            nsfwScore: 0,
            overallConfidence: 0,
            detectedCategories: [],
            flaggedPhrases: [],
            analyzedAt: new Date()
        };

        if (!text && imageUrls.length === 0 && videoUrls.length === 0) {
            return results;
        }

        // Analyze text content
        if (text) {
            const textAnalysis = await this.analyzeText(text);
            Object.assign(results, textAnalysis);
        }

        // Calculate overall confidence
        results.overallConfidence = Math.max(
            results.profanityScore,
            results.spamScore,
            results.hateSpeechScore,
            results.toxicityScore,
            results.nsfwScore
        );

        // Determine detected categories
        if (results.profanityScore > 0.5) results.detectedCategories.push('profanity');
        if (results.spamScore > 0.5) results.detectedCategories.push('spam');
        if (results.hateSpeechScore > 0.5) results.detectedCategories.push('hate_speech');
        if (results.toxicityScore > 0.5) results.detectedCategories.push('toxic');
        if (results.nsfwScore > 0.5) results.detectedCategories.push('nsfw');

        return results;
    }

    /**
     * Analyze text content
     */
    async analyzeText(text) {
        const result = {
            profanityScore: 0,
            spamScore: 0,
            hateSpeechScore: 0,
            toxicityScore: 0,
            flaggedPhrases: []
        };

        // Load custom filters from database
        const customFilters = await this.getCustomFilters();

        // Check profanity
        const profanityMatches = this.findMatches(text, this.profanityPatterns);
        if (profanityMatches.length > 0) {
            result.profanityScore = Math.min(0.3 + (profanityMatches.length * 0.15), 1);
            result.flaggedPhrases.push(...profanityMatches);
        }

        // Check spam patterns
        const spamMatches = this.findMatches(text, this.spamPatterns);
        if (spamMatches.length > 0) {
            result.spamScore = Math.min(0.2 + (spamMatches.length * 0.2), 1);
        }

        // Check hate speech
        const hateSpeechMatches = this.findMatches(text, this.hateSpeechPatterns);
        if (hateSpeechMatches.length > 0) {
            result.hateSpeechScore = Math.min(0.5 + (hateSpeechMatches.length * 0.25), 1);
            result.flaggedPhrases.push(...hateSpeechMatches);
        }

        // Check custom filters
        for (const filter of customFilters) {
            try {
                const regex = new RegExp(filter.pattern, filter.regexFlags || 'gi');
                const matches = text.match(regex);
                if (matches) {
                    result.flaggedPhrases.push(...matches);

                    // Adjust scores based on filter category
                    switch (filter.category) {
                        case 'profanity':
                            result.profanityScore = Math.max(result.profanityScore, this.getSeverityScore(filter.severity));
                            break;
                        case 'hate_speech':
                            result.hateSpeechScore = Math.max(result.hateSpeechScore, this.getSeverityScore(filter.severity));
                            break;
                        case 'spam':
                            result.spamScore = Math.max(result.spamScore, this.getSeverityScore(filter.severity));
                            break;
                        default:
                            result.toxicityScore = Math.max(result.toxicityScore, this.getSeverityScore(filter.severity));
                    }
                }
            } catch (error) {
                console.error('Filter regex error:', filter.name, error);
            }
        }

        return result;
    }

    /**
     * Find matches for patterns
     */
    findMatches(text, patterns) {
        const matches = [];
        for (const pattern of patterns) {
            const found = text.match(pattern);
            if (found) {
                matches.push(...found);
            }
        }
        return [...new Set(matches)]; // Remove duplicates
    }

    /**
     * Get severity score
     */
    getSeverityScore(severity) {
        switch (severity) {
            case 'critical': return 0.95;
            case 'high': return 0.8;
            case 'medium': return 0.6;
            case 'low': return 0.4;
            default: return 0.5;
        }
    }

    /**
     * Get custom filters from database (cached)
     */
    async getCustomFilters() {
        const now = Date.now();

        // Cache for 5 minutes
        if (this.filterCache && this.cacheExpiry && now < this.cacheExpiry) {
            return this.filterCache;
        }

        try {
            this.filterCache = await ContentFilter.getActiveFilters();
            this.cacheExpiry = now + (5 * 60 * 1000); // 5 minutes
            return this.filterCache;
        } catch (error) {
            console.error('Error loading filters:', error);
            return [];
        }
    }

    /**
     * Determine recommended action based on analysis
     */
    getRecommendedAction(analysis) {
        const { overallConfidence, detectedCategories } = analysis;

        // Critical categories always require review
        if (detectedCategories.includes('hate_speech')) {
            return { action: 'remove', priority: 1, requiresReview: true };
        }

        // High confidence automatic actions
        if (overallConfidence >= 0.9) {
            return { action: 'hide', priority: 1, requiresReview: true };
        }

        if (overallConfidence >= 0.7) {
            return { action: 'flag', priority: 2, requiresReview: true };
        }

        if (overallConfidence >= 0.5) {
            return { action: 'flag', priority: 3, requiresReview: true };
        }

        // Low confidence - approve automatically
        if (overallConfidence < 0.3) {
            return { action: 'approve', priority: 10, requiresReview: false };
        }

        return { action: 'flag', priority: 5, requiresReview: true };
    }

    /**
     * Clear filter cache
     */
    clearCache() {
        this.filterCache = null;
        this.cacheExpiry = null;
    }
}

module.exports = new AIModerationService();
