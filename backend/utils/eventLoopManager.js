/**
 * =====================================================
 * Event Loop Manager
 * - Lag Monitoring
 * - Worker Thread Pool
 * - Slow Request Detection
 * =====================================================
 */

const { Worker } = require("worker_threads");
const os = require("os");
const logger = require("./logger");

/* =====================================================
   ⚙️ CONFIG
===================================================== */
const LAG_THRESHOLD_MS = 200;
const CHECK_INTERVAL_MS = 500;
const SLOW_REQUEST_MS = 3000;
const MAX_WORKERS = Math.max(2, os.cpus().length - 1);

/* =====================================================
   🔍 EVENT LOOP LAG MONITOR
===================================================== */
let lastCheck = process.hrtime();

const startEventLoopMonitor = () => {
  setInterval(() => {
    const diff = process.hrtime(lastCheck);
    const elapsedMs = (diff[0] * 1e9 + diff[1]) / 1e6;
    const lag = elapsedMs - CHECK_INTERVAL_MS;

    if (lag > LAG_THRESHOLD_MS) {
      logger.warn("⚠️ Event loop lag detected", {
        lagMs: Math.round(lag),
        thresholdMs: LAG_THRESHOLD_MS,
        memory: process.memoryUsage().rss,
        load: os.loadavg(),
      });
    }

    lastCheck = process.hrtime();
  }, CHECK_INTERVAL_MS).unref();
};

/* =====================================================
   🧵 WORKER THREAD POOL
===================================================== */
class WorkerPool {
  constructor(workerPath, size = MAX_WORKERS) {
    this.workerPath = workerPath;
    this.size = size;
    this.queue = [];
    this.workers = [];
    this.activeWorkers = 0;

    for (let i = 0; i < size; i++) {
      this.workers.push(this.createWorker());
    }

    logger.info("Worker pool initialized", {
      workers: size,
      cpuCores: os.cpus().length,
    });
  }

  createWorker() {
    const worker = new Worker(this.workerPath);

    worker.on("message", (result) => {
      worker.currentTask?.resolve(result);
      worker.currentTask = null;
      this.activeWorkers--;
      this.runNext();
    });

    worker.on("error", (err) => {
      logger.error("Worker error", { error: err.message });
      worker.currentTask?.reject(err);
      worker.currentTask = null;
      this.activeWorkers--;
      this.runNext();
    });

    return worker;
  }

  runNext() {
    if (this.queue.length === 0) return;
    if (this.activeWorkers >= this.size) return;

    const worker = this.workers.find(w => !w.currentTask);
    if (!worker) return;

    const task = this.queue.shift();
    worker.currentTask = task;
    this.activeWorkers++;

    worker.postMessage(task.payload);
  }

  execute(payload) {
    return new Promise((resolve, reject) => {
      this.queue.push({ payload, resolve, reject });
      this.runNext();
    });
  }
}

/* =====================================================
   🚦 SLOW REQUEST DETECTOR (MIDDLEWARE)
===================================================== */
const slowRequestGuard = (req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;

    if (durationMs > SLOW_REQUEST_MS) {
      logger.warn("🐢 Slow request handler", {
        method: req.method,
        url: req.originalUrl,
        durationMs: Math.round(durationMs),
        user: req.user?.id || "anonymous",
      });
    }
  });

  next();
};

/* =====================================================
   🧠 CPU TASK HELPER
===================================================== */
let cpuWorkerPool = null;

const initCPUTaskPool = () => {
  if (!cpuWorkerPool) {
    cpuWorkerPool = new WorkerPool(
      require.resolve("../workers/cpu.worker.js")
    );
  }
};

const runCPUTask = async (payload) => {
  if (!cpuWorkerPool) initCPUTaskPool();
  return cpuWorkerPool.execute(payload);
};

/* =====================================================
   📦 EXPORTS
===================================================== */
module.exports = {
  startEventLoopMonitor,
  slowRequestGuard,
  runCPUTask,
};
