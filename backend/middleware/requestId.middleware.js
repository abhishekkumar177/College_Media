/**
 * ============================================================
 * Request Correlation ID Middleware
 * ------------------------------------------------------------
 * ✔ Generates / reuses X-Request-ID
 * ✔ Propagates requestId across async context
 * ✔ Attaches requestId to req + res
 * ✔ Ensures traceability across:
 *   - middlewares
 *   - controllers
 *   - services
 *   - DB calls
 *   - external APIs
 *   - background jobs
 * ✔ Production-ready
 * ============================================================
 */

const { randomUUID } = require("crypto");
const { AsyncLocalStorage } = require("async_hooks");

/* ============================================================
   🧠 ASYNC CONTEXT STORAGE
============================================================ */
const asyncLocalStorage = new AsyncLocalStorage();

/* ============================================================
   ⚙️ CONFIG
============================================================ */
const REQUEST_ID_HEADER = "x-request-id";
const RESPONSE_HEADER = "X-Request-ID";

/* ============================================================
   🧩 UTILS
============================================================ */

/**
 * Safely generate a UUID
 */
const generateRequestId = () => {
  try {
    return randomUUID();
  } catch (err) {
    // fallback (extremely rare)
    return (
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 10)
    );
  }
};

/**
 * Extract requestId from incoming headers
 */
const extractRequestId = (req) => {
  const headerValue =
    req.headers[REQUEST_ID_HEADER] ||
    req.headers[REQUEST_ID_HEADER.toUpperCase()];

  if (
    typeof headerValue === "string" &&
    headerValue.trim().length > 0
  ) {
    return headerValue.trim();
  }

  return null;
};

/**
 * Get requestId from async context (anywhere in app)
 */
const getRequestId = () => {
  const store = asyncLocalStorage.getStore();
  return store?.requestId || null;
};

/* ============================================================
   🧵 ASYNC CONTEXT RUNNER
============================================================ */
const runWithRequestContext = (requestId, fn) => {
  asyncLocalStorage.run({ requestId }, fn);
};

/* ============================================================
   🚦 MAIN MIDDLEWARE
============================================================ */
const requestIdMiddleware = (req, res, next) => {
  const incomingRequestId = extractRequestId(req);
  const requestId = incomingRequestId || generateRequestId();

  /**
   * Attach to request object
   */
  req.requestId = requestId;

  /**
   * Attach to response header
   */
  res.setHeader(RESPONSE_HEADER, requestId);

  /**
   * Initialize async context
   */
  runWithRequestContext(requestId, () => {
    /**
     * Log lifecycle hooks (optional but useful)
     */
    res.on("finish", () => {
      // Hook for future metrics / tracing
    });

    next();
  });
};

/* ============================================================
   🧯 ERROR HELPERS
============================================================ */

/**
 * Attach requestId to error objects
 */
const attachRequestIdToError = (err) => {
  if (!err) return err;

  if (!err.requestId) {
    err.requestId = getRequestId();
  }

  return err;
};

/* ============================================================
   🧠 SAFE EXECUTION HELPERS
============================================================ */

/**
 * Wrap async functions to preserve requestId
 */
const withRequestContext = (fn) => {
  return async (...args) => {
    const requestId = getRequestId();
    if (!requestId) {
      return fn(...args);
    }

    return asyncLocalStorage.run({ requestId }, () =>
      fn(...args)
    );
  };
};

/* ============================================================
   🧪 DEBUG UTILITIES
============================================================ */

/**
 * Dump current async context (debug only)
 */
const debugContext = () => {
  return {
    requestId: getRequestId(),
    active: !!asyncLocalStorage.getStore(),
  };
};

/* ============================================================
   📤 EXPORTS
============================================================ */
module.exports = {
  requestIdMiddleware,
  getRequestId,
  attachRequestIdToError,
  withRequestContext,
  debugContext,
};
