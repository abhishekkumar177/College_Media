/**
 * NotificationPreferences Model
 * User-specific notification preferences for each channel and type
 */

const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  // Global preferences
  globalEnabled: {
    type: Boolean,
    default: true
  },
  soundEnabled: {
    type: Boolean,
    default: true
  },
  // Channel preferences
  channels: {
    inApp: {
      enabled: { type: Boolean, default: true }
    },
    email: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['realtime', 'hourly', 'daily', 'weekly', 'never'],
        default: 'daily'
      }
    },
    push: {
      enabled: { type: Boolean, default: true },
      devices: [{
        deviceId: String,
        token: String,
        platform: {
          type: String,
          enum: ['ios', 'android', 'web']
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }]
    }
  },
  // Type-specific preferences
  types: {
    like: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    comment: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    reply: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    mention: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    follow: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    message: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    event: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    event_reminder: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    system: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false }
    },
    admin: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    group_invite: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    study_match: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    achievement: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },
  // Quiet hours
  quietHours: {
    enabled: { type: Boolean, default: false },
    start: { type: String, default: '22:00' }, // HH:MM format
    end: { type: String, default: '08:00' },
    timezone: { type: String, default: 'UTC' }
  },
  // Digest settings
  digest: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'weekly'
    },
    time: { type: String, default: '09:00' }, // HH:MM format
    dayOfWeek: { type: Number, default: 1 } // 0=Sunday, 1=Monday, etc.
  }
}, {
  timestamps: true
});

// Methods
notificationPreferencesSchema.methods.isChannelEnabled = function(type, channel) {
  if (!this.globalEnabled) return false;
  if (!this.channels[channel]?.enabled) return false;
  if (!this.types[type]) return true; // Default to enabled for unknown types
  return this.types[type][channel] !== false;
};

notificationPreferencesSchema.methods.addDevice = async function(deviceInfo) {
  const existingDevice = this.channels.push.devices.find(
    d => d.deviceId === deviceInfo.deviceId
  );
  
  if (existingDevice) {
    existingDevice.token = deviceInfo.token;
    existingDevice.platform = deviceInfo.platform;
  } else {
    this.channels.push.devices.push(deviceInfo);
  }
  
  return await this.save();
};

notificationPreferencesSchema.methods.removeDevice = async function(deviceId) {
  this.channels.push.devices = this.channels.push.devices.filter(
    d => d.deviceId !== deviceId
  );
  return await this.save();
};

notificationPreferencesSchema.methods.isInQuietHours = function() {
  if (!this.quietHours.enabled) return false;
  
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const { start, end } = this.quietHours;
  
  // Handle quiet hours that span midnight
  if (start > end) {
    return currentTime >= start || currentTime < end;
  }
  
  return currentTime >= start && currentTime < end;
};

// Statics
notificationPreferencesSchema.statics.getOrCreate = async function(userId) {
  let prefs = await this.findOne({ user: userId });
  
  if (!prefs) {
    prefs = await this.create({ user: userId });
  }
  
  return prefs;
};

const NotificationPreferences = mongoose.model('NotificationPreferences', notificationPreferencesSchema);

module.exports = NotificationPreferences;
