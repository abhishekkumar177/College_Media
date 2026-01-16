const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

class AuditService {

    /**
     * Log an action (asynchronously)
     * @param {Object} data 
     */
    static async log({ user, action, resourceType, resourceId, oldValue = null, newValue = null, req = null, status = 'SUCCESS' }) {
        try {
            const entry = {
                user: user._id || user, // Handle object or ID
                action,
                resourceType,
                resourceId: resourceId._id || resourceId,
                oldValue,
                newValue,
                status,
                ip: req ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress) : null,
                userAgent: req ? req.headers['user-agent'] : null
            };

            // Fire and forget (don't await in main thread usually, but good to catch errors)
            AuditLog.create(entry).catch(err => logger.error('Audit create failed:', err));

        } catch (error) {
            logger.error('AuditService Logic Error:', error);
        }
    }

    /**
     * Universal Revert Function (Admin Only)
     * Reverses the effect of a logged action.
     */
    static async revertAction(logId, adminUserId) {
        const log = await AuditLog.findById(logId);
        if (!log) throw new Error('Audit Log entry not found');

        if (log.action === 'REVERT') throw new Error('Cannot revert a revert (yet)');

        // Dynamic Model Resolution
        // Ensure models are registered in Mongoose
        let Model;
        try {
            Model = mongoose.model(log.resourceType);
        } catch (e) {
            throw new Error(`Model ${log.resourceType} not registered in Mongoose`);
        }

        let reverted = false;

        // 1. Revert UPDATE -> Set back to oldValue
        if (log.action === 'UPDATE') {
            if (!log.oldValue) throw new Error('No old value to revert to');
            await Model.findByIdAndUpdate(log.resourceId, log.oldValue);
            reverted = true;
        }

        // 2. Revert CREATE -> DELETE the resource
        else if (log.action === 'CREATE') {
            await Model.findByIdAndDelete(log.resourceId);
            reverted = true;
        }

        // 3. Revert DELETE -> Re-CREATE the resource
        else if (log.action === 'DELETE') {
            if (!log.oldValue) throw new Error('Cannot restore deleted item without backup (oldValue)');
            // Re-create with same ID if possible, or new ID
            await Model.create(log.oldValue);
            reverted = true;
        }

        if (reverted) {
            // Log the Reversion itself
            await this.log({
                user: adminUserId,
                action: 'REVERT',
                resourceType: log.resourceType,
                resourceId: log.resourceId,
                metadata: { originalAction: log.action, originalLogId: log._id }
            });
        }

        return reverted;
    }
}

module.exports = AuditService;
