/**
 * CollaborativeDocument Model
 * Issue #923: Real-time Collaborative Features
 * 
 * Stores collaborative document state and snapshots.
 */

const mongoose = require('mongoose');

const collaborativeDocumentSchema = new mongoose.Schema({
    // Document identification
    documentId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Document type
    type: {
        type: String,
        enum: ['text', 'whiteboard', 'code', 'markdown', 'rich-text'],
        required: true
    },

    // Owner
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Current content
    content: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Plain text version for searching
    plainText: String,

    // Document metadata
    metadata: {
        title: String,
        description: String,
        language: String, // For code documents
        theme: String,
        fontSize: Number,
        lineNumbers: Boolean
    },

    // Version control
    version: {
        type: Number,
        default: 0
    },

    // Snapshots for recovery
    snapshots: [{
        version: Number,
        content: mongoose.Schema.Types.Mixed,
        createdAt: {
            type: Date,
            default: Date.now
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],

    // Permissions
    permissions: {
        public: {
            type: Boolean,
            default: false
        },
        allowedUsers: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            role: {
                type: String,
                enum: ['owner', 'editor', 'viewer', 'commenter'],
                default: 'viewer'
            }
        }],
        allowedGroups: [{
            groupId: String,
            role: String
        }]
    },

    // Statistics
    stats: {
        totalEdits: {
            type: Number,
            default: 0
        },
        totalCollaborators: {
            type: Number,
            default: 0
        },
        totalSessions: {
            type: Number,
            default: 0
        },
        lastEditedAt: Date,
        lastEditedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },

    // Status
    status: {
        type: String,
        enum: ['active', 'archived', 'deleted'],
        default: 'active',
        index: true
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
collaborativeDocumentSchema.index({ ownerId: 1, status: 1 });
collaborativeDocumentSchema.index({ 'permissions.allowedUsers.userId': 1 });

// Update content
collaborativeDocumentSchema.methods.updateContent = async function (content, userId) {
    this.content = content;
    this.version += 1;
    this.stats.totalEdits += 1;
    this.stats.lastEditedAt = new Date();
    this.stats.lastEditedBy = userId;
    this.updatedAt = new Date();

    // Extract plain text for searching
    if (typeof content === 'string') {
        this.plainText = content;
    } else if (content.text) {
        this.plainText = content.text;
    }

    return this.save();
};

// Create snapshot
collaborativeDocumentSchema.methods.createSnapshot = async function (userId) {
    this.snapshots.push({
        version: this.version,
        content: this.content,
        createdAt: new Date(),
        createdBy: userId
    });

    // Keep only last 10 snapshots
    if (this.snapshots.length > 10) {
        this.snapshots = this.snapshots.slice(-10);
    }

    return this.save();
};

// Restore from snapshot
collaborativeDocumentSchema.methods.restoreSnapshot = async function (snapshotVersion, userId) {
    const snapshot = this.snapshots.find(s => s.version === snapshotVersion);

    if (!snapshot) {
        throw new Error('Snapshot not found');
    }

    this.content = snapshot.content;
    this.version += 1;
    this.stats.lastEditedAt = new Date();
    this.stats.lastEditedBy = userId;

    return this.save();
};

// Check user permission
collaborativeDocumentSchema.methods.hasPermission = function (userId, requiredRole = 'viewer') {
    // Owner has all permissions
    if (this.ownerId.toString() === userId.toString()) {
        return true;
    }

    // Check if public
    if (this.permissions.public && requiredRole === 'viewer') {
        return true;
    }

    // Check allowed users
    const userPermission = this.permissions.allowedUsers.find(
        u => u.userId.toString() === userId.toString()
    );

    if (!userPermission) {
        return false;
    }

    const roleHierarchy = ['viewer', 'commenter', 'editor', 'owner'];
    const userRoleIndex = roleHierarchy.indexOf(userPermission.role);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    return userRoleIndex >= requiredRoleIndex;
};

const CollaborativeDocument = mongoose.model('CollaborativeDocument', collaborativeDocumentSchema);

module.exports = CollaborativeDocument;
