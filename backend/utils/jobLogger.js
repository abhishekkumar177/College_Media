/**
 * ============================================
 * Background Job Logger (Structured)
 * ============================================
 */

const logger = require("./logger");

module.exports = {
  jobStarted(jobName, payload) {
    logger.info("Background job started", {
      jobName,
      payload,
      timestamp: new Date().toISOString(),
    });
  },

  jobSuccess(jobName, attempt, result) {
    logger.info("Background job succeeded", {
      jobName,
      attempt,
      result,
      timestamp: new Date().toISOString(),
    });
  },

  jobFailed(jobName, attempt, error) {
    logger.error("Background job failed", {
      jobName,
      attempt,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  },

  jobDead(jobName, payload, error) {
    logger.critical("Background job moved to DEAD state", {
      jobName,
      payload,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  },
};
