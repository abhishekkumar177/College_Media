/**
 * Search Query Parser
 * Issue #910: Advanced Search with Elasticsearch Integration
 * 
 * Parses advanced search queries with operators.
 */

class SearchQueryParser {

    /**
     * Parse search query with operators
     * Supports: AND, OR, NOT, quotes for exact match, field:value
     */
    parse(queryString) {
        if (!queryString || !queryString.trim()) {
            return { terms: [], filters: {}, operators: [] };
        }

        const result = {
            terms: [],
            exactPhrases: [],
            excludeTerms: [],
            fieldFilters: {},
            operators: []
        };

        // Extract exact phrases (quoted text)
        const phraseRegex = /"([^"]+)"/g;
        let match;
        while ((match = phraseRegex.exec(queryString)) !== null) {
            result.exactPhrases.push(match[1]);
            queryString = queryString.replace(match[0], '');
        }

        // Extract field:value filters
        const fieldRegex = /(\w+):(\S+)/g;
        while ((match = fieldRegex.exec(queryString)) !== null) {
            const [, field, value] = match;
            result.fieldFilters[field] = value;
            queryString = queryString.replace(match[0], '');
        }

        // Extract NOT terms
        const notRegex = /NOT\s+(\S+)/gi;
        while ((match = notRegex.exec(queryString)) !== null) {
            result.excludeTerms.push(match[1]);
            queryString = queryString.replace(match[0], '');
        }

        // Extract remaining terms
        const terms = queryString
            .split(/\s+/)
            .filter(term => term && !['AND', 'OR', 'NOT'].includes(term.toUpperCase()));

        result.terms = terms;

        return result;
    }

    /**
     * Build Elasticsearch query from parsed query
     */
    buildElasticsearchQuery(parsed) {
        const must = [];
        const should = [];
        const mustNot = [];

        // Add exact phrases
        parsed.exactPhrases.forEach(phrase => {
            must.push({
                match_phrase: {
                    _all: phrase
                }
            });
        });

        // Add regular terms
        if (parsed.terms.length > 0) {
            must.push({
                multi_match: {
                    query: parsed.terms.join(' '),
                    fields: ['caption^3', 'content^2', 'username^2', 'bio'],
                    type: 'best_fields',
                    fuzziness: 'AUTO'
                }
            });
        }

        // Add field filters
        Object.entries(parsed.fieldFilters).forEach(([field, value]) => {
            must.push({
                match: {
                    [field]: value
                }
            });
        });

        // Add exclude terms
        parsed.excludeTerms.forEach(term => {
            mustNot.push({
                match: {
                    _all: term
                }
            });
        });

        return {
            bool: {
                must: must.length > 0 ? must : [{ match_all: {} }],
                should,
                must_not: mustNot
            }
        };
    }

    /**
     * Validate query
     */
    validate(queryString) {
        const errors = [];

        // Check for balanced quotes
        const quoteCount = (queryString.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) {
            errors.push('Unbalanced quotes');
        }

        // Check for valid operators
        const invalidOperators = queryString.match(/\b(AND|OR|NOT)\b(?!\s)/gi);
        if (invalidOperators) {
            errors.push('Invalid operator usage');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Suggest corrections for common mistakes
     */
    suggestCorrections(queryString) {
        const suggestions = [];

        // Check for common typos in operators
        if (/\band\b/i.test(queryString) && !/\bAND\b/.test(queryString)) {
            suggestions.push('Use uppercase AND for boolean operator');
        }

        if (/\bor\b/i.test(queryString) && !/\bOR\b/.test(queryString)) {
            suggestions.push('Use uppercase OR for boolean operator');
        }

        if (/\bnot\b/i.test(queryString) && !/\bNOT\b/.test(queryString)) {
            suggestions.push('Use uppercase NOT for boolean operator');
        }

        return suggestions;
    }
}

module.exports = new SearchQueryParser();
