/**
 * CollaborativeSession Model
 * Issue #923: Real-time Collaborative Features
 * 
 * Tracks collaborative editing sessions with participants and permissions.
 */

const mongoose = require('mongoose');

const collaborativeSessionSchema = new mongoose.Schema({
    // Session identification
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Document being collaborated on
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

    documentType: {
        type: String,
        enum: ['post', 'document', 'whiteboard', 'code', 'note'],
        required: true
    },

    // Session owner
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Participants
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['owner', 'editor', 'viewer', 'commenter'],
            default: 'viewer'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        leftAt: Date,
        isActive: {
            type: Boolean,
            default: true
        },
        cursor: {
            position: Number,
            selection: {
                start: Number,
                end: Number
            },
            lastUpdate: Date
        }
    }],

    // Session state
    status: {
        type: String,
        enum: ['active', 'paused', 'ended', 'archived'],
        default: 'active',
        index: true
    },

    // Operational Transform state
    operationHistory: [{
        operationId: String,
        userId: mongoose.Schema.Types.ObjectId,
        operation: {
            type: String, // 'insert', 'delete', 'retain'
            position: Number,
            content: String,
            length: Number
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        version: Number
    }],

    currentVersion: {
        type: Number,
        default: 0
    },

    // Session settings
    settings: {
        maxParticipants: {
            type: Number,
            default: 50
        },
        allowAnonymous: {
            type: Boolean,
            default: false
        },
        enableVoice: {
            type: Boolean,
            default: false
        },
        enableVideo: {
            type: Boolean,
            default: false
        },
        enableScreenShare: {
            type: Boolean,
            default: true
        },
        enableChat: {
            type: Boolean,
            default: true
        },
        autoSave: {
            type: Boolean,
            default: true
        },
        autoSaveInterval: {
            type: Number,
            default: 30000 // 30 seconds
        }
    },

    // Recording
    recording: {
        isRecording: {
            type: Boolean,
            default: false
        },
        recordingUrl: String,
        startedAt: Date,
        stoppedAt: Date,
        duration: Number
    },

    // Metadata
    metadata: {
        title: String,
        description: String,
        tags: [String]
    },

    // Timestamps
    startedAt: {
        type: Date,
        default: Date.now
    },

    endedAt: Date,

    lastActivityAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
collaborativeSessionSchema.index({ sessionId: 1, status: 1 });
collaborativeSessionSchema.index({ ownerId: 1, status: 1 });
collaborativeSessionSchema.index({ 'participants.userId': 1 });

// Add participant to session
collaborativeSessionSchema.methods.addParticipant = async function (userId, role = 'viewer') {
    const existing = this.participants.find(p => p.userId.toString() === userId.toString());

    if (existing) {
        existing.isActive = true;
        existing.joinedAt = new Date();
        existing.leftAt = null;
    } else {
        this.participants.push({
            userId,
            role,
            joinedAt: new Date(),
            isActive: true
        });
    }

    this.lastActivityAt = new Date();
    return this.save();
};

// Remove participant from session
collaborativeSessionSchema.methods.removeParticipant = async function (userId) {
    const participant = this.participants.find(p => p.userId.toString() === userId.toString());

    if (participant) {
        participant.isActive = false;
        participant.leftAt = new Date();
    }

    this.lastActivityAt = new Date();
    return this.save();
};

// Update cursor position
collaborativeSessionSchema.methods.updateCursor = async function (userId, position, selection) {
    const participant = this.participants.find(p => p.userId.toString() === userId.toString());

    if (participant) {
        participant.cursor = {
            position,
            selection,
            lastUpdate: new Date()
        };
    }

    return this.save();
};

// Add operation to history
collaborativeSessionSchema.methods.addOperation = async function (userId, operation) {
    this.currentVersion += 1;

    this.operationHistory.push({
        operationId: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        operation,
        timestamp: new Date(),
        version: this.currentVersion
    });

    this.lastActivityAt = new Date();
    return this.save();
};

// Get active participants
collaborativeSessionSchema.methods.getActiveParticipants = function () {
    return this.participants.filter(p => p.isActive);
};

// Get session statistics
collaborativeSessionSchema.statics.getSessionStats = async function (ownerId) {
    return this.aggregate([
        {
            $match: {
                ownerId: ownerId
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalParticipants: { $sum: { $size: '$participants' } }
            }
        }
    ]);
};

const CollaborativeSession = mongoose.model('CollaborativeSession', collaborativeSessionSchema);

module.exports = CollaborativeSession;
