/**
 * ============================================================
 * REQUEST DEADLINE PROPAGATION ACROSS SERVICES – NODE.JS
 * Issue: No Request Deadline Propagation Across Services (#750)
 * ============================================================
 */

'use strict';

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

/* ============================================================
   CONFIG
============================================================ */
const CONFIG = {
  PORT: process.env.PORT || 3000,
  DEFAULT_DEADLINE_MS: 3000, // 3 seconds
  DOWNSTREAM_TIMEOUT_BUFFER_MS: 200,
};

/* ============================================================
   DEADLINE UTILITIES
============================================================ */
function now() {
  return Date.now();
}

function parseDeadline(header) {
  const value = Number(header);
  return Number.isFinite(value) ? value : null;
}

function calculateRemaining(deadline) {
  return Math.max(deadline - now(), 0);
}

/* ============================================================
   DEADLINE MIDDLEWARE (INGRESS)
============================================================ */
app.use((req, res, next) => {
  let deadline = parseDeadline(req.headers['x-request-deadline']);

  if (!deadline) {
    deadline = now() + CONFIG.DEFAULT_DEADLINE_MS;
  }

  req.deadline = deadline;

  const remaining = calculateRemaining(deadline);

  if (remaining <= 0) {
    return res.status(408).json({
      error: 'Request deadline exceeded (ingress)',
    });
  }

  res.setHeader('X-Request-Deadline', deadline);
  next();
});

/* ============================================================
   DOWNSTREAM CALL HELPER
============================================================ */
async function callDownstream(url, deadline) {
  const remaining = calculateRemaining(deadline);
  const timeout = Math.max(
    remaining - CONFIG.DOWNSTREAM_TIMEOUT_BUFFER_MS,
    0
  );

  if (timeout <= 0) {
    throw new Error('Deadline exceeded before downstream call');
  }

  return axios.get(url, {
    timeout,
    headers: {
      'X-Request-Deadline': deadline,
    },
  });
}

/* ============================================================
   MOCK DOWNSTREAM SERVICE
============================================================ */
const downstream = express();
downstream.get('/service', async (req, res) => {
  const deadline = parseDeadline(req.headers['x-request-deadline']);
  const remaining = deadline ? calculateRemaining(deadline) : null;

  if (remaining !== null && remaining <= 0) {
    return res.status(408).json({
      error: 'Request deadline exceeded (downstream)',
    });
  }

  await new Promise((r) => setTimeout(r, 500));

  res.json({
    service: 'downstream',
    remainingMs: remaining,
  });
});

downstream.listen(4001, () => {
  console.log('🔁 Downstream service running on port 4001');
});

/* ============================================================
   API ROUTES
============================================================ */
app.get('/api/aggregate', async (req, res) => {
  try {
    const response = await callDownstream(
      'http://localhost:4001/service',
      req.deadline
    );

    res.json({
      message: 'Aggregated response',
      deadline: req.deadline,
      data: response.data,
    });
  } catch (err) {
    res.status(504).json({
      error: 'Downstream timeout or deadline exceeded',
      details: err.message,
    });
  }
});

/* ============================================================
   HEALTH
============================================================ */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    now: now(),
  });
});

/* ============================================================
   SERVER
============================================================ */
app.listen(CONFIG.PORT, () => {
  console.log(
    `🚀 Request Deadline Propagation server running on port ${CONFIG.PORT}`
  );
});
