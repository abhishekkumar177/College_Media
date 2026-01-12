/**
 * ============================================
 * Request Metrics Middleware
 * ============================================
 */

const {
  httpRequestCount,
  httpRequestDuration,
  httpErrorCount,
} = require("../utils/metrics");

module.exports = (req, res, next) => {
  const startTime = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(startTime);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    const route = req.route?.path || req.originalUrl;
    const status = res.statusCode.toString();

    httpRequestCount.inc({
      method: req.method,
      route,
      status,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status,
      },
      durationInSeconds
    );

    if (res.statusCode >= 400) {
      httpErrorCount.inc({
        route,
        status,
      });
    }
  });

  next();
};
