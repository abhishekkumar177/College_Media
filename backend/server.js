/**
 * ============================================================
 *  College Media – Backend Server
 *  (HARDENED + OBSERVABLE + CSRF PROTECTED)
 * ============================================================
 * ✔ Correlation ID
 * ✔ Structured Request Logging
 * ✔ Metrics
 * ✔ Slow Request Detection
 * ✔ CSRF Protection (Double Submit Cookie)
 * ============================================================
 */

"use strict";

/* ============================================================
   📦 CORE DEPENDENCIES
============================================================ */
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const os = require("os");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const passport = require("passport");
const crypto = require("crypto");
const { randomUUID } = require("crypto");

/* ============================================================
   🔧 INTERNAL IMPORTS
============================================================ */
const { initDB } = require("./config/db");
const { notFound } = require("./middleware/errorMiddleware");
const logger = require("./utils/logger");

const resumeRoutes = require("./routes/resume");
const uploadRoutes = require("./routes/upload");

const {
  globalLimiter,
  authLimiter,
  searchLimiter,
  adminLimiter,
} = require("./middleware/rateLimiter");

const { slidingWindowLimiter } = require("./middleware/slidingWindowLimiter");
const { warmUpCache } = require("./utils/cache");

const metricsMiddleware = require("./middleware/metrics.middleware");
const { client: metricsClient } = require("./utils/metrics");

/* ============================================================
   🌱 ENV SETUP
============================================================ */
dotenv.config();

const ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 5000;
const TRUST_PROXY = process.env.TRUST_PROXY === "true";
const METRICS_TOKEN = process.env.METRICS_TOKEN || "metrics-secret";

/* ============================================================
   🛡️ CSRF CONFIG
============================================================ */
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

/* ============================================================
   🚀 APP INIT
============================================================ */
const app = express();
const server = http.createServer(app);

if (TRUST_PROXY) app.set("trust proxy", 1);
app.disable("x-powered-by");

/* ============================================================
   🔐 SECURITY MIDDLEWARE
============================================================ */
app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(passport.initialize());

/* ============================================================
   🔍 CORRELATION ID
============================================================ */
app.use((req, res, next) => {
  const cid = req.headers["x-correlation-id"] || randomUUID();
  req.correlationId = cid;
  res.setHeader("X-Correlation-ID", cid);
  next();
});

/* ============================================================
   🧾 REQUEST LOGGER
============================================================ */
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const duration =
      Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info("HTTP request", {
      correlationId: req.correlationId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(duration),
    });
  });
  next();
});

/* ============================================================
   🔐 CSRF TOKEN GENERATOR
============================================================ */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

/* ============================================================
   🍪 CSRF COOKIE ISSUER
============================================================ */
app.use((req, res, next) => {
  let token = req.cookies[CSRF_COOKIE_NAME];

  if (!token) {
    token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false,            // frontend reads
      secure: ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  }

  req.csrfToken = token;
  next();
});

/* ============================================================
   🛡️ CSRF VALIDATION
============================================================ */
app.use((req, res, next) => {
  if (!CSRF_METHODS.includes(req.method)) return next();

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    logger.warn("CSRF validation failed", {
      correlationId: req.correlationId,
      path: req.originalUrl,
      method: req.method,
    });

    return res.status(403).json({
      success: false,
      message: "Invalid or missing CSRF token",
      correlationId: req.correlationId,
    });
  }

  next();
});

/* ============================================================
   📊 METRICS
============================================================ */
app.use(metricsMiddleware);

app.get("/metrics", async (req, res) => {
  if (ENV === "production" && req.headers["x-metrics-token"] !== METRICS_TOKEN) {
    return res.status(403).json({ success: false });
  }
  res.set("Content-Type", metricsClient.register.contentType);
  res.end(await metricsClient.register.metrics());
});

/* ============================================================
   ⏱️ RATE LIMITING
============================================================ */
if (ENV !== "test") app.use(globalLimiter);
app.use("/api", slidingWindowLimiter);

/* ============================================================
   ❤️ HEALTH
============================================================ */
app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "College Media API",
    env: ENV,
    correlationId: req.correlationId,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: os.loadavg(),
    timestamp: new Date().toISOString(),
  });
});

/* ============================================================
   🔐 ROUTES
============================================================ */
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/search", searchLimiter, require("./routes/search"));
app.use("/api/admin", adminLimiter, require("./routes/admin"));
app.use("/api/resume", resumeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/messages", require("./routes/messages"));
app.use("/api/account", require("./routes/account"));

/* ============================================================
   ❌ ERROR HANDLING
============================================================ */
app.use(notFound);

app.use((err, req, res, next) => {
  logger.error("Unhandled error", {
    correlationId: req.correlationId,
    message: err.message,
  });

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    correlationId: req.correlationId,
  });
});

/* ============================================================
   🚦 START SERVER
============================================================ */
let dbConnection;

const startServer = async () => {
  dbConnection = await initDB();
  warmUpCache({
    User: require("./models/User"),
    Resume: require("./models/Resume"),
  });

  server.listen(PORT, () =>
    logger.info("Server running", { port: PORT, env: ENV })
  );
};

if (require.main === module) startServer();

module.exports = app;
