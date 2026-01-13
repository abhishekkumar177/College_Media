/**
 * ============================================
 * Request Metrics Middleware (Production Safe)
 * ============================================
 */

const {
  httpRequestCount,
  httpRequestDuration,
  httpErrorCount,
} = require("../utils/metrics");

module.exports = (req, res, next) => {
  // ❌ Ignore metrics endpoint itself
  if (req.path === "/metrics") {
    return next();
  }

  const startTime = process.hrtime();

  res.on("finish", () => {
    try {
      const diff = process.hrtime(startTime);
      const durationInSeconds = diff[0] + diff[1] / 1e9;

      // Normalize route to avoid high cardinality
      const route =
        req.route?.path ||
        req.baseUrl ||
        req.originalUrl.split("?")[0];

      // Group status codes (2xx / 4xx / 5xx)
      const statusGroup = `${Math.floor(res.statusCode / 100)}xx`;

      // Total request count
      httpRequestCount.inc({
        method: req.method,
        route,
        status: statusGroup,
      });

      // Latency histogram
      httpRequestDuration.observe(
        {
          method: req.method,
          route,
          status: statusGroup,
        },
        durationInSeconds
      );

      // Error counter
      if (res.statusCode >= 400) {
        httpErrorCount.inc({
          route,
          status: statusGroup,
        });
      }
    } catch (err) {
      // Metrics should NEVER break request flow
      console.error("Metrics middleware error:", err.message);
    }
  });

  next();
};
