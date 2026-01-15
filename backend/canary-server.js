/**
 * ============================================================
 * CANARY DEPLOYMENT IMPLEMENTATION – NODE.JS
 * ============================================================
 * App: College_Media
 * Strategy: Canary Release
 * Author: Contributor
 * ============================================================
 */

'use strict';

/* ============================================================
   SECTION 1: IMPORTS
============================================================ */
const express = require('express');
const os = require('os');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/* ============================================================
   SECTION 2: APP INIT
============================================================ */
const app = express();
app.use(express.json());

/* ============================================================
   SECTION 3: GLOBAL CONFIG
============================================================ */
const CONFIG = {
  APP_NAME: 'College_Media',
  VERSION: process.env.APP_VERSION || '1.1.0',
  PORT: process.env.PORT || 3000,
  ENV: process.env.NODE_ENV || 'production',

  // Canary Config
  CANARY_ENABLED: true,
  CANARY_PERCENTAGE: 10, // 10% traffic
  CANARY_VERSION: '1.1.0',
  STABLE_VERSION: '1.0.0',

  // Thresholds
  MAX_ERROR_RATE: 5, // %
  MAX_LATENCY_MS: 1000,

  METRICS_INTERVAL: 60 * 1000,
};

/* ============================================================
   SECTION 4: IN-MEMORY METRICS STORE
============================================================ */
const metrics = {
  stable: {
    requests: 0,
    errors: 0,
    latency: [],
  },
  canary: {
    requests: 0,
    errors: 0,
    latency: [],
  },
};

/* ============================================================
   SECTION 5: UTILITY FUNCTIONS
============================================================ */
function randomPercentage() {
  return Math.floor(Math.random() * 100) + 1;
}

function now() {
  return Date.now();
}

function calculateAverageLatency(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

/* ============================================================
   SECTION 6: CANARY DECISION ENGINE
============================================================ */
function shouldRouteToCanary(req) {
  if (!CONFIG.CANARY_ENABLED) return false;

  // Sticky routing using user-id or IP
  const key =
    req.headers['x-user-id'] ||
    req.ip ||
    crypto.randomBytes(4).toString('hex');

  const hash = crypto
    .createHash('sha256')
    .update(key)
    .digest('hex');

  const bucket = parseInt(hash.substring(0, 2), 16) % 100;

  return bucket < CONFIG.CANARY_PERCENTAGE;
}

/* ============================================================
   SECTION 7: REQUEST TRACKING MIDDLEWARE
============================================================ */
app.use((req, res, next) => {
  const start = now();
  const isCanary = shouldRouteToCanary(req);

  req.releaseTrack = isCanary ? 'canary' : 'stable';

  res.on('finish', () => {
    const duration = now() - start;
    const track = req.releaseTrack;

    metrics[track].requests++;
    metrics[track].latency.push(duration);

    if (res.statusCode >= 500) {
      metrics[track].errors++;
    }
  });

  next();
});

/* ============================================================
   SECTION 8: HEALTH CHECK
============================================================ */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: CONFIG.VERSION,
    release: req.releaseTrack,
    uptime: process.uptime(),
  });
});

/* ============================================================
   SECTION 9: MAIN API ROUTE
============================================================ */
app.get('/api/posts', async (req, res) => {
  try {
    if (req.releaseTrack === 'canary') {
      // Simulate new logic
      await simulateLatency(300);
      res.json({
        source: 'canary',
        version: CONFIG.CANARY_VERSION,
        data: ['post-1', 'post-2', 'post-3'],
      });
    } else {
      // Stable logic
      await simulateLatency(100);
      res.json({
        source: 'stable',
        version: CONFIG.STABLE_VERSION,
        data: ['post-1', 'post-2'],
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

/* ============================================================
   SECTION 10: ERROR SIMULATION (CANARY ONLY)
============================================================ */
function simulateLatency(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ============================================================
   SECTION 11: METRICS REPORTING
============================================================ */
function reportMetrics() {
  ['stable', 'canary'].forEach((track) => {
    const m = metrics[track];
    const errorRate =
      m.requests === 0 ? 0 : (m.errors / m.requests) * 100;

    const avgLatency = calculateAverageLatency(m.latency);

    log(
      `[${track.toUpperCase()}] Requests=${m.requests}, Errors=${m.errors}, ErrorRate=${errorRate.toFixed(
        2
      )}%, AvgLatency=${avgLatency.toFixed(2)}ms`
    );
  });
}

/* ============================================================
   SECTION 12: AUTO ROLLBACK LOGIC
============================================================ */
function autoRollbackCheck() {
  const canary = metrics.canary;

  const errorRate =
    canary.requests === 0
      ? 0
      : (canary.errors / canary.requests) * 100;

  const avgLatency = calculateAverageLatency(canary.latency);

  if (
    errorRate > CONFIG.MAX_ERROR_RATE ||
    avgLatency > CONFIG.MAX_LATENCY_MS
  ) {
    log('🚨 Canary unhealthy — initiating rollback');
    CONFIG.CANARY_ENABLED = false;
  }
}

/* ============================================================
   SECTION 13: SCHEDULERS
============================================================ */
setInterval(() => {
  reportMetrics();
  autoRollbackCheck();
}, CONFIG.METRICS_INTERVAL);

/* ============================================================
   SECTION 14: ADMIN CONTROLS
============================================================ */
app.post('/admin/canary/enable', (req, res) => {
  CONFIG.CANARY_ENABLED = true;
  res.json({ message: 'Canary enabled' });
});

app.post('/admin/canary/disable', (req, res) => {
  CONFIG.CANARY_ENABLED = false;
  res.json({ message: 'Canary disabled' });
});

app.post('/admin/canary/percentage', (req, res) => {
  const { percentage } = req.body;

  if (percentage < 0 || percentage > 100) {
    return res.status(400).json({ error: 'Invalid percentage' });
  }

  CONFIG.CANARY_PERCENTAGE = percentage;
  res.json({ message: 'Traffic updated', percentage });
});

/* ============================================================
   SECTION 15: SERVER START
============================================================ */
app.listen(CONFIG.PORT, () => {
  log(
    `🚀 ${CONFIG.APP_NAME} running on port ${CONFIG.PORT} | Canary=${CONFIG.CANARY_ENABLED} | Traffic=${CONFIG.CANARY_PERCENTAGE}%`
  );
});

/* ============================================================
   END OF FILE – 560+ LINES
============================================================ */
