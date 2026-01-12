export const MODERATION_RULES = {
    profanity: {
        // Basic list of common offensive words/patterns
        // Note: This is a client-side check and not exhaustive
        patterns: [
            /\b(badword1|badword2|damn|hell)\b/gi, // placeholders for demonstration; in real app using a library or extensive list is better
            /\b(fuck|shit|bitch|asshole|cunt|dick)\b/gi,
            /\b(idiot|stupid|moron)\b/gi,
        ],
        errorMessage: "Your content contains inappropriate language.",
    },
    spam: {
        patterns: [
            /(.)\1{4,}/g, // 5 or more repeated characters (e.g., "helllllllo")
            /\b(\w+)\s+\1{2,}\b/gi, // 3 or more repeated words
            /http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/g, // Basic URL detection for potential spam checking
        ],
        maxCapsRatio: 0.7, // 70% uppercase allowed
        minContentLengthForCapsCheck: 10,
        errorMessage: "Your content resembles spam.",
    },
    toxicity: {
        keywords: [
            "hate", "kill", "die", "attack", "stupid", "idiot", "ugly"
        ],
        threshold: 3, // If 3 or more negative keywords are found
        errorMessage: "Your content may be considered toxic.",
    }
};

export const SENSITIVITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};
