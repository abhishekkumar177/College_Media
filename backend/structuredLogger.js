/**
 * ============================================================
 * structuredLogger.js
 * ============================================================
 * FIXES ISSUE:
 * ❌ No Structured Logging Format
 *
 * FEATURES:
 * ✔ JSON structured logging
 * ✔ Consistent log schema
 * ✔ Request / Correlation ID
 * ✔ Service & module name
 * ✔ Error stack logging
 * ✔ Sensitive data masking
 * ✔ Express middleware support
 * ✔ Easy integration with ELK / Loki / Datadog
 * ============================================================
 */

const express = require('express');
const crypto = require('crypto');

/* ============================================================
   APP SETUP
============================================================ */

const app = express();
app.use(express.json());

const PORT = 3003;
const SERVICE_NAME = 'college-media-backend';

/* ============================================================
   LOG LEVELS
============================================================ */

const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

/* ============================================================
   SENSITIVE KEYS (MASKING)
============================================================ */

const SENSITIVE_KEYS = [
  'password',
  'token',
  'authorization',
  'secret',
  'apiKey'
];

/* ============================================================
   UTILS
============================================================ */

function generateRequestId() {
  return crypto.randomUUID();
}

function maskSensitiveData(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const masked = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      masked[key] = '***REDACTED***';
    } else if (typeof obj[key] === 'object') {
      masked[key] = maskSensitiveData(obj[key]);
    } else {
      masked[key] = obj[key];
    }
  }
  return masked;
}

/* ============================================================
   STRUCTURED LOGGER CORE
============================================================ */

class StructuredLogger {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  log(level, message, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      ...maskSensitiveData(context)
    };

    console.log(JSON.stringify(logEntry));
  }

  info(message, context) {
    this.log(LOG_LEVELS.INFO, message, context);
  }

  warn(message, context) {
    this.log(LOG_LEVELS.WARN, message, context);
  }

  error(message, context) {
    this.log(LOG_LEVELS.ERROR, message, context);
  }

  debug(message, context) {
    this.log(LOG_LEVELS.DEBUG, message, context);
  }
}

const logger = new StructuredLogger(SERVICE_NAME);

/* ============================================================
   REQUEST CONTEXT MIDDLEWARE
============================================================ */

app.use((req, res, next) => {
  req.context = {
    requestId: generateRequestId(),
    method: req.method,
    path: req.originalUrl
  };

  res.setHeader('X-Request-Id', req.context.requestId);

  const start = Date.now();

  res.on('finish', () => {
    logger.info('HTTP request completed', {
      requestId: req.context.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start
    });
  });

  next();
});

/* ============================================================
   DEMO ROUTES
============================================================ */

app.get('/success', (req, res) => {
  logger.info('Success endpoint hit', {
    requestId: req.context.requestId,
    module: 'success-route'
  });

  res.json({ message: 'Success response' });
});

app.post('/login', (req, res) => {
  logger.info('Login attempt', {
    requestId: req.context.requestId,
    module: 'auth',
    body: req.body
  });

  res.json({ message: 'Login processed' });
});

app.get('/error', (req, res) => {
  throw new Error('Simulated server crash');
});

/* ============================================================
   GLOBAL ERROR HANDLER
============================================================ */

app.use((err, req, res, next) => {
  logger.error('Unhandled application error', {
    requestId: req.context?.requestId,
    module: 'global-error-handler',
    errorMessage: err.message,
    stack: err.stack
  });

  res.status(500).json({
    message: 'Internal Server Error',
    requestId: req.context?.requestId
  });
});

/* ============================================================
   HEALTH CHECK
============================================================ */

app.get('/health', (req, res) => {
  logger.debug('Health check ping', {
    requestId: req.context.requestId
  });

  res.json({ status: 'ok' });
});

/* ============================================================
   BOOTSTRAP
============================================================ */

app.listen(PORT, () => {
  logger.info('Service started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});
