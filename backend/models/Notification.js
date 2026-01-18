/**
 * Enhanced Notification Model
 * Real-time notifications with delivery tracking, read receipts, and aggregation
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // System notifications have no sender
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'follow', 'mention', 'message', 'reply', 'event', 'event_reminder', 'system', 'admin', 'group_invite', 'study_match', 'achievement'],
        required: true,
        index: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    content: {
        type: String,
        maxlength: 500
    },
    title: {
        type: String,
        maxlength: 200
    },
    // Generic resource reference
    resourceType: {
        type: String,
        enum: ['Post', 'Comment', 'Event', 'User', 'Message', 'Study', 'Other']
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    // Action URL
    actionUrl: {
        type: String
    },
    // Metadata for additional info
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Read status
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    readAt: {
        type: Date,
        default: null
    },
    // Delivery tracking
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending',
        index: true
    },
    channels: {
        inApp: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            delivered: { type: Boolean, default: false },
            deliveredAt: Date
        },
        email: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            opened: { type: Boolean, default: false },
            openedAt: Date
        },
        push: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            clicked: { type: Boolean, default: false },
            clickedAt: Date
        }
    },
    // Priority
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal',
        index: true
    },
    // Expiration
    expiresAt: {
        type: Date,
        default: null
    },
    // Grouping for aggregation
    groupKey: {
        type: String,
        default: null,
        index: true
    },
    aggregatedCount: {
        type: Number,
        default: 1
    },
    aggregatedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Compound indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ groupKey: 1, createdAt: -1 });

// Methods
notificationSchema.methods.markAsRead = async function() {
    this.isRead = true;
    this.readAt = new Date();
    return await this.save();
};

notificationSchema.methods.markAsDelivered = async function(channel) {
    if (channel && this.channels[channel]) {
        this.channels[channel].delivered = true;
        this.channels[channel].deliveredAt = new Date();
    }
    this.status = 'delivered';
    return await this.save();
};

notificationSchema.methods.softDelete = async function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return await this.save();
};

// Statics
notificationSchema.statics.getUnreadCount = async function(userId) {
    return await this.countDocuments({
        recipient: userId,
        isRead: false,
        isDeleted: false
    });
};

notificationSchema.statics.markAllAsRead = async function(userId) {
    return await this.updateMany(
        { recipient: userId, isRead: false, isDeleted: false },
        { $set: { isRead: true, readAt: new Date() } }
    );
};

module.exports = mongoose.model('Notification', notificationSchema);
