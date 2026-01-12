/**
 * ================================
 *  College Media – Backend Server
 *  Timeout-Safe | Large-File Ready
 *  Production Hardened
 * ================================
 
// TEMP CHANGE for ISSUE-479

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const os = require("os");
const { startEventLoopMonitor } = require("./utils/eventLoopMonitor");

/* ------------------
   🔧 INTERNAL IMPORTS
------------------ */
const { initDB } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const resumeRoutes = require("./routes/resume");
const uploadRoutes = require("./routes/upload");
const { globalLimiter, authLimiter } = require("./middleware/rateLimiter");
const { slidingWindowLimiter } = require("./middleware/slidingWindowLimiter");
const { warmUpCache } = require("./utils/cache");
const logger = require("./utils/logger");

// 🔍 Observability & Metrics
const metricsMiddleware = require("./middleware/metrics.middleware");
const { client: metricsClient } = require("./utils/metrics");

/* ------------------
   🌱 ENV SETUP
------------------ */
dotenv.config();

const ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

app.disable("x-powered-by");

/* =================================================
   🚩 FEATURE FLAGS
================================================= */
const FEATURE_FLAGS = Object.freeze({
  ENABLE_EXPERIMENTAL_RESUME: ENV !== "production",
  ENABLE_NEW_MESSAGING_FLOW: ENV !== "production",
  ENABLE_DEBUG_LOGS: ENV !== "production",
  ENABLE_STRICT_RATE_LIMITING: ENV === "production",
  ENABLE_VERBOSE_ERRORS: ENV !== "production",
});
/* ------------------
   📊 OBSERVABILITY – REQUEST METRICS
------------------ */
app.use(metricsMiddleware);
/* ---------- Feature Flag Validation ---------- */
(() => {
  Object.entries(FEATURE_FLAGS).forEach(([k, v]) => {
    if (typeof v !== "boolean") {
      logger.critical("Invalid feature flag", { k, v });
      process.exit(1);
    }
  });

  if (
    ENV === "production" &&
    (FEATURE_FLAGS.ENABLE_EXPERIMENTAL_RESUME ||
      FEATURE_FLAGS.ENABLE_NEW_MESSAGING_FLOW)
  ) {
    logger.critical("Unsafe feature flags enabled in production");
    process.exit(1);
  }

  logger.info("Feature flags loaded", { env: ENV, FEATURE_FLAGS });
})();
/* ------------------
   📈 PROMETHEUS METRICS
------------------ */
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", metricsClient.register.contentType);
    res.end(await metricsClient.register.metrics());
  } catch (err) {
    logger.error("Metrics endpoint failed", { error: err.message });
    res.status(500).json({
      success: false,
      message: "Failed to load metrics",
    });
  }
});
/* ------------------
   🌍 CORS
------------------ */
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

/* ------------------
   📦 BODY PARSERS
------------------ */
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

/* ------------------
   ⏱️ REQUEST TIMEOUT GUARD
------------------ */
app.use((req, res, next) => {
  req.setTimeout(10 * 60 * 1000);
  res.setTimeout(10 * 60 * 1000);
  next();
});

/* ------------------
   🐢 SLOW REQUEST LOGGER
------------------ */
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 5000) {
      logger.warn("Slow request detected", {
        method: req.method,
        url: req.originalUrl,
        durationMs: duration,
      });
    }
  });

  next();
});

/* ------------------
   🔁 API VERSIONING
------------------ */
app.use((req, res, next) => {
  req.apiVersion = req.headers["x-api-version"] || "v1";
  res.setHeader("X-API-Version", req.apiVersion);
  next();
});

/* ------------------
   ⏱️ RATE LIMITING
------------------ */
app.use("/api", slidingWindowLimiter);
if (FEATURE_FLAGS.ENABLE_STRICT_RATE_LIMITING) {
  app.use("/api", globalLimiter);
}

/* ------------------
   📁 STATIC FILES
------------------ */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1h",
    etag: true,
  })
);

/* ------------------
   ❤️ HEALTH CHECK
------------------ */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "College Media API running",
    env: ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: os.loadavg(),
  });
});

/* ------------------
   🚀 START SERVER
------------------ */
let dbConnection = null;

const startServer = async () => {
  try {
    dbConnection = await initDB();
    logger.info("Database connected");
  } catch (err) {
    logger.critical("DB connection failed", { error: err.message });
    process.exit(1);
  }

  /* 🔥 CACHE WARM-UP (NON-BLOCKING) */
  setImmediate(() => {
    warmUpCache({
      User: require("./models/User"),
      Resume: require("./models/Resume"),
    });
  });

  /* ---------- ROUTES ---------- */
  app.use("/api/auth", authLimiter, require("./routes/auth"));
  app.use("/api/users", require("./routes/users"));

  if (FEATURE_FLAGS.ENABLE_EXPERIMENTAL_RESUME) {
    app.use("/api/resume", resumeRoutes);
  }

  app.use("/api/upload", uploadRoutes);

  if (FEATURE_FLAGS.ENABLE_NEW_MESSAGING_FLOW) {
    app.use("/api/messages", require("./routes/messages"));
  }

  app.use("/api/account", require("./routes/account"));

  app.use(notFound);
  app.use(errorHandler);

  /* ---------- SERVER TIMEOUT TUNING ---------- */
  server.keepAliveTimeout = 120000;
  server.headersTimeout = 130000;
  server.requestTimeout = 0;

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

/* ------------------
   🧹 GRACEFUL SHUTDOWN
------------------ */
const shutdown = async (signal) => {
  logger.warn("Shutdown signal", { signal });

  server.close(async () => {
    if (dbConnection?.mongoose) {
      await dbConnection.mongoose.connection.close(false);
    }
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/* ------------------
   🧨 PROCESS SAFETY
------------------ */
process.on("unhandledRejection", (reason) => {
  logger.critical("Unhandled Rejection", { reason });
});

process.on("uncaughtException", (err) => {
  logger.critical("Uncaught Exception", {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

/* ------------------
   ▶️ BOOTSTRAP
------------------ */
startServer();
