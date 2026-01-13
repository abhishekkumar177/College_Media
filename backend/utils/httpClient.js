/**
 * ==========================================================
 * HTTP CLIENT – PRODUCTION GRADE
 * ----------------------------------------------------------
 * ✔ Centralized external API client
 * ✔ Strict timeout enforcement
 * ✔ Retry with exponential backoff
 * ✔ Retry only on transient failures
 * ✔ Circuit Breaker protection
 * ✔ Graceful failure handling
 * ✔ Background-job safe
 * ✔ Detailed logging
 * ==========================================================
 */

const axios = require("axios");
const logger = require("./logger");

/* ==========================================================
   ⚙️ DEFAULT CONFIGURATION
========================================================== */

const DEFAULT_TIMEOUT = 5000; // 5 seconds
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BACKOFF_BASE = 300; // ms
const DEFAULT_BACKOFF_MULTIPLIER = 2;

/* ==========================================================
   🚦 CIRCUIT BREAKER CONFIG
========================================================== */

const CIRCUIT_FAILURE_THRESHOLD = 5; // failures
const CIRCUIT_RESET_TIMEOUT = 30 * 1000; // 30 sec

const circuitState = {
  failures: 0,
  lastFailureTime: null,
  state: "CLOSED", // CLOSED | OPEN | HALF_OPEN
};

/* ==========================================================
   🧠 UTILITY HELPERS
========================================================== */

/**
 * Sleep helper (non-blocking)
 */
const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if error is retryable
 */
const isRetryableError = (error) => {
  if (!error) return false;

  // Network / timeout
  if (error.code === "ECONNABORTED") return true;
  if (!error.response) return true;

  const status = error.response.status;

  // Retry only server-side failures
  return status >= 500 && status < 600;
};

/**
 * Calculate exponential backoff delay
 */
const getBackoffDelay = (attempt) => {
  return (
    DEFAULT_BACKOFF_BASE *
    Math.pow(DEFAULT_BACKOFF_MULTIPLIER, attempt - 1)
  );
};

/* ==========================================================
   🚦 CIRCUIT BREAKER LOGIC
========================================================== */

const isCircuitOpen = () => {
  if (circuitState.state === "OPEN") {
    const elapsed =
      Date.now() - circuitState.lastFailureTime;

    if (elapsed > CIRCUIT_RESET_TIMEOUT) {
      circuitState.state = "HALF_OPEN";
      logger.warn("Circuit breaker half-open");
      return false;
    }
    return true;
  }
  return false;
};

const recordSuccess = () => {
  circuitState.failures = 0;
  circuitState.state = "CLOSED";
};

const recordFailure = () => {
  circuitState.failures += 1;
  circuitState.lastFailureTime = Date.now();

  if (
    circuitState.failures >= CIRCUIT_FAILURE_THRESHOLD
  ) {
    circuitState.state = "OPEN";
    logger.error("Circuit breaker opened", {
      failures: circuitState.failures,
    });
  }
};

/* ==========================================================
   🌐 CORE REQUEST HANDLER
========================================================== */

const request = async ({
  method = "GET",
  url,
  data,
  headers = {},
  params,
  timeout = DEFAULT_TIMEOUT,
  retries = DEFAULT_MAX_RETRIES,
}) => {
  if (!url) {
    throw new Error("URL is required for HTTP request");
  }

  if (isCircuitOpen()) {
    const err = new Error(
      "External service temporarily unavailable (circuit open)"
    );
    err.code = "CIRCUIT_OPEN";
    throw err;
  }

  let attempt = 0;

  while (attempt <= retries) {
    attempt++;

    try {
      logger.info("External API request", {
        method,
        url,
        attempt,
      });

      const response = await axios({
        method,
        url,
        data,
        params,
        headers,
        timeout,
        validateStatus: () => true, // manual handling
      });

      if (response.status >= 200 && response.status < 300) {
        recordSuccess();
        return response.data;
      }

      const error = new Error(
        `External API failed with status ${response.status}`
      );
      error.response = response;
      throw error;
    } catch (error) {
      const retryable = isRetryableError(error);

      logger.warn("External API error", {
        url,
        attempt,
        retryable,
        error: error.message,
      });

      if (!retryable || attempt > retries) {
        recordFailure();
        throw error;
      }

      const delay = getBackoffDelay(attempt);
      await sleep(delay);
    }
  }
};

/* ==========================================================
   📦 CONVENIENCE METHODS
========================================================== */

const get = (url, options = {}) =>
  request({ ...options, method: "GET", url });

const post = (url, data, options = {}) =>
  request({ ...options, method: "POST", url, data });

const put = (url, data, options = {}) =>
  request({ ...options, method: "PUT", url, data });

const del = (url, options = {}) =>
  request({ ...options, method: "DELETE", url });

/* ==========================================================
   🧾 FALLBACK HANDLER (OPTIONAL)
========================================================== */

const safeRequest = async (config, fallback = null) => {
  try {
    return await request(config);
  } catch (err) {
    logger.error("External API hard failure", {
      url: config.url,
      error: err.message,
    });

    if (fallback) {
      logger.warn("Using fallback response");
      return fallback;
    }

    throw err;
  }
};

/* ==========================================================
   📤 EXPORTS
========================================================== */

module.exports = {
  request,
  safeRequest,
  get,
  post,
  put,
  delete: del,
};
