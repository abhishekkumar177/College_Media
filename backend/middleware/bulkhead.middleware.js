/**
 * Bulkhead Isolation Middleware
 * -----------------------------------------
 * Purpose:
 * - Prevent cascading failures
 * - Isolate heavy / failing services
 * - Separate execution pools per service
 *
 * Works with:
 * - Express.js
 * - Async task queues
 *
 * Author: Ayaanshaikh12243
 */

const { EventEmitter } = require("events");

/* ---------------------------------------------------
   CONFIGURATION
--------------------------------------------------- */

const DEFAULT_TIMEOUT = 5000; // 5 seconds
const MAX_QUEUE_SIZE = 100;

const SERVICE_CONFIG = {
  auth: {
    concurrency: 5,
    timeout: 3000
  },
  media: {
    concurrency: 2,
    timeout: 8000
  },
  analytics: {
    concurrency: 1,
    timeout: 10000
  },
  default: {
    concurrency: 3,
    timeout: 5000
  }
};

/* ---------------------------------------------------
   UTILITY FUNCTIONS
--------------------------------------------------- */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function withTimeout(promise, timeout) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Task timeout")), timeout)
    )
  ]);
}

/* ---------------------------------------------------
   TASK QUEUE IMPLEMENTATION
--------------------------------------------------- */

class TaskQueue extends EventEmitter {
  constructor(name, concurrency, timeout) {
    super();
    this.name = name;
    this.concurrency = concurrency;
    this.timeout = timeout;

    this.running = 0;
    this.queue = [];
    this.closed = false;
  }

  size() {
    return this.queue.length;
  }

  isOverloaded() {
    return this.queue.length >= MAX_QUEUE_SIZE;
  }

  async run() {
    if (this.running >= this.concurrency) return;
    if (this.queue.length === 0) return;

    const task = this.queue.shift();
    this.running++;

    try {
      await withTimeout(task(), this.timeout);
    } catch (err) {
      this.emit("error", err);
    } finally {
      this.running--;
      setImmediate(() => this.run());
    }
  }

  enqueue(task) {
    if (this.closed) {
      throw new Error("Queue is closed");
    }

    if (this.isOverloaded()) {
      throw new Error(`Bulkhead overflow in service: ${this.name}`);
    }

    this.queue.push(task);
    setImmediate(() => this.run());
  }

  shutdown() {
    this.closed = true;
    this.queue = [];
  }
}

/* ---------------------------------------------------
   BULKHEAD MANAGER
--------------------------------------------------- */

class BulkheadManager {
  constructor() {
    this.queues = {};
    this.init();
  }

  init() {
    Object.keys(SERVICE_CONFIG).forEach(service => {
      const cfg = SERVICE_CONFIG[service];
      this.queues[service] = new TaskQueue(
        service,
        cfg.concurrency,
        cfg.timeout
      );

      this.queues[service].on("error", err => {
        console.error(
          `[Bulkhead Error] Service=${service} | ${err.message}`
        );
      });
    });
  }

  getQueue(service) {
    return this.queues[service] || this.queues.default;
  }

  shutdownAll() {
    Object.values(this.queues).forEach(q => q.shutdown());
  }
}

const bulkheadManager = new BulkheadManager();

/* ---------------------------------------------------
   EXPRESS MIDDLEWARE
--------------------------------------------------- */

/**
 * Usage:
 * app.use(bulkhead("auth"))
 */
function bulkhead(serviceName = "default") {
  return function bulkheadMiddleware(req, res, next) {
    const queue = bulkheadManager.getQueue(serviceName);

    try {
      queue.enqueue(async () => {
        await new Promise((resolve, reject) => {
          let finished = false;

          res.on("finish", () => {
            if (!finished) {
              finished = true;
              resolve();
            }
          });

          res.on("close", () => {
            if (!finished) {
              finished = true;
              resolve();
            }
          });

          next();
        });
      });
    } catch (err) {
      res.status(503).json({
        error: "Service overloaded",
        service: serviceName,
        message: err.message
      });
    }
  };
}

/* ---------------------------------------------------
   FALLBACK HANDLER
--------------------------------------------------- */

function fallbackResponse(service) {
  return (req, res) => {
    res.status(503).json({
      error: "Service temporarily unavailable",
      service,
      fallback: true
    });
  };
}

/* ---------------------------------------------------
   HEALTH CHECK
--------------------------------------------------- */

function bulkheadHealth(req, res) {
  const status = {};

  Object.keys(bulkheadManager.queues).forEach(service => {
    const q = bulkheadManager.queues[service];
    status[service] = {
      running: q.running,
      queued: q.size(),
      concurrency: q.concurrency
    };
  });

  res.json({
    status: "ok",
    bulkheads: status
  });
}

/* ---------------------------------------------------
   EXAMPLE ROUTE HELPERS (OPTIONAL)
--------------------------------------------------- */

async function heavyTask(ms = 2000) {
  await sleep(ms);
}

function exampleHandler(ms) {
  return async (req, res) => {
    await heavyTask(ms);
    res.json({
      success: true,
      delay: ms
    });
  };
}

/* ---------------------------------------------------
   EXPORTS
--------------------------------------------------- */

module.exports = {
  bulkhead,
  fallbackResponse,
  bulkheadHealth,
  exampleHandler,
  bulkheadManager
};
