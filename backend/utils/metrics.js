/**
 * ============================================
 * Metrics Registry (Prometheus Compatible)
 * ============================================
 */

const client = require("prom-client");

// Default system metrics (CPU, memory, event loop)
client.collectDefaultMetrics({
  prefix: "college_media_",
});

// ---- Custom Metrics ----

// Total HTTP requests
const httpRequestCount = new client.Counter({
  name: "college_media_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

// Request duration
const httpRequestDuration = new client.Histogram({
  name: "college_media_http_request_duration_seconds",
  help: "HTTP request latency",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10],
});

// Error counter
const httpErrorCount = new client.Counter({
  name: "college_media_http_errors_total",
  help: "Total number of HTTP errors",
  labelNames: ["route", "status"],
});

module.exports = {
  client,
  httpRequestCount,
  httpRequestDuration,
  httpErrorCount,
};
