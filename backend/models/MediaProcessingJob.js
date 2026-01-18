/**
 * MediaProcessingJob Model
 * Issue #922: Advanced Media Processing Pipeline
 * 
 * Tracks media processing jobs in the queue.
 */

const mongoose = require('mongoose');

const mediaProcessingJobSchema = new mongoose.Schema({
    // Job identification
    jobId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Associated asset
    assetId: {
        type: String,
        required: true,
        index: true
    },

    // Owner
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Job type
    type: {
        type: String,
        required: true,
        enum: [
            'image_resize', 'image_compress', 'image_convert', 'image_watermark',
            'video_transcode', 'video_thumbnail', 'video_hls', 'video_compress',
            'metadata_extract', 'cdn_upload', 'batch_process'
        ],
        index: true
    },

    // Priority
    priority: {
        type: Number,
        default: 5, // 1-10, higher = more urgent
        index: true
    },

    // Job configuration
    config: {
        // Image options
        width: Number,
        height: Number,
        quality: Number,
        format: String,
        fit: String, // 'cover', 'contain', 'fill'

        // Video options
        resolution: String,
        bitrate: Number,
        codec: String,
        fps: Number,

        // Watermark options
        watermarkText: String,
        watermarkPosition: String,
        watermarkOpacity: Number,

        // General options
        preserveMetadata: Boolean,
        outputPath: String,

        // Batch options
        items: [mongoose.Schema.Types.Mixed]
    },

    // Input/Output
    input: {
        url: String,
        path: String,
        size: Number
    },

    output: {
        url: String,
        path: String,
        size: Number,
        metadata: mongoose.Schema.Types.Mixed
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'queued', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending',
        index: true
    },

    // Progress
    progress: {
        percent: { type: Number, default: 0 },
        currentStep: String,
        totalSteps: Number,
        stepProgress: Number
    },

    // Timing
    timing: {
        createdAt: { type: Date, default: Date.now },
        queuedAt: Date,
        startedAt: Date,
        completedAt: Date,
        estimatedDuration: Number, // seconds
        actualDuration: Number
    },

    // Retry info
    retry: {
        attempts: { type: Number, default: 0 },
        maxAttempts: { type: Number, default: 3 },
        lastError: String,
        nextRetryAt: Date
    },

    // Worker info
    worker: {
        id: String,
        hostname: String,
        pid: Number
    },

    // Result
    result: {
        success: Boolean,
        error: String,
        errorCode: String,
        data: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Indexes
mediaProcessingJobSchema.index({ status: 1, priority: -1, 'timing.createdAt': 1 });
mediaProcessingJobSchema.index({ assetId: 1, type: 1 });

// Update job status
mediaProcessingJobSchema.methods.updateStatus = async function (status, progress = null) {
    this.status = status;

    if (progress !== null) {
        this.progress.percent = progress;
    }

    if (status === 'queued') {
        this.timing.queuedAt = new Date();
    } else if (status === 'processing' && !this.timing.startedAt) {
        this.timing.startedAt = new Date();
    } else if (status === 'completed' || status === 'failed') {
        this.timing.completedAt = new Date();
        if (this.timing.startedAt) {
            this.timing.actualDuration = (this.timing.completedAt - this.timing.startedAt) / 1000;
        }
    }

    return this.save();
};

// Mark as failed
mediaProcessingJobSchema.methods.markFailed = async function (error, shouldRetry = true) {
    this.retry.attempts += 1;
    this.retry.lastError = error;

    if (shouldRetry && this.retry.attempts < this.retry.maxAttempts) {
        // Exponential backoff
        const delay = Math.pow(2, this.retry.attempts) * 1000;
        this.retry.nextRetryAt = new Date(Date.now() + delay);
        this.status = 'pending';
    } else {
        this.status = 'failed';
        this.result = {
            success: false,
            error,
            errorCode: 'MAX_RETRIES_EXCEEDED'
        };
        this.timing.completedAt = new Date();
    }

    return this.save();
};

// Get queue metrics
mediaProcessingJobSchema.statics.getQueueMetrics = async function () {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                avgDuration: { $avg: '$timing.actualDuration' }
            }
        }
    ]);
};

// Get pending jobs
mediaProcessingJobSchema.statics.getPendingJobs = function (limit = 10) {
    return this.find({
        status: { $in: ['pending', 'queued'] },
        $or: [
            { 'retry.nextRetryAt': { $exists: false } },
            { 'retry.nextRetryAt': { $lte: new Date() } }
        ]
    })
        .sort({ priority: -1, 'timing.createdAt': 1 })
        .limit(limit)
        .lean();
};

const MediaProcessingJob = mongoose.model('MediaProcessingJob', mediaProcessingJobSchema);

module.exports = MediaProcessingJob;
