/**
 * ============================================
 * Example Background Job (Email / Sync / Cleanup)
 * ============================================
 */

const JobRunner = require("../utils/jobRunner");

const fakeAsyncTask = async ({ shouldFail }) => {
  if (shouldFail) {
    throw new Error("Simulated job failure");
  }

  // simulate async work
  await new Promise((r) => setTimeout(r, 1000));
  return { status: "done" };
};

const sampleJob = new JobRunner({
  jobName: "sample_background_job",
  handler: fakeAsyncTask,
  maxRetries: 3,
  backoffMs: 2000,
  timeoutMs: 5000,
});

module.exports = sampleJob;
