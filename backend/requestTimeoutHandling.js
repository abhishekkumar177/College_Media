/**
 * ============================================================
 * Request Timeout Handling – Complete Backend Implementation
 * ============================================================
 *
 * Covers:
 * - Global request timeout middleware
 * - API timeout using AbortController
 * - Database query timeout simulation
 * - External service timeout
 * - Cleanup on timeout
 * - Centralized error handling
 *
 * Tech Stack:
 * Node.js, Express
 *
 * ------------------------------------------------------------
 */

/* ===========================
   Imports & App Setup
=========================== */

const express = require('express');
const http = require('http');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());

/* ===========================
   Constants & Config
=========================== */

const SERVER_PORT = 3000;

// Global request timeout (ms)
const GLOBAL_REQUEST_TIMEOUT = 8000;

// External API timeout (ms)
const EXTERNAL_API_TIMEOUT = 4000;

// Database query timeout (ms)
const DB_QUERY_TIMEOUT = 3000;

/* ===========================
   Utility Functions
=========================== */

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return crypto.randomUUID();
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ===========================
   Custom Error Classes
=========================== */

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
    this.statusCode = 504;
  }
}

class DatabaseTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseTimeoutError';
    this.statusCode = 504;
  }
}

class ExternalServiceTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExternalServiceTimeoutError';
    this.statusCode = 504;
  }
}

/* ===========================
   Global Request Timeout Middleware
=========================== */

function requestTimeoutMiddleware(timeoutMs) {
  return (req, res, next) => {
    const requestId = generateRequestId();
    req.requestId = requestId;

    const timeoutHandle = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          error: 'Request Timeout',
          message: 'Request took too long to process',
          requestId
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeoutHandle);
    });

    res.on('close', () => {
      clearTimeout(timeoutHandle);
    });

    next();
  };
}

app.use(requestTimeoutMiddleware(GLOBAL_REQUEST_TIMEOUT));

/* ===========================
   Simulated Database Layer
=========================== */

async function fakeDatabaseQuery(query, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Simulate unpredictable DB delay
    const randomDelay = Math.floor(Math.random() * 5000);
    await sleep(randomDelay);

    if (controller.signal.aborted) {
      throw new DatabaseTimeoutError('Database query timed out');
    }

    return {
      data: {
        query,
        delay: randomDelay
      }
    };
  } finally {
    clearTimeout(timer);
  }
}

/* ===========================
   External API Call Handler
=========================== */

async function callExternalService(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await axios.get(url, {
      signal: controller.signal
    });
    return response.data;
  } catch (err) {
    if (controller.signal.aborted) {
      throw new ExternalServiceTimeoutError('External API timeout');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/* ===========================
   Routes
=========================== */

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    requestId: req.requestId
  });
});

/**
 * Slow database route
 */
app.get('/db-test', async (req, res, next) => {
  try {
    const result = await fakeDatabaseQuery(
      'SELECT * FROM users',
      DB_QUERY_TIMEOUT
    );

    res.json({
      success: true,
      data: result,
      requestId: req.requestId
    });
  } catch (err) {
    next(err);
  }
});

/**
 * External API test route
 */
app.get('/external-test', async (req, res, next) => {
  try {
    const data = await callExternalService(
      'https://jsonplaceholder.typicode.com/posts/1',
      EXTERNAL_API_TIMEOUT
    );

    res.json({
      success: true,
      data,
      requestId: req.requestId
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Artificially slow route
 */
app.get('/slow-route', async (req, res) => {
  await sleep(15000); // deliberately slow
  res.json({
    success: true,
    message: 'This should timeout',
    requestId: req.requestId
  });
});

/* ===========================
   Centralized Error Handler
=========================== */

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'Something went wrong',
    requestId: req.requestId
  });
});

/* ===========================
   Server Setup
=========================== */

const server = http.createServer(app);

// Hard server timeout (Node-level)
server.setTimeout(GLOBAL_REQUEST_TIMEOUT + 2000);

server.listen(SERVER_PORT, () => {
  console.log(`🚀 Server running on port ${SERVER_PORT}`);
});

/* ===========================
   Graceful Shutdown
=========================== */

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

/* ===========================
   End of File
=========================== */
