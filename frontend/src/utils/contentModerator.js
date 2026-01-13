import { MODERATION_RULES } from '../data/moderationRules';

const checkProfanity = (text) => {
    if (!text) return false;
    return MODERATION_RULES.profanity.patterns.some(pattern => pattern.test(text));
};

const checkSpam = (text) => {
    if (!text) return false;

    // Check for repeated characters
    const hasRepeatedChars = MODERATION_RULES.spam.patterns[0].test(text);

    // Check for repeated words
    const hasRepeatedWords = MODERATION_RULES.spam.patterns[1].test(text);

    // Check for excessive CAPS
    let hasExcessiveCaps = false;
    if (text.length > MODERATION_RULES.spam.minContentLengthForCapsCheck) {
        const capsCount = (text.match(/[A-Z]/g) || []).length;
        const ratio = capsCount / text.length;
        hasExcessiveCaps = ratio > MODERATION_RULES.spam.maxCapsRatio;
    }

    return hasRepeatedChars || hasRepeatedWords || hasExcessiveCaps;
};

const calculateToxicity = (text) => {
    if (!text) return 0;

    const lowerText = text.toLowerCase();
    let score = 0;

    MODERATION_RULES.toxicity.keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
            score += 1;
        }
    });

    return score;
};

const getSuggestions = (text) => {
    const suggestions = [];

    if (checkProfanity(text)) {
        suggestions.push(MODERATION_RULES.profanity.errorMessage);
    }

    if (checkSpam(text)) {
        suggestions.push(MODERATION_RULES.spam.errorMessage);
    }

    if (calculateToxicity(text) >= MODERATION_RULES.toxicity.threshold) {
        suggestions.push(MODERATION_RULES.toxicity.errorMessage);
    }

    return suggestions;
};

export const analyzeContent = (text) => {
    const hasProfanity = checkProfanity(text);
    const isSpam = checkSpam(text);
    const toxicityScore = calculateToxicity(text);
    const suggestions = getSuggestions(text);

    return {
        hasProfanity,
        isSpam,
        toxicityScore,
        suggestions,
        isFlagged: hasProfanity || isSpam || (toxicityScore >= MODERATION_RULES.toxicity.threshold)
    };
};
