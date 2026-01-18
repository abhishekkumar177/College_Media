/**
 * Request Deadline Propagation Middleware
 * Ensures requests have deadlines and propagates them across service calls
 */

const { tracer } = require('../config/tracing');

const DEFAULT_DEADLINE_MS = 30000; // 30 seconds
const DOWNSTREAM_TIMEOUT_BUFFER_MS = 200;

/**
 * Parse deadline from header
 */
function parseDeadline(header) {
  const value = Number(header);
  return Number.isFinite(value) ? value : null;
}

/**
 * Calculate remaining time until deadline
 */
function calculateRemaining(deadline) {
  return Math.max(deadline - Date.now(), 0);
}

/**
 * Middleware to set and propagate request deadlines
 */
const requestDeadlineMiddleware = (req, res, next) => {
  const span = tracer.startSpan('request_deadline_middleware');
  span.setAttribute('middleware.type', 'deadline_propagation');

  try {
    let deadline = parseDeadline(req.headers['x-request-deadline']);

    if (!deadline) {
      deadline = Date.now() + DEFAULT_DEADLINE_MS;
      req.headers['x-request-deadline'] = deadline.toString();
      span.setAttribute('deadline.set', true);
      span.setAttribute('deadline.value', deadline);
    } else {
      span.setAttribute('deadline.existing', true);
      span.setAttribute('deadline.value', deadline);
    }

    // Attach deadline utilities to request
    req.deadline = {
      timestamp: deadline,
      remaining: () => calculateRemaining(deadline),
      isExpired: () => calculateRemaining(deadline) <= 0,
      timeoutForDownstream: () => Math.max(calculateRemaining(deadline) - DOWNSTREAM_TIMEOUT_BUFFER_MS, 100)
    };

    // Set response header
    res.setHeader('x-request-deadline', deadline.toString());

    span.setAttribute('deadline.remaining_ms', req.deadline.remaining());
    span.end();
    next();
  } catch (error) {
    span.recordException(error);
    span.end();
    next(error);
  }
};

/**
 * Helper function to create axios config with deadline timeout
 */
const createDeadlineConfig = (req, additionalHeaders = {}) => {
  const timeout = req.deadline ? req.deadline.timeoutForDownstream() : DEFAULT_DEADLINE_MS;

  return {
    timeout,
    headers: {
      'x-request-deadline': req.headers['x-request-deadline'],
      ...additionalHeaders
    }
  };
};

module.exports = {
  requestDeadlineMiddleware,
  createDeadlineConfig,
  DEFAULT_DEADLINE_MS,
  DOWNSTREAM_TIMEOUT_BUFFER_MS
};