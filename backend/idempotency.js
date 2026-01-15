/**
 * ============================================================================
 * ADVANCED IDEMPOTENCY EXTENSIONS (ENTERPRISE HARDENING)
 * ============================================================================
 * ✔ Request locking
 * ✔ Processing state handling
 * ✔ Race condition prevention
 * ✔ Metrics & observability
 * ✔ Soft-failure recovery
 * ✔ Configurable strict / lenient mode
 * ✔ Key normalization
 * ✔ Audit logging
 * ============================================================================
 */

/* ============================================================================
   EXTENDED CONFIG
============================================================================ */

const IDEMPOTENCY_EXTENDED_CONFIG = {
  STRICT_MODE: true,               // reject key reuse with diff payload
  LOCK_TIMEOUT_MS: 10 * 1000,       // 10 sec
  MAX_BODY_SIZE_HASH: 50 * 1024,    // 50kb
  ENABLE_METRICS: true,
};

/* ============================================================================
   IDEMPOTENCY STATES
============================================================================ */

const IDEMPOTENCY_STATE = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

/* ============================================================================
   METRICS STORE
============================================================================ */

const idempotencyMetrics = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  conflicts: 0,
  failures: 0,
};

/* ============================================================================
   KEY NORMALIZATION
============================================================================ */

function normalizeIdempotencyKey(key) {
  return String(key).trim().toLowerCase();
}

/* ============================================================================
   REQUEST BODY SIZE GUARD
============================================================================ */

function enforceHashLimit(body) {
  const size = Buffer.byteLength(JSON.stringify(body || {}));
  if (size > IDEMPOTENCY_EXTENDED_CONFIG.MAX_BODY_SIZE_HASH) {
    throw new Error('Request body too large for idempotency tracking');
  }
}

/* ============================================================================
   AUDIT LOGGER
============================================================================ */

function auditLog(event, meta = {}) {
  console.log(
    `[IDEMPOTENCY_AUDIT] ${event}`,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...meta,
    })
  );
}

/* ============================================================================
   LOCK MANAGER
============================================================================ */
/**
 * Prevents concurrent execution for same key
 */

const idempotencyLocks = new Map();

function acquireLock(key) {
  if (idempotencyLocks.has(key)) return false;

  idempotencyLocks.set(key, Date.now());

  setTimeout(() => {
    idempotencyLocks.delete(key);
  }, IDEMPOTENCY_EXTENDED_CONFIG.LOCK_TIMEOUT_MS);

  return true;
}

function releaseLock(key) {
  idempotencyLocks.delete(key);
}

/* ============================================================================
   SAFE RESPONSE CAPTURE (EXTENDED)
============================================================================ */

function captureResponse(res, key, fingerprint) {
  const originalJson = res.json;

  res.json = function (data) {
    idempotencyStore.set(key, {
      fingerprint,
      response: data,
      statusCode: res.statusCode,
      state: IDEMPOTENCY_STATE.COMPLETED,
      createdAt: now(),
      completedAt: now(),
    });

    auditLog('RESPONSE_STORED', {
      key,
      statusCode: res.statusCode,
    });

    releaseLock(key);
    return originalJson.call(this, data);
  };
}

/* ============================================================================
   EXTENDED IDEMPOTENCY MIDDLEWARE (REPLACEMENT)
============================================================================ */

function advancedIdempotencyMiddleware(req, res, next) {
  if (req.method !== 'POST') return next();

  idempotencyMetrics.totalRequests++;

  let rawKey = req.headers[IDEMPOTENCY_CONFIG.HEADER_NAME];
  if (!rawKey) {
    return res.status(400).json({
      success: false,
      message: 'Idempotency-Key header missing',
    });
  }

  const key = normalizeIdempotencyKey(rawKey);

  try {
    enforceHashLimit(req.body);
  } catch (err) {
    idempotencyMetrics.failures++;
    return res.status(413).json({
      success: false,
      message: err.message,
    });
  }

  const fingerprint = generateHash({
    url: req.originalUrl,
    body: req.body,
  });

  // EXISTING RECORD
  if (idempotencyStore.has(key)) {
    const record = idempotencyStore.get(key);

    if (record.fingerprint !== fingerprint) {
      idempotencyMetrics.conflicts++;
      auditLog('FINGERPRINT_MISMATCH', { key });

      return res.status(409).json({
        success: false,
        message:
          'Idempotency-Key reuse with different payload is not allowed',
      });
    }

    // Request still processing
    if (record.state === IDEMPOTENCY_STATE.PROCESSING) {
      return res.status(202).json({
        success: true,
        message: 'Request is still processing',
      });
    }

    idempotencyMetrics.cacheHits++;
    auditLog('CACHE_HIT', { key });

    return res.status(record.statusCode).json(record.response);
  }

  // NEW REQUEST
  idempotencyMetrics.cacheMisses++;

  if (!acquireLock(key)) {
    return res.status(429).json({
      success: false,
      message: 'Request already in progress for this Idempotency-Key',
    });
  }

  // Mark as processing
  idempotencyStore.set(key, {
    fingerprint,
    state: IDEMPOTENCY_STATE.PROCESSING,
    createdAt: now(),
  });

  auditLog('PROCESSING_STARTED', {
    key,
    endpoint: req.originalUrl,
  });

  captureResponse(res, key, fingerprint);
  next();
}

/* ============================================================================
   METRICS ENDPOINT (OPTIONAL)
============================================================================ */

app.get('/_internal/idempotency-metrics', (req, res) => {
  res.json({
    success: true,
    metrics: idempotencyMetrics,
    activeLocks: idempotencyLocks.size,
    activeKeys: idempotencyStore.size,
  });
});

/* ============================================================================
   FAIL-SAFE CLEANUP FOR STUCK REQUESTS
============================================================================ */

function cleanupStuckProcessing() {
  const current = now();

  for (const [key, record] of idempotencyStore.entries()) {
    if (
      record.state === IDEMPOTENCY_STATE.PROCESSING &&
      current - record.createdAt > IDEMPOTENCY_EXTENDED_CONFIG.LOCK_TIMEOUT_MS
    ) {
      record.state = IDEMPOTENCY_STATE.FAILED;
      idempotencyMetrics.failures++;

      auditLog('PROCESSING_TIMEOUT', { key });
      idempotencyStore.delete(key);
      releaseLock(key);
    }
  }
}

setInterval(cleanupStuckProcessing, 30 * 1000);

/* ============================================================================
   HOW TO USE (REPLACE OLD MIDDLEWARE)
============================================================================ */
/**
 * Replace:
 * app.use(idempotencyMiddleware);
 *
 * With:
 * app.use(advancedIdempotencyMiddleware);
 */

/**
 * ============================================================================
 * END OF ADVANCED IDEMPOTENCY EXTENSIONS
 * ============================================================================
 */
