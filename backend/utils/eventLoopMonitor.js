/**
 * ======================================
 * Event Loop Lag Monitor
 * Detects blocking & logs warnings
 * ======================================
 */

const logger = require("./logger");

const LAG_THRESHOLD_MS = 200; // acceptable lag
const CHECK_INTERVAL_MS = 500;

let lastTime = process.hrtime();

const startEventLoopMonitor = () => {
  setInterval(() => {
    const diff = process.hrtime(lastTime);
    const lagMs = (diff[0] * 1e9 + diff[1]) / 1e6 - CHECK_INTERVAL_MS;

    if (lagMs > LAG_THRESHOLD_MS) {
      logger.warn("⚠️ Event loop lag detected", {
        lagMs: Math.round(lagMs),
        thresholdMs: LAG_THRESHOLD_MS,
      });
    }

    lastTime = process.hrtime();
  }, CHECK_INTERVAL_MS).unref(); // does NOT block process exit
};

module.exports = { startEventLoopMonitor };
