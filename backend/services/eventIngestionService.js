/**
 * Event Ingestion Service
 * Handles batching and processing of analytics events
 */

const AnalyticsEvent = require('../models/AnalyticsEvent');
const logger = require('../utils/logger');
const { randomUUID } = require('crypto');

class EventIngestionService {
  constructor() {
    this.eventQueue = [];
    this.batchSize = 100;
    this.flushInterval = 5000; // 5 seconds
    this.maxRetries = 3;
    this.isProcessing = false;
    
    // Start auto-flush timer
    this.startAutoFlush();
  }

  /**
   * Add event to queue for batched processing
   */
  async ingestEvent(eventData) {
    try {
      // Generate unique event ID
      const eventId = randomUUID();
      
      // Enrich event with server-side data
      const enrichedEvent = {
        ...eventData,
        eventId,
        serverTimestamp: new Date(),
        processingDelay: eventData.timestamp ? Date.now() - new Date(eventData.timestamp).getTime() : 0,
        isValid: this.validateEvent(eventData),
        validationErrors: this.getValidationErrors(eventData)
      };
      
      // Add to queue
      this.eventQueue.push(enrichedEvent);
      
      // Flush if batch size reached
      if (this.eventQueue.length >= this.batchSize) {
        await this.flush();
      }
      
      return { eventId, queued: true };
    } catch (error) {
      logger.error('Error ingesting event', { error: error.message, eventData });
      throw error;
    }
  }

  /**
   * Ingest multiple events in bulk
   */
  async ingestBatch(events) {
    const results = [];
    
    for (const event of events) {
      try {
        const result = await this.ingestEvent(event);
        results.push({ success: true, ...result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Validate event data
   */
  validateEvent(eventData) {
    if (!eventData.eventType) return false;
    if (!eventData.eventCategory) return false;
    if (!eventData.timestamp) return false;
    
    // Check timestamp is not in future
    if (new Date(eventData.timestamp) > new Date()) return false;
    
    // Check timestamp is not too old (more than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (new Date(eventData.timestamp) < thirtyDaysAgo) return false;
    
    return true;
  }

  /**
   * Get validation errors for event
   */
  getValidationErrors(eventData) {
    const errors = [];
    
    if (!eventData.eventType) errors.push('Missing eventType');
    if (!eventData.eventCategory) errors.push('Missing eventCategory');
    if (!eventData.timestamp) errors.push('Missing timestamp');
    
    if (eventData.timestamp) {
      if (new Date(eventData.timestamp) > new Date()) {
        errors.push('Timestamp is in the future');
      }
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (new Date(eventData.timestamp) < thirtyDaysAgo) {
        errors.push('Timestamp is too old (>30 days)');
      }
    }
    
    return errors;
  }

  /**
   * Flush queue to database
   */
  async flush() {
    if (this.eventQueue.length === 0 || this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    const batchId = randomUUID();
    const eventsToProcess = this.eventQueue.splice(0, this.batchSize);
    
    try {
      // Add batch ID to events
      const eventsWithBatch = eventsToProcess.map(event => ({
        ...event,
        batchId
      }));
      
      // Bulk insert with retries
      await this.insertWithRetry(eventsWithBatch);
      
      logger.info(`Flushed ${eventsToProcess.length} events`, { batchId });
    } catch (error) {
      logger.error('Error flushing events', { 
        error: error.message, 
        batchId,
        eventCount: eventsToProcess.length 
      });
      
      // Re-queue failed events
      this.eventQueue.unshift(...eventsToProcess);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Insert events with retry logic
   */
  async insertWithRetry(events, retryCount = 0) {
    try {
      await AnalyticsEvent.insertMany(events, { ordered: false });
    } catch (error) {
      if (retryCount < this.maxRetries) {
        logger.warn(`Retrying bulk insert (attempt ${retryCount + 1})`, { 
          error: error.message 
        });
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        
        return this.insertWithRetry(events, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Start auto-flush timer
   */
  startAutoFlush() {
    setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush().catch(error => {
          logger.error('Auto-flush error', { error: error.message });
        });
      }
    }, this.flushInterval);
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.eventQueue.length,
      isProcessing: this.isProcessing,
      batchSize: this.batchSize,
      flushInterval: this.flushInterval
    };
  }

  /**
   * Manual flush trigger
   */
  async forceFlush() {
    await this.flush();
  }

  /**
   * Update batch configuration
   */
  configure({ batchSize, flushInterval }) {
    if (batchSize) this.batchSize = batchSize;
    if (flushInterval) this.flushInterval = flushInterval;
  }
}

// Singleton instance
const eventIngestionService = new EventIngestionService();

module.exports = eventIngestionService;
