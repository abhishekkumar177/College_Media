/* ============================================================
   🧠 JOB STATE MACHINE
============================================================ */
const JobRunner = require('./jobRunner');
const JOB_STATES = Object.freeze({
  IDLE: "IDLE",
  RUNNING: "RUNNING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  DEAD: "DEAD",
});

/* ============================================================
   🧠 EXECUTION HISTORY (RING BUFFER)
============================================================ */
const EXECUTION_HISTORY_LIMIT = 100;
const executionHistory = [];

const pushExecutionHistory = (record) => {
  executionHistory.push(record);
  if (executionHistory.length > EXECUTION_HISTORY_LIMIT) {
    executionHistory.shift();
  }
};

/* ============================================================
   🚦 GLOBAL CONCURRENCY CONTROL
============================================================ */
const GLOBAL_CONCURRENCY_LIMIT = 5;
let activeJobs = 0;

const acquireSlot = async () => {
  while (activeJobs >= GLOBAL_CONCURRENCY_LIMIT) {
    await sleep(100);
  }
  activeJobs++;
};

const releaseSlot = () => {
  activeJobs = Math.max(0, activeJobs - 1);
};

/* ============================================================
   ⚡ CIRCUIT BREAKER
============================================================ */
const CIRCUIT_BREAKER = {
  failures: 0,
  threshold: 5,
  cooldownMs: 30000,
  openUntil: null,
};

const isCircuitOpen = () => {
  if (!CIRCUIT_BREAKER.openUntil) return false;
  return Date.now() < CIRCUIT_BREAKER.openUntil;
};

const recordFailure = () => {
  CIRCUIT_BREAKER.failures++;
  if (CIRCUIT_BREAKER.failures >= CIRCUIT_BREAKER.threshold) {
    CIRCUIT_BREAKER.openUntil =
      Date.now() + CIRCUIT_BREAKER.cooldownMs;

    logger.critical("Circuit breaker opened", {
      cooldownMs: CIRCUIT_BREAKER.cooldownMs,
    });
  }
};

const recordSuccess = () => {
  CIRCUIT_BREAKER.failures = 0;
  CIRCUIT_BREAKER.openUntil = null;
};

/* ============================================================
   🧷 JOB PRIORITY & TAGGING
============================================================ */
const JOB_PRIORITY = Object.freeze({
  LOW: 1,
  NORMAL: 5,
  HIGH: 10,
  CRITICAL: 20,
});

/* ============================================================
   🧠 EXTEND JobRunner PROTOTYPE
============================================================ */
JobRunner.prototype._state = JOB_STATES.IDLE;
JobRunner.prototype.priority = JOB_PRIORITY.NORMAL;
JobRunner.prototype.tags = [];

/* ============================================================
   🚀 OVERRIDE RUN WITH ADVANCED GUARDS
============================================================ */
const originalRun = JobRunner.prototype.run;

JobRunner.prototype.run = async function (
  payload = {},
  context = {}
) {
  if (isCircuitOpen()) {
    throw new Error("Circuit breaker open. Job execution blocked");
  }

  await acquireSlot();
  this._state = JOB_STATES.RUNNING;

  try {
    const result = await originalRun.call(
      this,
      payload,
      context
    );

    this._state = JOB_STATES.SUCCESS;
    recordSuccess();

    pushExecutionHistory({
      jobName: this.jobName,
      state: this._state,
      timestamp: Date.now(),
    });

    return result;
  } catch (err) {
    this._state = this._cancelled
      ? JOB_STATES.CANCELLED
      : JOB_STATES.FAILED;

    recordFailure();

    pushExecutionHistory({
      jobName: this.jobName,
      state: this._state,
      error: err.message,
      timestamp: Date.now(),
    });

    throw err;
  } finally {
    releaseSlot();
  }
};

/* ============================================================
   🧪 HEALTH & DIAGNOSTICS
============================================================ */
JobRunner.getHealth = () => ({
  activeJobs,
  circuitBreaker: {
    failures: CIRCUIT_BREAKER.failures,
    openUntil: CIRCUIT_BREAKER.openUntil,
  },
  metrics,
  recentExecutions: executionHistory.slice(-10),
});

/* ============================================================
   🛑 GRACEFUL SHUTDOWN SUPPORT
============================================================ */
let shuttingDown = false;

const shutdown = async () => {
  shuttingDown = true;
  logger.warn("JobRunner shutdown initiated");

  while (activeJobs > 0) {
    await sleep(200);
  }

  logger.info("JobRunner shutdown complete");
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

/* ============================================================
   🧠 MEMORY SAFETY GUARD
============================================================ */
setInterval(() => {
  if (executionHistory.length > EXECUTION_HISTORY_LIMIT) {
    executionHistory.splice(
      0,
      executionHistory.length - EXECUTION_HISTORY_LIMIT
    );
  }
}, 60000);

/* ============================================================
   📤 EXTENDED EXPORTS (NON-BREAKING)
============================================================ */
JobRunner.JOB_STATES = JOB_STATES;
JobRunner.JOB_PRIORITY = JOB_PRIORITY;
JobRunner.shutdown = shutdown;
