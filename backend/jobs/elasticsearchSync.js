/**
 * Elasticsearch Sync Job
 * Issue #910: Advanced Search with Elasticsearch Integration
 * 
 * Background job for syncing MongoDB data to Elasticsearch.
 */

const searchSyncService = require('../services/searchSyncService');
const { initializeIndices } = require('../config/elasticsearch');

class ElasticsearchSyncJob {

    constructor() {
        this.isRunning = false;
        this.lastSyncTime = null;
        this.syncInterval = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Initialize Elasticsearch and perform initial sync
     */
    async initialize() {
        try {
            console.log('[ES Sync Job] Initializing Elasticsearch...');

            // Initialize indices
            const initialized = await initializeIndices();

            if (!initialized) {
                console.error('[ES Sync Job] Failed to initialize Elasticsearch');
                return false;
            }

            // Perform initial full sync
            console.log('[ES Sync Job] Performing initial sync...');
            await this.performFullSync();

            console.log('[ES Sync Job] Initialization complete');
            return true;
        } catch (error) {
            console.error('[ES Sync Job] Initialization error:', error);
            return false;
        }
    }

    /**
     * Start periodic sync job
     */
    start() {
        if (this.isRunning) {
            console.log('[ES Sync Job] Already running');
            return;
        }

        console.log(`[ES Sync Job] Starting periodic sync (interval: ${this.syncInterval / 1000}s)`);
        this.isRunning = true;

        // Run sync periodically
        this.intervalId = setInterval(async () => {
            await this.performIncrementalSync();
        }, this.syncInterval);
    }

    /**
     * Stop sync job
     */
    stop() {
        if (!this.isRunning) {
            console.log('[ES Sync Job] Not running');
            return;
        }

        console.log('[ES Sync Job] Stopping...');
        clearInterval(this.intervalId);
        this.isRunning = false;
    }

    /**
     * Perform full sync of all data
     */
    async performFullSync() {
        try {
            console.log('[ES Sync Job] Starting full sync...');
            const startTime = Date.now();

            const results = await searchSyncService.syncAll();

            const duration = Date.now() - startTime;
            this.lastSyncTime = new Date();

            console.log(`[ES Sync Job] Full sync completed in ${duration}ms:`, results);
            return results;
        } catch (error) {
            console.error('[ES Sync Job] Full sync error:', error);
            throw error;
        }
    }

    /**
     * Perform incremental sync (only recent changes)
     */
    async performIncrementalSync() {
        try {
            console.log('[ES Sync Job] Starting incremental sync...');
            const startTime = Date.now();

            // In a real implementation, this would:
            // 1. Query MongoDB for documents modified since lastSyncTime
            // 2. Sync only those documents
            // 3. Use change streams for real-time updates

            // For now, we'll do a simplified version
            const Post = require('../models/Post');
            const User = require('../models/User');

            const since = this.lastSyncTime || new Date(Date.now() - this.syncInterval);

            // Find recently modified posts
            const recentPosts = await Post.find({
                updatedAt: { $gte: since }
            }).select('_id');

            // Find recently modified users
            const recentUsers = await User.find({
                updatedAt: { $gte: since }
            }).select('_id');

            // Sync them
            let synced = 0;
            for (const post of recentPosts) {
                await searchSyncService.syncPost(post._id);
                synced++;
            }

            for (const user of recentUsers) {
                await searchSyncService.syncUser(user._id);
                synced++;
            }

            const duration = Date.now() - startTime;
            this.lastSyncTime = new Date();

            console.log(`[ES Sync Job] Incremental sync completed in ${duration}ms: ${synced} documents synced`);
            return { synced, duration };
        } catch (error) {
            console.error('[ES Sync Job] Incremental sync error:', error);
            throw error;
        }
    }

    /**
     * Get sync status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastSyncTime: this.lastSyncTime,
            syncInterval: this.syncInterval
        };
    }

    /**
     * Set sync interval
     */
    setSyncInterval(intervalMs) {
        this.syncInterval = intervalMs;

        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }
}

// Export singleton instance
const syncJob = new ElasticsearchSyncJob();

module.exports = syncJob;
