const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN',
            'LOGIN_FAILED',
            'LOGOUT',
            'REGISTER',
            'PASSWORD_CHANGE',
            'PASSWORD_RESET_REQUEST',
            'PASSWORD_RESET_COMPLETE',
            'PROFILE_UPDATE',
            'PROFILE_PICTURE_UPDATE',
            'EMAIL_CHANGE',
            '2FA_ENABLED',
            '2FA_DISABLED',
            'ACCOUNT_DELETED',
            'ACCOUNT_RESTORED',
            'SETTINGS_CHANGE',
            'FOLLOW_USER',
            'UNFOLLOW_USER',
            'ADMIN_ACTION'
        ],
        index: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: 'Unknown'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'success'
    },
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
activityLogSchema.index({ userId: 1, createdAt: -1 }); // User's activity history
activityLogSchema.index({ action: 1, createdAt: -1 }); // Filter by action type
activityLogSchema.index({ createdAt: -1 }); // Recent activities
activityLogSchema.index({ riskLevel: 1, createdAt: -1 }); // Security monitoring
activityLogSchema.index({ ipAddress: 1 }); // Track by IP

// Static method to log activity
activityLogSchema.statics.log = async function (data) {
    try {
        const log = await this.create({
            userId: data.userId,
            action: data.action,
            ipAddress: data.ipAddress || 'unknown',
            userAgent: data.userAgent || 'Unknown',
            metadata: data.metadata || {},
            status: data.status || 'success',
            riskLevel: data.riskLevel || 'low'
        });
        return log;
    } catch (error) {
        console.error('Failed to log activity:', error);
        return null;
    }
};

// Static method to get user's activity
activityLogSchema.statics.getUserActivity = async function (userId, options = {}) {
    const { page = 1, limit = 20, action } = options;
    const skip = (page - 1) * limit;

    const query = { userId };
    if (action) query.action = action;

    const [logs, total] = await Promise.all([
        this.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// Static method for admin audit log
activityLogSchema.statics.getAuditLog = async function (options = {}) {
    const { page = 1, limit = 50, action, userId, riskLevel, dateFrom, dateTo } = options;
    const skip = (page - 1) * limit;

    const query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (riskLevel) query.riskLevel = riskLevel;
    if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const [logs, total] = await Promise.all([
        this.find(query)
            .populate('userId', 'username email firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);
