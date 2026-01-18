/**
 * Appeal Model
 * Issue #901: Content Moderation System with AI-Assisted Detection
 * 
 * Handles user appeals against moderation decisions.
 */

const mongoose = require('mongoose');

const appealSchema = new mongoose.Schema({
    // Reference to the moderation action being appealed
    actionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ModerationAction',
        required: true
    },

    // User who filed the appeal
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Appeal details
    reason: {
        type: String,
        required: true,
        maxlength: 2000
    },

    // Supporting evidence
    evidence: [{
        type: { type: String, enum: ['text', 'image', 'link'] },
        content: String,
        addedAt: { type: Date, default: Date.now }
    }],

    // Appeal status
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'escalated'],
        default: 'pending'
    },

    // Assigned reviewer
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedAt: Date,

    // Review outcome
    decision: {
        outcome: {
            type: String,
            enum: ['uphold', 'overturn', 'modify']
        },
        newAction: String,
        reason: String,
        decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        decidedAt: Date
    },

    // Priority
    priority: {
        type: Number,
        default: 5,
        min: 1,
        max: 10
    },

    // Communication thread
    messages: [{
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        senderRole: { type: String, enum: ['user', 'moderator', 'system'] },
        content: String,
        sentAt: { type: Date, default: Date.now }
    }],

    // Metadata
    submittedAt: { type: Date, default: Date.now },
    reviewStartedAt: Date,
    resolvedAt: Date,

    // Escalation
    escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    escalationReason: String,
    escalatedAt: Date
}, {
    timestamps: true
});

// Indexes
appealSchema.index({ status: 1, priority: 1, submittedAt: 1 });
appealSchema.index({ userId: 1, createdAt: -1 });
appealSchema.index({ reviewerId: 1, status: 1 });

// Get pending appeals for reviewer
appealSchema.statics.getPendingAppeals = function (limit = 20) {
    return this.find({ status: 'pending' })
        .sort({ priority: 1, submittedAt: 1 })
        .limit(limit)
        .populate('userId', 'username avatar')
        .populate('actionId')
        .lean();
};

const Appeal = mongoose.model('Appeal', appealSchema);

module.exports = Appeal;
