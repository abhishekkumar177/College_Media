/**
 * ============================================================
 * DLQ Manager – Dead Letter Queue Handler
 * ------------------------------------------------------------
 * ✔ Persist failed jobs
 * ✔ Full audit trail
 * ✔ Reprocessing support
 * ✔ Safe & centralized
 * ✔ Production-ready
 * ============================================================
 */

const DeadLetterJob = require("../models/DeadLetterJob");
const logger = require("./logger");

/* ============================================================
   🧠 CORE FUNCTIONS
============================================================ */

/**
 * Push failed job to DLQ
 */
const pushToDLQ = async ({
  jobName,
  jobExecutionId,
  requestId,
  payload,
  error,
  attempts,
}) => {
  try {
    const dlqJob = await DeadLetterJob.create({
      jobName,
      jobExecutionId,
      requestId,
      payload,
      errorMessage: error.message,
      errorStack: error.stack,
      attempts,
    });

    logger.error("Job moved to DLQ", {
      jobName,
      jobExecutionId,
      requestId,
      dlqId: dlqJob._id,
    });

    return dlqJob;
  } catch (err) {
    logger.critical("Failed to persist DLQ job", {
      error: err.message,
    });
  }
};

/**
 * Fetch failed jobs
 */
const getFailedJobs = async ({
  jobName,
  limit = 20,
  skip = 0,
} = {}) => {
  const filter = { status: "FAILED" };
  if (jobName) filter.jobName = jobName;

  return DeadLetterJob.find(filter)
    .sort({ failedAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Fetch single DLQ job
 */
const getDLQJobById = async (id) => {
  return DeadLetterJob.findById(id);
};

/**
 * Mark job as reprocessed
 */
const markReprocessed = async (id) => {
  return DeadLetterJob.findByIdAndUpdate(
    id,
    {
      status: "REPROCESSED",
      reprocessedAt: new Date(),
    },
    { new: true }
  );
};

/* ============================================================
   🔁 REPROCESSING
============================================================ */

/**
 * Reprocess DLQ job safely
 */
const reprocessJob = async (
  dlqJobId,
  handler
) => {
  const job = await getDLQJobById(dlqJobId);

  if (!job) {
    throw new Error("DLQ job not found");
  }

  if (job.status === "REPROCESSED") {
    throw new Error("Job already reprocessed");
  }

  try {
    logger.info("Reprocessing DLQ job", {
      jobName: job.jobName,
      dlqJobId,
    });

    await handler(job.payload);

    await markReprocessed(dlqJobId);

    logger.info("DLQ job reprocessed successfully", {
      jobName: job.jobName,
      dlqJobId,
    });
  } catch (err) {
    logger.error("DLQ job reprocessing failed", {
      dlqJobId,
      error: err.message,
    });

    throw err;
  }
};

module.exports = {
  pushToDLQ,
  getFailedJobs,
  getDLQJobById,
  reprocessJob,
};
