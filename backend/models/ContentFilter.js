/**
 * ContentFilter Model
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * Stores custom content filter rules with regex support.
 */

const mongoose = require('mongoose');

const contentFilterSchema = new mongoose.Schema({
    // Filter name
    name: {
        type: String,
        required: true,
        unique: true
    },

    // Description
    description: String,

    // Filter type
    filterType: {
        type: String,
        required: true,
        enum: ['word', 'phrase', 'regex', 'pattern']
    },

    // The actual filter pattern
    pattern: {
        type: String,
        required: true
    },

    // Regex flags (if filterType is regex)
    regexFlags: {
        type: String,
        default: 'gi'
    },

    // Category
    category: {
        type: String,
        required: true,
        enum: ['profanity', 'hate_speech', 'spam', 'personal_info', 'adult_content', 'violence', 'custom']
    },

    // Severity level (affects auto-moderation)
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },

    // Action to take when matched
    action: {
        type: String,
        enum: ['flag', 'hide', 'remove', 'block'],
        default: 'flag'
    },

    // Whether to notify moderators
    notifyModerators: {
        type: Boolean,
        default: true
    },

    // Active status
    isActive: {
        type: Boolean,
        default: true
    },

    // Context-specific filters
    applyTo: [{
        type: String,
        enum: ['posts', 'comments', 'messages', 'profiles', 'all']
    }],

    // Exceptions (usernames, IDs to exclude)
    exceptions: {
        userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        patterns: [String] // Context patterns to ignore
    },

    // Statistics
    stats: {
        matchCount: { type: Number, default: 0 },
        falsePositives: { type: Number, default: 0 },
        lastMatched: Date
    },

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Indexes
contentFilterSchema.index({ isActive: 1, category: 1 });
contentFilterSchema.index({ name: 'text' });

// Get active filters by category
contentFilterSchema.statics.getActiveFilters = function (category = null) {
    const query = { isActive: true };
    if (category) query.category = category;
    return this.find(query).lean();
};

// Test content against filter
contentFilterSchema.methods.testContent = function (content) {
    try {
        if (this.filterType === 'regex' || this.filterType === 'pattern') {
            const regex = new RegExp(this.pattern, this.regexFlags);
            return regex.test(content);
        } else if (this.filterType === 'word') {
            const words = content.toLowerCase().split(/\s+/);
            return words.includes(this.pattern.toLowerCase());
        } else if (this.filterType === 'phrase') {
            return content.toLowerCase().includes(this.pattern.toLowerCase());
        }
        return false;
    } catch (error) {
        console.error('Filter test error:', error);
        return false;
    }
};

const ContentFilter = mongoose.model('ContentFilter', contentFilterSchema);

module.exports = ContentFilter;
