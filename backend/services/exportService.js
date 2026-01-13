const exportQueue = require('../jobs/exportQueue');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

class ExportService {
    /**
     * Request a data export
     * @param {string} userId
     * @param {string} format - 'pdf' or 'csv'
     */
    static async requestExport(userId, format = 'pdf') {
        try {
            if (!['pdf', 'csv'].includes(format)) {
                throw new Error('Invalid format. Supported: pdf, csv');
            }

            const job = await exportQueue.add({
                userId,
                format
            }, {
                attempts: 2,
                backoff: 5000,
                removeOnComplete: true // Keep logs managed
            });

            logger.info(`Export requested for user ${userId}, job ${job.id}`);
            return { jobId: job.id, status: 'queued' };
        } catch (error) {
            logger.error('Request export error:', error);
            throw error;
        }
    }

    /**
     * Get export status
     */
    static async getExportStatus(jobId) {
        try {
            const job = await exportQueue.getJob(jobId);
            if (!job) return null;

            const state = await job.getState();
            const progress = job._progress;
            const result = job.returnvalue;

            return {
                id: job.id,
                state,
                progress,
                result: state === 'completed' ? { downloadUrl: `/api/account/export/${job.id}/download` } : null
            };
        } catch (error) {
            logger.error('Get export status error:', error);
            throw error;
        }
    }

    /**
     * Get file path for download
     */
    static async getExportFilePath(jobId) {
        const job = await exportQueue.getJob(jobId);
        if (!job || !job.returnvalue) return null;

        const { filePath } = job.returnvalue;
        if (fs.existsSync(filePath)) {
            return filePath;
        }
        return null;
    }
}

module.exports = ExportService;
