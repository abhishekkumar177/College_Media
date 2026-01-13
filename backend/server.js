/**
 * ============================================================
 *  College Media – Backend Server (HARDENED)
 * ------------------------------------------------------------
 *  ✔ Refresh Token Ready
 *  ✔ Cookie Security Enabled
 *  ✔ Startup Self-Checks
 *  ✔ Token Abuse Protection
 *  ✔ Graceful Shutdown
 *  ✔ Observability Enabled
 * ============================================================
 */

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

const ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 5000;
const TRUST_PROXY = process.env.TRUST_PROXY === "true";
const METRICS_TOKEN = process.env.METRICS_TOKEN || "metrics-secret";

/* 🔐 AUTH / TOKEN CONFIG */
const COOKIE_SECURE = ENV === "production";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

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
   🔐 SECURITY HEADERS
app.use(helmet(securityHeaders(ENV)));

/* ============================================================
   🌍 CORS CONFIG (REFRESH TOKEN SAFE)
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
   🍪 COOKIE PARSER (REFRESH TOKEN SUPPORT)
============================================================ */
app.use(cookieParser());

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
   ⏱️ RATE LIMITING
============================================================ */
app.use("/api", slidingWindowLimiter);

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
  })
);

/* ============================================================
   ❤️ HEALTH CHECK + AUTH SANITY
============================================================ */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "College Media API running",
    env: ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: os.loadavg(),
    refreshTokenCookie: {
      httpOnly: true,
      secure: COOKIE_SECURE,
      domain: COOKIE_DOMAIN || "auto",
    },
    timestamp: new Date().toISOString(),
  });
});

/* ============================================================
   📈 METRICS (SECURED)

  if (ENV === "production" && token !== METRICS_TOKEN) {
    logger.warn("Unauthorized metrics access", { ip: req.ip });
    return res.status(403).json({ success: false });
  }

  res.set("Content-Type", metricsClient.register.contentType);
  res.end(await metricsClient.register.metrics());
});

/* ============================================================
   🔁 BACKGROUND JOB BOOTSTRAP
const startBackgroundJobs = () => {
  setImmediate(async () => {
    try {
      await sampleJob.run({ shouldFail: false });
      logger.info("Background job executed");
    } catch (err) {
      logger.error("Background job failed", err);
    }
  });
};

/* ============================================================
   🚀 START SERVER
============================================================ */
let dbConnection = null;

const startServer = async () => {
  /* 🔍 STARTUP SELF CHECK */
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    logger.critical("Auth secrets missing");
    process.exit(1);
  }

  try {
    dbConnection = await initDB();
  } catch (err) {
    logger.critical("DB connection failed", err);
    process.exit(1);
  }

  setImmediate(() => {
    warmUpCache({
      User: require("./models/User"),
      Resume: require("./models/Resume"),
    });
  });

  startBackgroundJobs();

  /* 🔐 ROUTES */
  app.use("/api/auth", authLimiter, require("./routes/auth"));
  app.use("/api/users", require("./routes/users"));
  app.use("/api/search", searchLimiter, require("./routes/search"));
  app.use("/api/admin", adminLimiter, require("./routes/admin"));
  app.use("/api/resume", resumeRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/messages", require("./routes/messages"));
  app.use("/api/account", require("./routes/account"));

  app.use(notFound);
  app.use(errorHandler);

  server.keepAliveTimeout = 120000;
  server.headersTimeout = 130000;

  server.listen(PORT, () => {
    logger.info(`Server running`, { port: PORT, env: ENV });
  });
};

// Start server only if run directly
if (require.main === module) {
  connectDB().then(() => {
    initSocket(server);

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

/* ============================================================
   🧨 PROCESS SAFETY

/* ============================================================
   ▶️ BOOTSTRAP
