const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');
const { globalLimiter } = require('./middleware/rateLimitMiddleware');
const { sanitizeAll, validateContentType, preventParameterPollution } = require('./middleware/sanitizationMiddleware');

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

/* ---------- Feature Flag Validation ---------- */
(() => {
  Object.entries(FEATURE_FLAGS).forEach(([k, v]) => {
    if (typeof v !== "boolean") {
      logger.critical("Invalid feature flag", { k, v });
      process.exit(1);
    }
  });

// Apply input sanitization (XSS & NoSQL injection protection)
app.use(sanitizeAll);

// Validate Content-Type for POST/PUT/PATCH requests
app.use(validateContentType);

// Prevent parameter pollution
app.use(preventParameterPollution(['tags', 'categories'])); // Allow arrays for specific params

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  app.use("/api/notifications", require("./routes/notifications"));

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
