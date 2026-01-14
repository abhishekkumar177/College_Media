const redis = require('../utils/redisClient');
const logger = require('../utils/logger');

const STREAM_KEY = 'events:notifications';

class EventPublisher {
    /**
     * Publish an event to the notification stream
     * @param {string} type - Event type (e.g., 'USER_REGISTERED', 'POST_LIKED')
     * @param {object} payload - Data associated with the event
     */
    static async publish(type, payload) {
        try {
            if (!redis.isConnected()) {
                logger.warn('Redis not connected, skipping event publish:', type);
                return;
            }

            const eventId = await redis.xadd(
                STREAM_KEY,
                '*', // Auto-generate ID
                'type', type,
                'payload', JSON.stringify(payload),
                'timestamp', Date.now()
            );

            logger.info(`Event published: ${type} (ID: ${eventId})`);
            return eventId;
        } catch (error) {
            logger.error(`Failed to publish event ${type}:`, error);
        }
    }
}

module.exports = EventPublisher;
