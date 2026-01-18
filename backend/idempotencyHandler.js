/**
 * ============================================================
 * Idempotency Handling for Critical API Requests
 * ============================================================
 *
 * Covers:
 * - Idempotency-Key based request de-duplication
 * - Safe retries
 * - Locking to avoid race conditions
 * - Cache expiry
 * - Payment / Order / Form APIs
 *
 * Tech Stack:
 * Node.js, Express
 *
 * ------------------------------------------------------------
 */

const express = require('express');
const crypto = require('crypto');
const http = require('http');

const app = express();
app.use(express.json());

/* ============================================================
   CONFIGURATION
============================================================ */

const PORT = 4000;

// Idempotency record expiry (15 minutes)
const IDEMPOTENCY_EXPIRY_MS = 15 * 60 * 1000;

// Request lock timeout
const LOCK_TIMEOUT_MS = 5000;

/* ============================================================
   IN-MEMORY IDEMPOTENCY STORE
   (Replace with Redis in production)
============================================================ */

class IdempotencyStore {
  constructor() {
    this.store = new Map();
    this.locks = new Map();
  }

  generateKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  acquireLock(key) {
    if (this.locks.has(key)) return false;
    this.locks.set(key, Date.now());
    return true;
  }

  releaseLock(key) {
    this.locks.delete(key);
  }

  set(key, value) {
    this.store.set(key, {
      value,
      createdAt: Date.now()
    });
  }

  get(key) {
    const record = this.store.get(key);
    if (!record) return null;

    if (Date.now() - record.createdAt > IDEMPOTENCY_EXPIRY_MS) {
      this.store.delete(key);
      return null;
    }

    return record.value;
  }

  exists(key) {
    return this.get(key) !== null;
  }

  cleanup() {
    for (const [key, record] of this.store.entries()) {
      if (Date.now() - record.createdAt > IDEMPOTENCY_EXPIRY_MS) {
        this.store.delete(key);
      }
    }
  }
}

const idempotencyStore = new IdempotencyStore();

/* ============================================================
   UTILITY FUNCTIONS
============================================================ */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateRequestId() {
  return crypto.randomUUID();
}

/* ============================================================
   CUSTOM ERRORS
============================================================ */

class IdempotencyError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

/* ============================================================
   IDEMPOTENCY MIDDLEWARE
============================================================ */

function idempotencyMiddleware(req, res, next) {
  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey) {
    throw new ValidationError('Missing Idempotency-Key header');
  }

  const hashedKey = idempotencyStore.generateKey(
    `${req.method}:${req.originalUrl}:${idempotencyKey}`
  );

  req.idempotencyKey = hashedKey;

  const cachedResponse = idempotencyStore.get(hashedKey);
  if (cachedResponse) {
    return res.status(200).json({
      success: true,
      duplicate: true,
      data: cachedResponse
    });
  }

  if (!idempotencyStore.acquireLock(hashedKey)) {
    throw new IdempotencyError('Request already in progress');
  }

  res.on('finish', () => {
    idempotencyStore.releaseLock(hashedKey);
  });

  next();
}

/* ============================================================
   SIMULATED DATABASE OPERATIONS
============================================================ */

async function createPayment(amount) {
  await sleep(1500);
  return {
    paymentId: crypto.randomUUID(),
    amount,
    status: 'SUCCESS'
  };
}

async function createOrder(items) {
  await sleep(1200);
  return {
    orderId: crypto.randomUUID(),
    items,
    status: 'CREATED'
  };
}

async function submitForm(data) {
  await sleep(800);
  return {
    submissionId: crypto.randomUUID(),
    data,
    status: 'SUBMITTED'
  };
}

/* ============================================================
   ROUTES
============================================================ */

/**
 * Health
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

/**
 * Payment API (CRITICAL)
 */
app.post('/payments', idempotencyMiddleware, async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount) throw new ValidationError('Amount is required');

    const result = await createPayment(amount);

    idempotencyStore.set(req.idempotencyKey, result);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Order Creation API (CRITICAL)
 */
app.post('/orders', idempotencyMiddleware, async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      throw new ValidationError('Items array required');
    }

    const result = await createOrder(items);

    idempotencyStore.set(req.idempotencyKey, result);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Form Submission API (CRITICAL)
 */
app.post('/forms/submit', idempotencyMiddleware, async (req, res, next) => {
  try {
    const result = await submitForm(req.body);

    idempotencyStore.set(req.idempotencyKey, result);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

/* ============================================================
   ERROR HANDLING
============================================================ */

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;

  res.status(status).json({
    success: false,
    error: err.message
  });
});

/* ============================================================
   SERVER
============================================================ */

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* ============================================================
   CLEANUP JOB
============================================================ */

setInterval(() => {
  idempotencyStore.cleanup();
}, 60 * 1000);

/* ============================================================
   END OF FILE
============================================================ *///// chhecking again and gain 