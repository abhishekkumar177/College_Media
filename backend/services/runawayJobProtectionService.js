/**
 * Runaway Job Protection Service
 * Prevents background jobs from running indefinitely
 */

const { EventEmitter } = require('events');
const { tracer } = require('../config/tracing');
const logger = require('../utils/logger');

const JOB_TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;
const MONITOR_INTERVAL_MS = 5000;

const JOB_STATE = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  DEAD: 'DEAD'
};

class Job {
  constructor(id, handler, options = {}) {
    this.id = id;
    this.handler = handler;
    this.options = {
      timeout: options.timeout || JOB_TIMEOUT_MS,
      maxRetries: options.maxRetries || MAX_RETRIES,
      ...options
    };
    this.state = JOB_STATE.PENDING;
    this.retries = 0;
    this.startTime = null;
    this.timeoutRef = null;
    this.lastError = null;
    this.span = null;
  }

  async execute() {
    this.span = tracer.startSpan(`job.${this.id}`);
    this.span.setAttribute('job.id', this.id);
    this.span.setAttribute('job.type', this.constructor.name);

    try {
      this.state = JOB_STATE.RUNNING;
      this.startTime = Date.now();
      this.span.setAttribute('job.state', this.state);

      // Set timeout
      this.timeoutRef = setTimeout(() => {
        this.fail(new Error(`Job ${this.id} timed out after ${this.options.timeout}ms`));
      }, this.options.timeout);

      // Execute handler
      const result = await this.handler();
      this.success(result);

    } catch (error) {
      this.fail(error);
    }
  }

  success(result) {
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
    }

    this.state = JOB_STATE.SUCCESS;
    this.span.setAttribute('job.state', this.state);
    this.span.setAttribute('job.duration_ms', Date.now() - this.startTime);
    this.span.end();

    logger.info(`Job ${this.id} completed successfully`, {
      jobId: this.id,
      duration: Date.now() - this.startTime
    });
  }

  fail(error) {
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
    }

    this.lastError = error;
    this.retries++;

    if (this.retries < this.options.maxRetries) {
      // Retry with exponential backoff
      const backoffMs = BASE_BACKOFF_MS * Math.pow(2, this.retries - 1);
      this.span.setAttribute('job.retry', this.retries);
      this.span.setAttribute('job.backoff_ms', backoffMs);

      setTimeout(() => {
        this.execute();
      }, backoffMs);
    } else {
      this.state = JOB_STATE.DEAD;
      this.span.setAttribute('job.state', this.state);
      this.span.setAttribute('job.final_failure', true);
      this.span.recordException(error);
      this.span.end();

      logger.error(`Job ${this.id} failed permanently after ${this.retries} retries`, {
        jobId: this.id,
        error: error.message,
        retries: this.retries
      });
    }
  }
}

class RunawayJobProtectionService extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
    this.monitoring = false;
    this.startMonitoring();
  }

  /**
   * Submit a job for execution with protection
   */
  async submitJob(id, handler, options = {}) {
    const span = tracer.startSpan('job_protection.submit');
    span.setAttribute('job.id', id);

    try {
      if (this.jobs.has(id)) {
        throw new Error(`Job ${id} already exists`);
      }

      const job = new Job(id, handler, options);
      this.jobs.set(id, job);

      span.setAttribute('job.submitted', true);
      span.addEvent('Starting job execution');

      // Start job execution asynchronously
      setImmediate(() => job.execute());

      return job;
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Get job status
   */
  getJobStatus(id) {
    const job = this.jobs.get(id);
    if (!job) return null;

    return {
      id: job.id,
      state: job.state,
      retries: job.retries,
      startTime: job.startTime,
      duration: job.startTime ? Date.now() - job.startTime : 0,
      lastError: job.lastError?.message
    };
  }

  /**
   * Cancel a job
   */
  cancelJob(id) {
    const job = this.jobs.get(id);
    if (!job) return false;

    if (job.timeoutRef) {
      clearTimeout(job.timeoutRef);
    }

    job.state = JOB_STATE.FAILED;
    job.lastError = new Error('Job cancelled by user');

    if (job.span) {
      job.span.setAttribute('job.cancelled', true);
      job.span.end();
    }

    this.jobs.delete(id);
    return true;
  }

  /**
   * Start monitoring jobs
   */
  startMonitoring() {
    if (this.monitoring) return;

    this.monitoring = true;
    this.monitorInterval = setInterval(() => {
      this.monitorJobs();
    }, MONITOR_INTERVAL_MS);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.monitoring) return;

    this.monitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
  }

  /**
   * Monitor running jobs and clean up completed ones
   */
  monitorJobs() {
    const span = tracer.startSpan('job_protection.monitor');
    let activeJobs = 0;
    let completedJobs = 0;

    try {
      for (const [id, job] of this.jobs.entries()) {
        if (job.state === JOB_STATE.RUNNING) {
          activeJobs++;
          // Check for runaway jobs (additional safety check)
          if (job.startTime && (Date.now() - job.startTime) > job.options.timeout * 2) {
            job.fail(new Error(`Job ${id} detected as runaway`));
          }
        } else if ([JOB_STATE.SUCCESS, JOB_STATE.FAILED, JOB_STATE.DEAD].includes(job.state)) {
          completedJobs++;
          // Clean up completed jobs after some time
          setTimeout(() => {
            this.jobs.delete(id);
          }, 60000); // Keep for 1 minute for debugging
        }
      }

      span.setAttribute('jobs.active', activeJobs);
      span.setAttribute('jobs.completed', completedJobs);
      span.setAttribute('jobs.total', this.jobs.size);

    } catch (error) {
      span.recordException(error);
    } finally {
      span.end();
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    const stats = {
      total: this.jobs.size,
      active: 0,
      completed: 0,
      failed: 0,
      dead: 0
    };

    for (const job of this.jobs.values()) {
      switch (job.state) {
        case JOB_STATE.RUNNING:
          stats.active++;
          break;
        case JOB_STATE.SUCCESS:
          stats.completed++;
          break;
        case JOB_STATE.FAILED:
          stats.failed++;
          break;
        case JOB_STATE.DEAD:
          stats.dead++;
          break;
      }
    }

    return stats;
  }
}

module.exports = new RunawayJobProtectionService();