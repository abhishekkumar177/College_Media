/**
 * ============================================================================
 * NON-BLOCKING I/O OPERATIONS – SINGLE FILE IMPLEMENTATION
 * ============================================================================
 *
 * ✔ Removes blocking I/O from request cycle
 * ✔ Async file system operations
 * ✔ Worker threads for CPU heavy tasks
 * ✔ Background job queue (in-memory)
 * ✔ Caching for frequent reads
 * ✔ Request timeout protection
 * ✔ Event loop safe design
 *
 * Issue: Blocking I/O Operations in Request Cycle
 * Severity: HIGH
 * ============================================================================
 */

const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

/* ============================================================================
   CONFIGURATION
============================================================================ */

const CONFIG = {
  REPORT_PATH: path.join(__dirname, 'report.json'),
  CACHE_TTL_MS: 30 * 1000,
  JOB_POLL_INTERVAL: 1000,
  REQUEST_TIMEOUT_MS: 5000,
};

/* ============================================================================
   SIMPLE IN-MEMORY CACHE
============================================================================ */

const cache = new Map();

function setCache(key, value, ttl) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

/* ============================================================================
   BACKGROUND JOB QUEUE
============================================================================ */

const jobQueue = [];
const jobResults = new Map();
let jobIdCounter = 1;

function enqueueJob(type, payload) {
  const id = jobIdCounter++;
  jobQueue.push({ id, type, payload, status: 'pending' });
  return id;
}

function processJobs() {
  if (jobQueue.length === 0) return;

  const job = jobQueue.shift();
  job.status = 'processing';

  if (job.type === 'heavy-computation') {
    runWorker(job.id, job.payload);
  }
}

setInterval(processJobs, CONFIG.JOB_POLL_INTERVAL);

/* ============================================================================
   WORKER THREAD HANDLING (CPU-BOUND TASKS)
============================================================================ */

function runWorker(jobId, payload) {
  const worker = new Worker(__filename, {
    workerData: payload,
  });

  worker.on('message', (result) => {
    jobResults.set(jobId, {
      status: 'completed',
      result,
    });
  });

  worker.on('error', (err) => {
    jobResults.set(jobId, {
      status: 'failed',
      error: err.message,
    });
  });
}

/* ============================================================================
   WORKER THREAD CODE
============================================================================ */

if (!isMainThread) {
  // Simulate heavy CPU work
  let hash = '';
  for (let i = 0; i < 5e7; i++) {
    hash = crypto
      .createHash('sha256')
      .update(workerData.input + i)
      .digest('hex');
  }

  parentPort.postMessage({
    hash,
    processedAt: new Date().toISOString(),
  });
}

/* ============================================================================
   EXPRESS APP
============================================================================ */

if (isMainThread) {
  const app = express();
  app.use(express.json());

  /* ==========================================================================
     REQUEST TIMEOUT MIDDLEWARE
  ========================================================================== */

  app.use((req, res, next) => {
    res.setTimeout(CONFIG.REQUEST_TIMEOUT_MS, () => {
      res.status(503).json({
        success: false,
        message: 'Request timeout',
      });
    });
    next();
  });

  /* ==========================================================================
     NON-BLOCKING FILE READ (FIX)
  ========================================================================== */

  app.get('/report', async (req, res, next) => {
    try {
      // Cache first
      const cached = getCache('report');
      if (cached) {
        return res.json({
          success: true,
          source: 'cache',
          data: cached,
        });
      }

      // Async I/O (NON-BLOCKING)
      const fileData = await fs.readFile(CONFIG.REPORT_PATH, 'utf8');
      const parsed = JSON.parse(fileData);

      setCache('report', parsed, CONFIG.CACHE_TTL_MS);

      res.json({
        success: true,
        source: 'fs',
        data: parsed,
      });
    } catch (err) {
      next(err);
    }
  });

  /* ==========================================================================
     BACKGROUND HEAVY TASK (NON-BLOCKING)
  ========================================================================== */

  app.post('/generate-report', (req, res) => {
    const jobId = enqueueJob('heavy-computation', {
      input: req.body.input || 'default',
    });

    res.status(202).json({
      success: true,
      message: 'Report generation started',
      jobId,
    });
  });

  /* ==========================================================================
     JOB STATUS ENDPOINT
  ========================================================================== */

  app.get('/jobs/:id', (req, res) => {
    const jobId = Number(req.params.id);
    const result = jobResults.get(jobId);

    if (!result) {
      return res.status(202).json({
        success: true,
        status: 'processing',
      });
    }

    res.json({
      success: true,
      ...result,
    });
  });

  /* ==========================================================================
     ASYNC BATCH FILE WRITE (FIX)
  ========================================================================== */

  app.post('/export', async (req, res, next) => {
    try {
      const outputPath = path.join(
        __dirname,
        `export-${Date.now()}.json`
      );

      // Async write (NON-BLOCKING)
      await fs.writeFile(
        outputPath,
        JSON.stringify(req.body, null, 2),
        'utf8'
      );

      res.status(201).json({
        success: true,
        message: 'Export queued successfully',
        file: path.basename(outputPath),
      });
    } catch (err) {
      next(err);
    }
  });

  /* ==========================================================================
     EVENT LOOP SAFE HEALTH CHECK
  ========================================================================== */

  app.get('/health', async (req, res) => {
    res.json({
      success: true,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeJobs: jobQueue.length,
    });
  });

  /* ==========================================================================
     ERROR HANDLER
  ========================================================================== */

  app.use((err, req, res, next) => {
    console.error('[NON_BLOCKING_IO_ERROR]', err);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  });

  /* ==========================================================================
     SERVER
  ========================================================================== */

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(
      `⚡ Non-Blocking I/O API running on port ${PORT}`
    );
  });
}

/**
 * ============================================================================
 * WHAT THIS FIX ACHIEVES
 * ============================================================================
 *
 * ❌ Removed fs.readFileSync / writeFileSync
 * ❌ Removed CPU heavy loops from request handlers
 *
 * ✅ Async fs.promises used
 * ✅ Worker threads for heavy computation
 * ✅ Background job queue
 * ✅ Cache to reduce repeated I/O
 * ✅ Request timeout protection
 * ✅ Event loop safe APIs
 *
 * ============================================================================
 * END OF FILE
 * ============================================================================
 */
