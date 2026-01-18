/**
 * NotificationPreference Model
 * Issue #906: Real-time Notification System with Push Notifications
 * 
 * Stores user notification preferences per channel and type.
 */

const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // Channel preferences
    channels: {
        inApp: {
            enabled: { type: Boolean, default: true },
            sound: { type: Boolean, default: true },
            desktop: { type: Boolean, default: true }
        },
        push: {
            enabled: { type: Boolean, default: false },
            sound: { type: Boolean, default: true },
            badge: { type: Boolean, default: true }
        },
        email: {
            enabled: { type: Boolean, default: true },
            frequency: {
                type: String,
                enum: ['instant', 'hourly', 'daily', 'weekly', 'never'],
                default: 'daily'
            },
            digest: { type: Boolean, default: true }
        },
        sms: {
            enabled: { type: Boolean, default: false }
        }
    },

    // Type-specific preferences
    types: {
        like: {
            inApp: { type: Boolean, default: true },
            push: { type: Boolean, default: false },
            email: { type: Boolean, default: false }
        },
        comment: {
            inApp: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            email: { type: Boolean, default: true }
        },
        follow: {
            inApp: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            email: { type: Boolean, default: false }
        },
        mention: {
            inApp: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            email: { type: Boolean, default: true }
        },
        share: {
            inApp: { type: Boolean, default: true },
            push: { type: Boolean, default: false },
            email: { type: Boolean, default: false }
        },
        message: {
            inApp: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            email: { type: Boolean, default: false }
        },
        post: {
            inApp: { type: Boolean, default: true },
            push: { type: Boolean, default: false },
            email: { type: Boolean, default: false }
        },
        system: {
            inApp: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            email: { type: Boolean, default: true }
        },
        announcement: {
            inApp: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            email: { type: Boolean, default: true }
        }
    },

    // Quiet hours
    quietHours: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '22:00' }, // HH:mm format
        end: { type: String, default: '08:00' },
        timezone: { type: String, default: 'UTC' }
    },

    // Do not disturb
    doNotDisturb: {
        enabled: { type: Boolean, default: false },
        until: Date
    },

    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Get or create preferences for user
notificationPreferenceSchema.statics.getOrCreate = async function (userId) {
    let prefs = await this.findOne({ userId });

    if (!prefs) {
        prefs = await this.create({ userId });
    }

    return prefs;
};

// Check if notification should be sent
notificationPreferenceSchema.methods.shouldSend = function (notificationType, channel) {
    // Check if channel is enabled globally
    if (!this.channels[channel]?.enabled) {
        return false;
    }

    // Check if type is enabled for this channel
    if (this.types[notificationType] && this.types[notificationType][channel] === false) {
        return false;
    }

    // Check do not disturb
    if (this.doNotDisturb.enabled) {
        if (!this.doNotDisturb.until || this.doNotDisturb.until > new Date()) {
            return false;
        }
    }

    // Check quiet hours (simplified - would need timezone handling)
    if (this.quietHours.enabled && (channel === 'push' || channel === 'sms')) {
        // Would implement time-based logic here
    }

    return true;
};

const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);

module.exports = NotificationPreference;
