/**
 * Media Routes
 * Issue #922: Advanced Media Processing Pipeline
 * 
 * API routes for media processing.
 */

const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');

// Middleware (simplified - use actual auth/upload middleware in production)
const authMiddleware = (req, res, next) => next();
const uploadMiddleware = (req, res, next) => next();
const adminMiddleware = (req, res, next) => next();

/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     summary: Upload and process media
 *     tags: [Media]
 */
router.post('/upload', authMiddleware, uploadMiddleware, mediaController.uploadMedia);

/**
 * @swagger
 * /api/media/user/assets:
 *   get:
 *     summary: Get user's media assets
 *     tags: [Media]
 */
router.get('/user/assets', authMiddleware, mediaController.getUserAssets);

/**
 * @swagger
 * /api/media/stats:
 *   get:
 *     summary: Get storage statistics
 *     tags: [Media]
 */
router.get('/stats', authMiddleware, mediaController.getStorageStats);

/**
 * @swagger
 * /api/media/queue/metrics:
 *   get:
 *     summary: Get queue metrics (admin)
 *     tags: [Media]
 */
router.get('/queue/metrics', authMiddleware, adminMiddleware, mediaController.getQueueMetrics);

/**
 * @swagger
 * /api/media/job/:jobId:
 *   get:
 *     summary: Get processing job status
 *     tags: [Media]
 */
router.get('/job/:jobId', authMiddleware, mediaController.getJobStatus);

/**
 * @swagger
 * /api/media/:assetId:
 *   get:
 *     summary: Get media asset
 *     tags: [Media]
 */
router.get('/:assetId', authMiddleware, mediaController.getAsset);

/**
 * @swagger
 * /api/media/:assetId/process:
 *   post:
 *     summary: Queue additional processing
 *     tags: [Media]
 */
router.post('/:assetId/process', authMiddleware, mediaController.queueProcessing);

/**
 * @swagger
 * /api/media/:assetId:
 *   delete:
 *     summary: Delete media asset
 *     tags: [Media]
 */
router.delete('/:assetId', authMiddleware, mediaController.deleteAsset);

module.exports = router;
