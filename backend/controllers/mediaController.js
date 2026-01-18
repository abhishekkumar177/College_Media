/**
 * Media Controller
 * Issue #922: Advanced Media Processing Pipeline
 * 
 * API endpoints for media processing.
 */

const MediaAsset = require('../models/MediaAsset');
const MediaProcessingJob = require('../models/MediaProcessingJob');
const imageProcessingService = require('../services/imageProcessingService');
const videoTranscodingService = require('../services/videoTranscodingService');
const thumbnailGeneratorService = require('../services/thumbnailGeneratorService');
const cdnService = require('../services/cdnService');
const metadataExtractorService = require('../services/metadataExtractorService');

const mediaController = {

    /**
     * POST /api/media/upload
     * Upload and process media
     */
    async uploadMedia(req, res) {
        try {
            const { file } = req;
            const userId = req.user._id;
            const { type = 'image', processOptions = {} } = req.body;

            // Create asset record
            const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const asset = await MediaAsset.create({
                assetId,
                ownerId: userId,
                type,
                original: {
                    filename: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    url: file.path
                },
                processing: { status: 'pending', progress: 0 }
            });

            // Create processing job
            const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            await MediaProcessingJob.create({
                jobId,
                assetId,
                ownerId: userId,
                type: type === 'video' ? 'video_transcode' : 'image_resize',
                priority: 5,
                config: processOptions,
                input: { path: file.path, size: file.size },
                status: 'queued'
            });

            res.status(201).json({
                success: true,
                data: {
                    asset,
                    jobId,
                    message: 'Media uploaded and queued for processing'
                }
            });
        } catch (error) {
            console.error('Upload media error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload media'
            });
        }
    },

    /**
     * GET /api/media/:assetId
     * Get media asset
     */
    async getAsset(req, res) {
        try {
            const { assetId } = req.params;

            const asset = await MediaAsset.findOne({ assetId })
                .populate('ownerId', 'username avatar');

            if (!asset) {
                return res.status(404).json({
                    success: false,
                    message: 'Asset not found'
                });
            }

            // Increment views
            await asset.incrementViews();

            res.json({
                success: true,
                data: asset
            });
        } catch (error) {
            console.error('Get asset error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get asset'
            });
        }
    },

    /**
     * GET /api/media/job/:jobId
     * Get processing job status
     */
    async getJobStatus(req, res) {
        try {
            const { jobId } = req.params;

            const job = await MediaProcessingJob.findOne({ jobId });

            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found'
                });
            }

            res.json({
                success: true,
                data: {
                    jobId: job.jobId,
                    status: job.status,
                    progress: job.progress,
                    timing: job.timing,
                    result: job.result
                }
            });
        } catch (error) {
            console.error('Get job status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get job status'
            });
        }
    },

    /**
     * POST /api/media/:assetId/process
     * Queue additional processing
     */
    async queueProcessing(req, res) {
        try {
            const { assetId } = req.params;
            const { type, config = {} } = req.body;
            const userId = req.user._id;

            const asset = await MediaAsset.findOne({ assetId });

            if (!asset) {
                return res.status(404).json({
                    success: false,
                    message: 'Asset not found'
                });
            }

            const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const job = await MediaProcessingJob.create({
                jobId,
                assetId,
                ownerId: userId,
                type,
                priority: 5,
                config,
                input: { url: asset.original.url },
                status: 'queued'
            });

            res.json({
                success: true,
                data: { jobId, status: 'queued' }
            });
        } catch (error) {
            console.error('Queue processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to queue processing'
            });
        }
    },

    /**
     * DELETE /api/media/:assetId
     * Delete media asset
     */
    async deleteAsset(req, res) {
        try {
            const { assetId } = req.params;
            const userId = req.user._id;

            const asset = await MediaAsset.findOne({ assetId, ownerId: userId });

            if (!asset) {
                return res.status(404).json({
                    success: false,
                    message: 'Asset not found'
                });
            }

            // Delete from CDN
            if (asset.cdn?.key) {
                await cdnService.delete(asset.cdn.key);
            }

            // Mark as deleted
            asset.status = 'deleted';
            await asset.save();

            res.json({
                success: true,
                message: 'Asset deleted'
            });
        } catch (error) {
            console.error('Delete asset error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete asset'
            });
        }
    },

    /**
     * GET /api/media/user/assets
     * Get user's media assets
     */
    async getUserAssets(req, res) {
        try {
            const userId = req.user._id;
            const { type, status = 'active', limit = 20, skip = 0 } = req.query;

            const query = { ownerId: userId, status };
            if (type) query.type = type;

            const [assets, total] = await Promise.all([
                MediaAsset.find(query)
                    .sort({ createdAt: -1 })
                    .skip(parseInt(skip))
                    .limit(parseInt(limit))
                    .lean(),
                MediaAsset.countDocuments(query)
            ]);

            res.json({
                success: true,
                data: {
                    assets,
                    total,
                    hasMore: total > skip + limit
                }
            });
        } catch (error) {
            console.error('Get user assets error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get assets'
            });
        }
    },

    /**
     * GET /api/media/stats
     * Get storage statistics
     */
    async getStorageStats(req, res) {
        try {
            const userId = req.user._id;

            const stats = await MediaAsset.getStorageStats(userId);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get storage stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get stats'
            });
        }
    },

    /**
     * GET /api/media/queue/metrics
     * Get queue metrics (admin)
     */
    async getQueueMetrics(req, res) {
        try {
            const metrics = await MediaProcessingJob.getQueueMetrics();

            res.json({
                success: true,
                data: metrics
            });
        } catch (error) {
            console.error('Get queue metrics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get metrics'
            });
        }
    }
};

module.exports = mediaController;
