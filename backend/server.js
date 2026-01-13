const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { initDB } = require('./config/db');
const { initSocket } = require('./socket');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');
const { globalLimiter } = require('./middleware/rateLimitMiddleware');
const { sanitizeAll, validateContentType, preventParameterPollution } = require('./middleware/sanitizationMiddleware');
const { setupSwagger } = require('./config/swagger');
const passport = require('./config/passport');
require('./utils/redisClient'); // Initialize Redis client

/* ============================================================
   📦 CORE DEPENDENCIES
============================================================ */
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const os = require("os");

/* ============================================================
   🔧 INTERNAL IMPORTS
const helmet = require("helmet");
const securityHeaders = require("./config/securityHeaders");


const { initDB } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const resumeRoutes = require("./routes/resume");
const uploadRoutes = require("./routes/upload");

const {
  globalLimiter,
  authLimiter,
  otpLimiter,
  searchLimiter,
  adminLimiter,
} = require("./middleware/rateLimiter");

const { slidingWindowLimiter } = require("./middleware/slidingWindowLimiter");
const { warmUpCache } = require("./utils/cache");
const logger = require("./utils/logger");

/* ============================================================
   📊 OBSERVABILITY & METRICS
============================================================ */
const metricsMiddleware = require("./middleware/metrics.middleware");
const { client: metricsClient } = require("./utils/metrics");

/* ============================================================
   🔁 BACKGROUND JOBS
const sampleJob = require("./jobs/sampleJob");

/* ============================================================
   🌱 ENVIRONMENT SETUP
dotenv.config();


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const METRICS_TOKEN = process.env.METRICS_TOKEN || "metrics-secret";
const TRUST_PROXY = process.env.TRUST_PROXY === "true";

// Middleware
app.use(helmet()); // Set security headers
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for now (if needed for development)
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"], // Allow images from https sources
    connectSrc: ["'self'"],
  },
}));
app.use(compression()); // Compress all responses
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Apply global rate limiter
// conditional check for test environment to avoid rate limits during testing
if (process.env.NODE_ENV !== 'test') {
  app.use(globalLimiter);
}

app.disable("x-powered-by");

/* ============================================================
   🔐 SECURITY HEADERS (HELMET)
app.use(helmet(securityHeaders(ENV)));

/* ============================================================
   🌍 CORS CONFIG
============================================================ */
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-API-Version",
      "X-Metrics-Token",
    ],
  })
);

/* ============================================================
   📦 BODY PARSERS
============================================================ */
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

/* ============================================================
   📊 REQUEST METRICS
app.use(metricsMiddleware);

/* ============================================================
   ⏱️ REQUEST TIMEOUT GUARD
============================================================ */
app.use((req, res, next) => {
  req.setTimeout(10 * 60 * 1000);
  res.setTimeout(10 * 60 * 1000);
  next();
});

/* ============================================================
   🐢 SLOW REQUEST LOGGER
============================================================ */
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 5000) {
      logger.warn("Slow request detected", {
        method: req.method,
        url: req.originalUrl,
        durationMs: duration,
        status: res.statusCode,
      });
    }
  });

  next();
});

/* ============================================================
   🔁 API VERSIONING
============================================================ */
app.use((req, res, next) => {
  req.apiVersion = req.headers["x-api-version"] || "v1";
  res.setHeader("X-API-Version", req.apiVersion);
  next();
});

/* ============================================================
   ⏱️ RATE LIMITING (ISSUE #500 FIX)
============================================================ */

/**
 * Sliding window limiter – light protection
 */
app.use("/api", slidingWindowLimiter);

/**
 * Global limiter – protects all APIs
 */
if (ENV === "production") {
  app.use("/api", globalLimiter);
}

/* ============================================================
   📁 STATIC FILES
============================================================ */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1h",
    etag: true,
    immutable: false,
  })
);

/* ============================================================
   ❤️ HEALTH CHECK
============================================================ */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "College Media API running",
    env: ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: os.loadavg(),
    timestamp: new Date().toISOString(),
  });
});

// Setup Swagger API documentation
setupSwagger(app);

// Import and register routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/account', require('./routes/account'));
app.use('/api/search', require('./routes/search'));
app.use('/api/moderation', require('./routes/moderation'));

// 404 Not Found Handler (must be after all routes)
app.use(notFound);

  if (ENV === "production" && token !== METRICS_TOKEN) {
    logger.warn("Unauthorized metrics access", {
      ip: req.ip,
    });
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  try {
    res.set("Content-Type", metricsClient.register.contentType);
    res.end(await metricsClient.register.metrics());
  } catch (err) {
    logger.error("Metrics endpoint failed", {
      error: err.message,
    });
    res.status(500).json({
      success: false,
      message: "Failed to load metrics",
    });
  }
});

/* ============================================================
   🔁 BACKGROUND JOB BOOTSTRAP
const startBackgroundJobs = () => {
  logger.info("Bootstrapping background jobs");

  setImmediate(async () => {
    try {
      await sampleJob.run({ shouldFail: false });
      logger.info("Background job completed successfully");
    } catch (err) {
      logger.error("Background job failed", {
        job: "sample_background_job",
        error: err.message,
        stack: err.stack,
      });
    }
  });
};

/* ============================================================
   🚀 START SERVER
============================================================ */
let dbConnection = null;

const startServer = async () => {
  logger.info("Starting server bootstrap");

  /* ---------- DB CONNECTION ---------- */
  try {
    dbConnection = await initDB();
    logger.info("Database connected successfully");
  } catch (err) {
    logger.critical("Database connection failed", {
      error: err.message,
    });
    process.exit(1);
  }

  // ------------------
  // 🔐 ROUTES
  // ------------------
  app.use("/api/auth", authLimiter, require("./routes/auth"));
  app.use("/api/users", require("./routes/users"));
  app.use("/api/resume", resumeRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/messages", require("./routes/messages"));
  app.use("/api/account", require("./routes/account"));
  app.use("/api/notifications", require("./routes/notifications"));
  app.use("/api/alumni", require("./routes/alumni"));
  app.use("/api/posts", require("./routes/posts"));

  // ------------------
  // ❌ ERROR HANDLERS (VERY IMPORTANT ORDER)
  // ------------------
  app.use(notFound);      // 404 handler
  app.use(errorHandler); // global error handler

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

/* ============================================================
   🧹 GRACEFUL SHUTDOWN
    }

  setTimeout(() => {
    logger.critical("Force shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/* ============================================================
   🧨 PROCESS SAFETY
  });
}

/* ============================================================
   ▶️ BOOTSTRAP
