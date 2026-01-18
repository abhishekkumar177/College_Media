/**
 * Similarity Calculator Utility
 * Issue #921: AI-Powered Content Recommendation Engine
 * 
 * Math utilities for similarity calculations.
 */

const similarityCalculator = {

    /**
     * Jaccard similarity for sets
     */
    jaccardSimilarity(set1, set2) {
        if (set1.size === 0 && set2.size === 0) return 0;

        let intersection = 0;
        for (const item of set1) {
            if (set2.has(item)) intersection++;
        }

        const union = set1.size + set2.size - intersection;

        return union === 0 ? 0 : intersection / union;
    },

    /**
     * Cosine similarity for vectors (object representation)
     */
    cosineSimilarity(vec1, vec2) {
        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;

        // Get all keys
        const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);

        for (const key of allKeys) {
            const v1 = vec1[key] || 0;
            const v2 = vec2[key] || 0;

            dotProduct += v1 * v2;
            magnitude1 += v1 * v1;
            magnitude2 += v2 * v2;
        }

        magnitude1 = Math.sqrt(magnitude1);
        magnitude2 = Math.sqrt(magnitude2);

        if (magnitude1 === 0 || magnitude2 === 0) return 0;

        return dotProduct / (magnitude1 * magnitude2);
    },

    /**
     * Euclidean distance
     */
    euclideanDistance(vec1, vec2) {
        const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
        let sumSquares = 0;

        for (const key of allKeys) {
            const v1 = vec1[key] || 0;
            const v2 = vec2[key] || 0;
            sumSquares += Math.pow(v1 - v2, 2);
        }

        return Math.sqrt(sumSquares);
    },

    /**
     * Pearson correlation coefficient
     */
    pearsonCorrelation(arr1, arr2) {
        if (arr1.length !== arr2.length || arr1.length === 0) return 0;

        const n = arr1.length;
        const sum1 = arr1.reduce((a, b) => a + b, 0);
        const sum2 = arr2.reduce((a, b) => a + b, 0);
        const sum1Sq = arr1.reduce((a, b) => a + b * b, 0);
        const sum2Sq = arr2.reduce((a, b) => a + b * b, 0);
        const sumProd = arr1.reduce((a, b, i) => a + b * arr2[i], 0);

        const numerator = sumProd - (sum1 * sum2 / n);
        const denominator = Math.sqrt(
            (sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n)
        );

        return denominator === 0 ? 0 : numerator / denominator;
    },

    /**
     * Manhattan distance
     */
    manhattanDistance(vec1, vec2) {
        const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
        let distance = 0;

        for (const key of allKeys) {
            const v1 = vec1[key] || 0;
            const v2 = vec2[key] || 0;
            distance += Math.abs(v1 - v2);
        }

        return distance;
    },

    /**
     * Dice coefficient
     */
    diceCoefficient(set1, set2) {
        if (set1.size === 0 && set2.size === 0) return 0;

        let intersection = 0;
        for (const item of set1) {
            if (set2.has(item)) intersection++;
        }

        return (2 * intersection) / (set1.size + set2.size);
    },

    /**
     * Normalize vector
     */
    normalizeVector(vec) {
        const magnitude = Math.sqrt(
            Object.values(vec).reduce((sum, val) => sum + val * val, 0)
        );

        if (magnitude === 0) return vec;

        const normalized = {};
        for (const key in vec) {
            normalized[key] = vec[key] / magnitude;
        }

        return normalized;
    },

    /**
     * Soft cosine similarity (with word embeddings)
     */
    softCosineSimilarity(vec1, vec2, similarityMatrix) {
        let numerator = 0;
        let denom1 = 0;
        let denom2 = 0;

        const keys1 = Object.keys(vec1);
        const keys2 = Object.keys(vec2);

        for (const k1 of keys1) {
            for (const k2 of keys2) {
                const sim = similarityMatrix?.[k1]?.[k2] || (k1 === k2 ? 1 : 0);
                numerator += vec1[k1] * vec2[k2] * sim;
            }
        }

        for (const k1 of keys1) {
            for (const k2 of keys1) {
                const sim = similarityMatrix?.[k1]?.[k2] || (k1 === k2 ? 1 : 0);
                denom1 += vec1[k1] * vec1[k2] * sim;
            }
        }

        for (const k1 of keys2) {
            for (const k2 of keys2) {
                const sim = similarityMatrix?.[k1]?.[k2] || (k1 === k2 ? 1 : 0);
                denom2 += vec2[k1] * vec2[k2] * sim;
            }
        }

        denom1 = Math.sqrt(denom1);
        denom2 = Math.sqrt(denom2);

        return (denom1 * denom2) === 0 ? 0 : numerator / (denom1 * denom2);
    },

    /**
     * Calculate overlap coefficient
     */
    overlapCoefficient(set1, set2) {
        if (set1.size === 0 || set2.size === 0) return 0;

        let intersection = 0;
        for (const item of set1) {
            if (set2.has(item)) intersection++;
        }

        return intersection / Math.min(set1.size, set2.size);
    },

    /**
     * Calculate weighted Jaccard similarity
     */
    weightedJaccard(vec1, vec2) {
        const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
        let minSum = 0;
        let maxSum = 0;

        for (const key of allKeys) {
            const v1 = vec1[key] || 0;
            const v2 = vec2[key] || 0;
            minSum += Math.min(v1, v2);
            maxSum += Math.max(v1, v2);
        }

        return maxSum === 0 ? 0 : minSum / maxSum;
    }
};

module.exports = similarityCalculator;
