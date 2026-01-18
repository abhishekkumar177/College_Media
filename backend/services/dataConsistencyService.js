/**
 * Data Consistency Service
 * Implements strong and eventual consistency strategies
 */

const { tracer } = require('../config/tracing');
const logger = require('../utils/logger');

class DataConsistencyService {
  constructor() {
    this.strongConsistencyData = new Map(); // User profiles, auth data
    this.eventualConsistencyData = new Map(); // Caches, analytics
    this.pendingUpdates = new Map(); // For eventual consistency
  }

  /**
   * Strong Consistency - Synchronous write/read
   * Used for critical data that must be immediately consistent
   */
  async writeStrong(key, value) {
    const span = tracer.startSpan('data_consistency.write_strong');
    span.setAttribute('consistency.type', 'strong');
    span.setAttribute('data.key', key);

    try {
      // Simulate database write with immediate consistency
      this.strongConsistencyData.set(key, {
        value,
        version: Date.now(),
        lastModified: new Date()
      });

      logger.info('Strong consistency write completed', { key, version: Date.now() });
      span.setAttribute('write.success', true);
    } catch (error) {
      span.recordException(error);
      span.setAttribute('write.success', false);
      throw error;
    } finally {
      span.end();
    }
  }

  async readStrong(key) {
    const span = tracer.startSpan('data_consistency.read_strong');
    span.setAttribute('consistency.type', 'strong');
    span.setAttribute('data.key', key);

    try {
      const data = this.strongConsistencyData.get(key);
      if (!data) {
        span.setAttribute('read.found', false);
        return null;
      }

      span.setAttribute('read.found', true);
      span.setAttribute('data.version', data.version);
      return data;
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Eventual Consistency - Asynchronous write/read
   * Used for non-critical data where temporary inconsistency is acceptable
   */
  async writeEventual(key, value, delay = 100) {
    const span = tracer.startSpan('data_consistency.write_eventual');
    span.setAttribute('consistency.type', 'eventual');
    span.setAttribute('data.key', key);
    span.setAttribute('write.delay_ms', delay);

    try {
      // Queue the update for eventual consistency
      const updateId = `${key}_${Date.now()}`;
      this.pendingUpdates.set(updateId, {
        key,
        value,
        timestamp: Date.now(),
        processed: false
      });

      // Simulate eventual processing
      setTimeout(() => {
        this.processEventualUpdate(updateId);
      }, delay);

      span.setAttribute('update.queued', true);
      span.setAttribute('update.id', updateId);
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  async processEventualUpdate(updateId) {
    const span = tracer.startSpan('data_consistency.process_eventual');
    span.setAttribute('update.id', updateId);

    try {
      const update = this.pendingUpdates.get(updateId);
      if (!update || update.processed) {
        span.setAttribute('update.skipped', true);
        return;
      }

      // Apply the eventual update
      this.eventualConsistencyData.set(update.key, {
        value: update.value,
        version: update.timestamp,
        lastModified: new Date(),
        consistent: true
      });

      update.processed = true;
      logger.info('Eventual consistency update processed', { key: update.key, updateId });

      span.setAttribute('update.processed', true);
    } catch (error) {
      span.recordException(error);
      span.setAttribute('update.failed', true);
    } finally {
      span.end();
    }
  }

  async readEventual(key) {
    const span = tracer.startSpan('data_consistency.read_eventual');
    span.setAttribute('consistency.type', 'eventual');
    span.setAttribute('data.key', key);

    try {
      const data = this.eventualConsistencyData.get(key);
      if (!data) {
        span.setAttribute('read.found', false);
        return null;
      }

      span.setAttribute('read.found', true);
      span.setAttribute('data.consistent', data.consistent);
      return data;
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Check consistency status
   */
  getConsistencyStatus() {
    return {
      strong: {
        records: this.strongConsistencyData.size,
        consistent: true // Always consistent by definition
      },
      eventual: {
        records: this.eventualConsistencyData.size,
        pendingUpdates: this.pendingUpdates.size,
        consistency: this.calculateEventualConsistency()
      }
    };
  }

  calculateEventualConsistency() {
    const total = this.eventualConsistencyData.size;
    if (total === 0) return 1.0;

    const consistent = Array.from(this.eventualConsistencyData.values())
      .filter(data => data.consistent).length;

    return consistent / total;
  }
}

module.exports = new DataConsistencyService();