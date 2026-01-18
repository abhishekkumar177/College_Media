/**
 * Media Processing Job
 * Issue #922: Advanced Media Processing Pipeline
 * 
 * Background job processor for media processing tasks.
 */

const MediaAsset = require('../models/MediaAsset');
const MediaProcessingJob = require('../models/MediaProcessingJob');
const imageProcessingService = require('../services/imageProcessingService');
const videoTranscodingService = require('../services/videoTranscodingService');
const thumbnailGeneratorService = require('../services/thumbnailGeneratorService');
const cdnService = require('../services/cdnService');
const metadataExtractorService = require('../services/metadataExtractorService');

class MediaProcessor {

    constructor() {
        this.isRunning = false;
        this.concurrency = 3;
        this.pollInterval = 5000;
    }

    /**
     * Start job processor
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        console.log('[MediaProcessor] Started');

        this.poll();
    }

    /**
     * Stop job processor
     */
    stop() {
        this.isRunning = false;
        console.log('[MediaProcessor] Stopped');
    }

    /**
     * Poll for pending jobs
     */
    async poll() {
        while (this.isRunning) {
            try {
                const jobs = await MediaProcessingJob.getPendingJobs(this.concurrency);

                if (jobs.length > 0) {
                    await Promise.all(jobs.map(job => this.processJob(job)));
                }

                await this.sleep(this.pollInterval);
            } catch (error) {
                console.error('[MediaProcessor] Poll error:', error);
                await this.sleep(this.pollInterval);
            }
        }
    }

    /**
     * Process a single job
     */
    async processJob(job) {
        const jobDoc = await MediaProcessingJob.findOne({ jobId: job.jobId });

        if (!jobDoc) return;

        try {
            // Update status to processing
            await jobDoc.updateStatus('processing', 0);

            // Update asset status
            await MediaAsset.findOneAndUpdate(
                { assetId: job.assetId },
                { 'processing.status': 'processing', 'processing.startedAt': new Date() }
            );

            // Process based on job type
            let result;
            switch (job.type) {
                case 'image_resize':
                    result = await this.processImageResize(job);
                    break;
                case 'image_compress':
                    result = await this.processImageCompress(job);
                    break;
                case 'image_convert':
                    result = await this.processImageConvert(job);
                    break;
                case 'image_watermark':
                    result = await this.processImageWatermark(job);
                    break;
                case 'video_transcode':
                    result = await this.processVideoTranscode(job);
                    break;
                case 'video_thumbnail':
                    result = await this.processVideoThumbnail(job);
                    break;
                case 'video_hls':
                    result = await this.processVideoHLS(job);
                    break;
                case 'metadata_extract':
                    result = await this.processMetadataExtract(job);
                    break;
                case 'cdn_upload':
                    result = await this.processCDNUpload(job);
                    break;
                default:
                    throw new Error(`Unknown job type: ${job.type}`);
            }

            // Update job as completed
            jobDoc.status = 'completed';
            jobDoc.progress = { percent: 100, currentStep: 'Complete' };
            jobDoc.result = { success: true, data: result };
            await jobDoc.updateStatus('completed', 100);

            // Update asset
            await MediaAsset.findOneAndUpdate(
                { assetId: job.assetId },
                {
                    'processing.status': 'completed',
                    'processing.progress': 100,
                    'processing.completedAt': new Date()
                }
            );

            console.log(`[MediaProcessor] Job ${job.jobId} completed`);
        } catch (error) {
            console.error(`[MediaProcessor] Job ${job.jobId} failed:`, error);
            await jobDoc.markFailed(error.message);

            await MediaAsset.findOneAndUpdate(
                { assetId: job.assetId },
                {
                    'processing.status': 'failed',
                    'processing.error': error.message
                }
            );
        }
    }

    /**
     * Process image resize job
     */
    async processImageResize(job) {
        const { width, height, fit, format, quality } = job.config;

        // Generate variants
        const variants = await imageProcessingService.generateVariants(
            job.input.path || job.input.url,
            '/tmp/output',
            job.assetId
        );

        return { variants };
    }

    /**
     * Process image compress job
     */
    async processImageCompress(job) {
        const result = await imageProcessingService.compress(
            job.input.path || job.input.url,
            `/tmp/${job.assetId}_compressed.jpg`,
            { quality: job.config.quality || 80 }
        );

        return result;
    }

    /**
     * Process image convert job
     */
    async processImageConvert(job) {
        const result = await imageProcessingService.convert(
            job.input.path || job.input.url,
            `/tmp/${job.assetId}.${job.config.format}`,
            job.config.format
        );

        return result;
    }

    /**
     * Process image watermark job
     */
    async processImageWatermark(job) {
        const result = await imageProcessingService.addWatermark(
            job.input.path || job.input.url,
            `/tmp/${job.assetId}_watermarked.jpg`,
            {
                text: job.config.watermarkText,
                position: job.config.watermarkPosition,
                opacity: job.config.watermarkOpacity
            }
        );

        return result;
    }

    /**
     * Process video transcode job
     */
    async processVideoTranscode(job) {
        const result = await videoTranscodingService.transcode(
            job.input.path || job.input.url,
            `/tmp/${job.assetId}.mp4`,
            {
                preset: job.config.resolution || '720p',
                codec: job.config.codec || 'h264'
            }
        );

        return result;
    }

    /**
     * Process video thumbnail job
     */
    async processVideoThumbnail(job) {
        const result = await thumbnailGeneratorService.generateVideoThumbnails(
            job.input.path || job.input.url,
            `/tmp/${job.assetId}_thumbs`,
            { count: job.config.count || 5 }
        );

        return result;
    }

    /**
     * Process video HLS job
     */
    async processVideoHLS(job) {
        const result = await videoTranscodingService.generateHLS(
            job.input.path || job.input.url,
            `/tmp/${job.assetId}_hls`,
            {
                resolutions: job.config.resolutions || ['360p', '480p', '720p', '1080p']
            }
        );

        return result;
    }

    /**
     * Process metadata extraction job
     */
    async processMetadataExtract(job) {
        const asset = await MediaAsset.findOne({ assetId: job.assetId });

        let result;
        if (asset.type === 'video') {
            result = await metadataExtractorService.extractVideoMetadata(
                job.input.path || job.input.url
            );
        } else {
            result = await metadataExtractorService.extractImageMetadata(
                job.input.path || job.input.url
            );
        }

        // Update asset with metadata
        asset.metadata = result.metadata;
        await asset.save();

        return result;
    }

    /**
     * Process CDN upload job
     */
    async processCDNUpload(job) {
        const result = await cdnService.upload(
            job.input.path || job.input.url,
            {
                contentType: job.config.contentType,
                cacheControl: job.config.cacheControl
            }
        );

        // Update asset with CDN info
        await MediaAsset.findOneAndUpdate(
            { assetId: job.assetId },
            { cdn: result }
        );

        return result;
    }

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new MediaProcessor();
