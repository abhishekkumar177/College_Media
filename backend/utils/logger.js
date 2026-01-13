/**
 * ============================================================
 * JobRunner – Advanced Background Job Executor
 * ------------------------------------------------------------
 * ✔ Retry with exponential backoff
 * ✔ Timeout protection
 * ✔ Dead Letter Queue handling
 * ✔ Correlation ID propagation
 * ✔ Async context safe
 * ✔ Structured logging
 * ✔ Lifecycle hooks
 * ✔ Production ready
 * ============================================================
 */

const { randomUUID } = require("crypto");
const {
  getRequestId,
  withRequestContext,
} = require("../middleware/requestId.middleware");

const logger = require("./logger");

/* ============================================================
   ⚙️ DEFAULT CONFIGS
============================================================ */
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 2000;
const DEFAULT_TIMEOUT_MS = 5000;

/* ============================================================
   🧠 INTERNAL HELPERS
============================================================ */

/**
 * Generate job execution ID
 */
const generateJobExecutionId = () => {
  try {
    return randomUUID();
  } catch {
    return (
      "job_" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2)
    );
  }
};

/**
 * Sleep helper
 */
const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff
 */
const calculateBackoff = (base, attempt) => {
  return base * Math.pow(2, attempt - 1);
};

/* ============================================================
   🧱 JOB RUNNER CLASS
============================================================ */
class JobRunner {
  constructor({
    jobName,
    handler,
    maxRetries = DEFAULT_MAX_RETRIES,
    backoffMs = DEFAULT_BACKOFF_MS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    onSuccess,
    onFailure,
  }) {
    if (!jobName) throw new Error("jobName is required");
    if (typeof handler !== "function")
      throw new Error("handler must be a function");

    this.jobName = jobName;
    this.handler = handler;
    this.maxRetries = maxRetries;
    this.backoffMs = backoffMs;
    this.timeoutMs = timeoutMs;
    this.onSuccess = onSuccess;
    this.onFailure = onFailure;
  }

  /* ============================================================
     🚀 PUBLIC RUN METHOD
  ============================================================ */
  async run(payload = {}, context = {}) {
    const attemptContextRequestId =
      context.requestId || getRequestId();

    const jobExecutionId = generateJobExecutionId();

    let attempt = 0;

    return withRequestContext(async () => {
      logger.info("Background job started", {
        jobName: this.jobName,
        jobExecutionId,
        requestId: attemptContextRequestId,
        payload,
      });

      while (attempt <= this.maxRetries) {
        attempt++;

        try {
          logger.info("Job attempt started", {
            jobName: this.jobName,
            jobExecutionId,
            attempt,
          });

          const result = await this._runWithTimeout(
            () => this.handler(payload, context),
            this.timeoutMs
          );

          logger.info("Job succeeded", {
            jobName: this.jobName,
            jobExecutionId,
            attempt,
          });

          if (typeof this.onSuccess === "function") {
            await this.onSuccess(result, {
              jobName: this.jobName,
              jobExecutionId,
              attempt,
            });
          }

          return result;
        } catch (error) {
          logger.error("Job attempt failed", {
            jobName: this.jobName,
            jobExecutionId,
            attempt,
            error: error.message,
            stack: error.stack,
          });

          if (attempt > this.maxRetries) {
            await this._handlePermanentFailure(
              error,
              payload,
              jobExecutionId
            );
            throw error;
          }

          const delay = calculateBackoff(
            this.backoffMs,
            attempt
          );

          logger.warn("Retrying job after backoff", {
            jobName: this.jobName,
            jobExecutionId,
            attempt,
            delayMs: delay,
          });

          await sleep(delay);
        }
      }
    });
  }

  /* ============================================================
     ⏱️ TIMEOUT GUARD
  ============================================================ */
  async _runWithTimeout(fn, timeoutMs) {
    let timeoutHandle;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error("Job execution timed out"));
      }, timeoutMs);
    });

    try {
      return await Promise.race([fn(), timeoutPromise]);
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  /* ============================================================
     ☠️ PERMANENT FAILURE HANDLER
  ============================================================ */
  async _handlePermanentFailure(
    error,
    payload,
    jobExecutionId
  ) {
    logger.critical("Job permanently failed", {
      jobName: this.jobName,
      jobExecutionId,
      error: error.message,
      payload,
    });

    await this._moveToDeadLetterQueue(
      error,
      payload,
      jobExecutionId
    );

    if (typeof this.onFailure === "function") {
      await this.onFailure(error, {
        jobName: this.jobName,
        jobExecutionId,
      });
    }
  }

  /* ============================================================
     📦 DEAD LETTER QUEUE
  ============================================================ */
  async _moveToDeadLetterQueue(
    error,
    payload,
    jobExecutionId
  ) {
    /**
     * NOTE:
     * This is an abstraction point.
     * Can be replaced with:
     * - MongoDB collection
     * - Redis DLQ
     * - Kafka topic
     * - SQS DLQ
     */

    logger.error("Job moved to Dead Letter Queue", {
      jobName: this.jobName,
      jobExecutionId,
      reason: error.message,
      payload,
      timestamp: new Date().toISOString(),
    });
  }
}

/* ============================================================
   📤 EXPORT
============================================================ */
module.exports = JobRunner;
