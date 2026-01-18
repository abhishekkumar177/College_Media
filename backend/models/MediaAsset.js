/**
 * MediaAsset Model
 * Issue #922: Advanced Media Processing Pipeline
 * 
 * Tracks processed media assets with metadata and analytics.
 */

const mongoose = require('mongoose');

const mediaAssetSchema = new mongoose.Schema({
    // Identification
    assetId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Owner
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Asset type
    type: {
        type: String,
        required: true,
        enum: ['image', 'video', 'audio', 'document'],
        index: true
    },

    // Original file info
    original: {
        filename: String,
        mimeType: String,
        size: Number, // bytes
        url: String,
        hash: String // for deduplication
    },

    // Processed variants
    variants: [{
        name: String, // 'thumbnail', 'small', 'medium', 'large', 'hd', '4k'
        width: Number,
        height: Number,
        size: Number,
        url: String,
        format: String,
        quality: Number,
        createdAt: { type: Date, default: Date.now }
    }],

    // Video-specific data
    video: {
        duration: Number, // seconds
        resolution: String,
        fps: Number,
        codec: String,
        bitrate: Number,
        hasAudio: Boolean,
        thumbnails: [{
            time: Number,
            url: String
        }],
        hls: {
            enabled: Boolean,
            playlistUrl: String,
            segments: Number
        }
    },

    // Image-specific data
    image: {
        width: Number,
        height: Number,
        format: String,
        colorSpace: String,
        hasAlpha: Boolean
    },

    // Metadata
    metadata: {
        exif: mongoose.Schema.Types.Mixed,
        gps: {
            latitude: Number,
            longitude: Number
        },
        camera: {
            make: String,
            model: String,
            lens: String
        },
        createdDate: Date,
        title: String,
        description: String,
        tags: [String]
    },

    // CDN info
    cdn: {
        provider: String,
        region: String,
        bucket: String,
        key: String,
        publicUrl: String,
        cacheControl: String,
        lastInvalidated: Date
    },

    // Processing status
    processing: {
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },
        progress: {
            type: Number,
            default: 0
        },
        startedAt: Date,
        completedAt: Date,
        error: String,
        attempts: { type: Number, default: 0 }
    },

    // Analytics
    analytics: {
        views: { type: Number, default: 0 },
        downloads: { type: Number, default: 0 },
        bandwidth: { type: Number, default: 0 }, // bytes transferred
        lastViewed: Date
    },

    // Settings
    settings: {
        isPublic: { type: Boolean, default: false },
        allowDownload: { type: Boolean, default: true },
        watermark: {
            enabled: Boolean,
            text: String,
            position: String
        },
        exifStrip: { type: Boolean, default: false }
    },

    // Status
    status: {
        type: String,
        enum: ['active', 'archived', 'deleted'],
        default: 'active',
        index: true
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Indexes
mediaAssetSchema.index({ ownerId: 1, type: 1, status: 1 });
mediaAssetSchema.index({ 'original.hash': 1 });
mediaAssetSchema.index({ 'processing.status': 1 });

// Update processing status
mediaAssetSchema.methods.updateProcessingStatus = async function (status, progress = null, error = null) {
    this.processing.status = status;
    if (progress !== null) this.processing.progress = progress;
    if (error) this.processing.error = error;
    if (status === 'processing' && !this.processing.startedAt) {
        this.processing.startedAt = new Date();
    }
    if (status === 'completed' || status === 'failed') {
        this.processing.completedAt = new Date();
    }
    this.updatedAt = new Date();
    return this.save();
};

// Add variant
mediaAssetSchema.methods.addVariant = async function (variant) {
    this.variants.push(variant);
    return this.save();
};

// Increment analytics
mediaAssetSchema.methods.incrementViews = async function () {
    this.analytics.views += 1;
    this.analytics.lastViewed = new Date();
    return this.save();
};

// Get storage statistics
mediaAssetSchema.statics.getStorageStats = async function (ownerId) {
    return this.aggregate([
        { $match: { ownerId, status: 'active' } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalSize: { $sum: '$original.size' },
                totalBandwidth: { $sum: '$analytics.bandwidth' }
            }
        }
    ]);
};

const MediaAsset = mongoose.model('MediaAsset', mediaAssetSchema);

module.exports = MediaAsset;
