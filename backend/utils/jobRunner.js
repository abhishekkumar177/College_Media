/**
 * ============================================
 * Background Job Runner with Retry & Backoff
 * ============================================
 */

const jobLogger = require("./jobLogger");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class JobRunner {
  constructor({
    jobName,
    handler,
    maxRetries = 3,
    backoffMs = 1000,
    backoffMultiplier = 2,
    timeoutMs = 30000,
  }) {
    this.jobName = jobName;
    this.handler = handler;
    this.maxRetries = maxRetries;
    this.backoffMs = backoffMs;
    this.backoffMultiplier = backoffMultiplier;
    this.timeoutMs = timeoutMs;
  }

  async run(payload = {}) {
    let attempt = 0;
    let delay = this.backoffMs;

    jobLogger.jobStarted(this.jobName, payload);

    while (attempt <= this.maxRetries) {
      try {
        attempt++;

        const result = await Promise.race([
          this.handler(payload),
          this._timeout(),
        ]);

        jobLogger.jobSuccess(this.jobName, attempt, result);
        return result;
      } catch (err) {
        jobLogger.jobFailed(this.jobName, attempt, err);

        if (attempt > this.maxRetries) {
          jobLogger.jobDead(this.jobName, payload, err);
          throw err;
        }

        await sleep(delay);
        delay *= this.backoffMultiplier;
      }
    }
  }

  _timeout() {
    return new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `Job "${this.jobName}" timed out after ${this.timeoutMs}ms`
            )
          ),
        this.timeoutMs
      )
    );
  }
}

module.exports = JobRunner;
