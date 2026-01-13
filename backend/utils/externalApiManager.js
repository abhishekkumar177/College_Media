/**
 * ============================================================
 * External API Manager (Advanced Orchestration Layer)
 * ------------------------------------------------------------
 * ✔ Per-service retry & timeout policies
 * ✔ Circuit breaker per external service
 * ✔ Request queue & concurrency limits
 * ✔ Exponential backoff with jitter
 * ✔ Hard execution deadline
 * ✔ Central fallback registry
 * ✔ Metrics & logging hooks
 * ✔ Built on top of httpClient
 * ============================================================
 */

const httpClient = require("./httpClient");
const logger = require("./logger");

/* ============================================================
   ⚙️ GLOBAL LIMITS
============================================================ */
const MAX_CONCURRENT_REQUESTS = 5;
const HARD_DEADLINE_MS = 15000;

/* ============================================================
   🧠 SERVICE REGISTRY
============================================================ */
const services = {};
const queues = {};
const activeRequests = {};

/* ============================================================
   🧩 REGISTER SERVICE
============================================================ */
const registerService = (name, config) => {
  services[name] = {
    retries: config.retries ?? 3,
    timeout: config.timeout ?? 5000,
    circuitBreakerThreshold: config.circuitBreakerThreshold ?? 5,
    resetTimeout: config.resetTimeout ?? 30000,
    fallback: config.fallback ?? null,
    failures: 0,
    lastFailure: null,
    state: "CLOSED", // CLOSED | OPEN | HALF_OPEN
  };

  queues[name] = [];
  activeRequests[name] = 0;

  logger.info("External service registered", { name });
};

/* ============================================================
   🚦 CIRCUIT BREAKER LOGIC
============================================================ */
const isServiceAvailable = (name) => {
  const svc = services[name];
  if (!svc) throw new Error(`Service ${name} not registered`);

  if (svc.state === "OPEN") {
    const elapsed = Date.now() - svc.lastFailure;
    if (elapsed > svc.resetTimeout) {
      svc.state = "HALF_OPEN";
      return true;
    }
    return false;
  }

  return true;
};

const recordFailure = (name) => {
  const svc = services[name];
  svc.failures += 1;
  svc.lastFailure = Date.now();

  if (svc.failures >= svc.circuitBreakerThreshold) {
    svc.state = "OPEN";
    logger.error("Circuit opened for service", { name });
  }
};

const recordSuccess = (name) => {
  const svc = services[name];
  svc.failures = 0;
  svc.state = "CLOSED";
};

/* ============================================================
   🧮 BACKOFF WITH JITTER
============================================================ */
const backoffDelay = (attempt) => {
  const base = 300 * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 100);
  return base + jitter;
};

/* ============================================================
   🧵 QUEUE PROCESSOR
============================================================ */
const processQueue = async (name) => {
  if (activeRequests[name] >= MAX_CONCURRENT_REQUESTS) return;
  const job = queues[name].shift();
  if (!job) return;

  activeRequests[name]++;

  try {
    const result = await executeRequest(name, job.config);
    job.resolve(result);
  } catch (err) {
    job.reject(err);
  } finally {
    activeRequests[name]--;
    processQueue(name);
  }
};

/* ============================================================
   🚀 EXECUTE REQUEST
============================================================ */
const executeRequest = async (serviceName, config) => {
  const svc = services[serviceName];
  if (!isServiceAvailable(serviceName)) {
    if (svc.fallback) return svc.fallback();
    throw new Error(`Service ${serviceName} unavailable`);
  }

  const start = Date.now();
  let attempt = 0;

  while (attempt <= svc.retries) {
    attempt++;

    if (Date.now() - start > HARD_DEADLINE_MS) {
      throw new Error("External API hard deadline exceeded");
    }

    try {
      const result = await httpClient.request({
        ...config,
        timeout: svc.timeout,
        retries: 0, // retries handled here
      });

      recordSuccess(serviceName);
      return result;
    } catch (err) {
      logger.warn("External API failure", {
        service: serviceName,
        attempt,
        error: err.message,
      });

      if (attempt > svc.retries) {
        recordFailure(serviceName);
        if (svc.fallback) return svc.fallback();
        throw err;
      }

      await new Promise((r) =>
        setTimeout(r, backoffDelay(attempt))
      );
    }
  }
};

/* ============================================================
   📦 PUBLIC REQUEST API
============================================================ */
const callService = (serviceName, config) => {
  if (!services[serviceName]) {
    throw new Error(`Service ${serviceName} not registered`);
  }

  return new Promise((resolve, reject) => {
    queues[serviceName].push({ config, resolve, reject });
    processQueue(serviceName);
  });
};

/* ============================================================
   📊 DEBUG / STATUS
============================================================ */
const getServiceStatus = (name) => {
  const svc = services[name];
  if (!svc) return null;

  return {
    state: svc.state,
    failures: svc.failures,
    queueLength: queues[name].length,
    active: activeRequests[name],
  };
};

/* ============================================================
   📤 EXPORTS
============================================================ */
module.exports = {
  registerService,
  callService,
  getServiceStatus,
};
