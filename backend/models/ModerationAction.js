/**
 * ModerationAction Model
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * Tracks all moderation actions taken on content.
 */

const mongoose = require('mongoose');

const moderationActionSchema = new mongoose.Schema({
    // Reference to moderation queue item
    queueItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ModerationQueue',
        required: true
    },

    // Content reference
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    contentType: {
        type: String,
        required: true,
        enum: ['Post', 'Comment', 'Message', 'Profile']
    },

    // User affected
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Action taken
    action: {
        type: String,
        required: true,
        enum: ['approve', 'warn', 'hide', 'remove', 'ban_user', 'shadow_ban', 'rate_limit', 'restore']
    },

    // Reason and details
    reason: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['spam', 'harassment', 'hate_speech', 'violence', 'nsfw', 'misinformation', 'policy_violation', 'other']
    },

    // Moderator info
    moderatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    moderatorNotes: String,

    // Auto vs Manual
    isAutomated: { type: Boolean, default: false },
    automationRule: String,

    // AI Analysis at time of action
    aiConfidenceScore: Number,

    // Duration for temporary actions
    duration: {
        type: Number, // in hours
        default: null
    },
    expiresAt: Date,

    // Appeal info
    appealable: { type: Boolean, default: true },
    appealed: { type: Boolean, default: false },
    appealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appeal' },

    // Reversal info
    reversed: { type: Boolean, default: false },
    reversedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reversedAt: Date,
    reversalReason: String,

    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Indexes
moderationActionSchema.index({ userId: 1, createdAt: -1 });
moderationActionSchema.index({ moderatorId: 1, createdAt: -1 });
moderationActionSchema.index({ action: 1, createdAt: -1 });
moderationActionSchema.index({ contentId: 1 });

// Get user's moderation history
moderationActionSchema.statics.getUserHistory = function (userId, limit = 50) {
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('moderatorId', 'username')
        .lean();
};

// Get moderator's action history
moderationActionSchema.statics.getModeratorHistory = function (moderatorId, limit = 50) {
    return this.find({ moderatorId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'username')
        .lean();
};

const ModerationAction = mongoose.model('ModerationAction', moderationActionSchema);

module.exports = ModerationAction;
