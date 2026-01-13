const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for system flags
    },
    targetType: {
        type: String,
        enum: ['Post', 'Message', 'User', 'Comment'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetType'
    },
    reason: {
        type: String,
        enum: ['spam', 'harassment', 'inappropriate', 'hate_speech', 'misinformation', 'other'],
        required: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending',
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    moderator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolution: {
        type: String
    },
    moderatorNotes: {
        type: String
    },
    autoFlagged: {
        type: Boolean,
        default: false
    },
    flaggedReason: {
        type: String
    }
}, {
    timestamps: true
});

// Compound indexes for efficient moderation queue filtering
reportSchema.index({ status: 1, priority: 1, createdAt: 1 });
reportSchema.index({ targetId: 1, targetType: 1 }); // Check if target already reported

module.exports = mongoose.model('Report', reportSchema);
