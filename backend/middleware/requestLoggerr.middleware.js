/**
 * ==========================================================
 * Request / Response Logging Middleware
 * ==========================================================
 * Features:
 * - Logs incoming requests
 * - Logs outgoing responses
 * - Measures response time
 * - Logs errors
 * - File-based logging
 * - JSON structured logs
 * - Safe for production
 *
 * Author: Ayaanshaikh12243
 * ==========================================================
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

/* ----------------------------------------------------------
   CONFIGURATION
---------------------------------------------------------- */

const LOG_DIR = path.join(process.cwd(), "logs");
const REQUEST_LOG_FILE = path.join(LOG_DIR, "requests.log");
const ERROR_LOG_FILE = path.join(LOG_DIR, "errors.log");

const MAX_LOG_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ENABLE_CONSOLE_LOG = true;

/* ----------------------------------------------------------
   ENSURE LOG DIRECTORY
---------------------------------------------------------- */

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

ensureLogDir();

/* ----------------------------------------------------------
   UTILITY FUNCTIONS
---------------------------------------------------------- */

function getTimestamp() {
  return new Date().toISOString();
}

function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function safeJSON(data) {
  try {
    return JSON.stringify(data);
  } catch (err) {
    return JSON.stringify({ error: "JSON stringify failed" });
  }
}

function getMemoryUsage() {
  const mem = process.memoryUsage();
  return {
    rss: mem.rss,
    heapTotal: mem.heapTotal,
    heapUsed: mem.heapUsed,
    external: mem.external
  };
}

/* ----------------------------------------------------------
   FILE ROTATION
---------------------------------------------------------- */

function rotateIfNeeded(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;

    const stats = fs.statSync(filePath);
    if (stats.size >= MAX_LOG_FILE_SIZE) {
      const rotatedName =
        filePath +
        "." +
        Date.now() +
        ".bak";

      fs.renameSync(filePath, rotatedName);
    }
  } catch (err) {
    console.error("Log rotation error:", err.message);
  }
}

/* ----------------------------------------------------------
   FILE WRITER
---------------------------------------------------------- */

function writeLog(filePath, data) {
  rotateIfNeeded(filePath);

  fs.appendFile(
    filePath,
    data + os.EOL,
    { encoding: "utf8" },
    err => {
      if (err && ENABLE_CONSOLE_LOG) {
        console.error("Log write failed:", err.message);
      }
    }
  );
}

/* ----------------------------------------------------------
   REQUEST LOGGER
---------------------------------------------------------- */

function logRequest(req) {
  const log = {
    type: "request",
    timestamp: getTimestamp(),
    method: req.method,
    url: req.originalUrl,
    ip: getClientIP(req),
    headers: req.headers,
    query: req.query,
    body: req.body || null
  };

  writeLog(REQUEST_LOG_FILE, safeJSON(log));

  if (ENABLE_CONSOLE_LOG) {
    console.log("[REQUEST]", req.method, req.originalUrl);
  }
}

/* ----------------------------------------------------------
   RESPONSE LOGGER
---------------------------------------------------------- */

function logResponse(req, res, startTime) {
  const duration = Date.now() - startTime;

  const log = {
    type: "response",
    timestamp: getTimestamp(),
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    durationMs: duration,
    memoryUsage: getMemoryUsage()
  };

  writeLog(REQUEST_LOG_FILE, safeJSON(log));

  if (ENABLE_CONSOLE_LOG) {
    console.log(
      "[RESPONSE]",
      req.method,
      req.originalUrl,
      res.statusCode,
      duration + "ms"
    );
  }
}

/* ----------------------------------------------------------
   ERROR LOGGER
---------------------------------------------------------- */

function logError(err, req) {
  const log = {
    type: "error",
    timestamp: getTimestamp(),
    message: err.message,
    stack: err.stack,
    method: req?.method,
    url: req?.originalUrl,
    ip: getClientIP(req)
  };

  writeLog(ERROR_LOG_FILE, safeJSON(log));

  if (ENABLE_CONSOLE_LOG) {
    console.error("[ERROR]", err.message);
  }
}

/* ----------------------------------------------------------
   MAIN MIDDLEWARE
---------------------------------------------------------- */

function requestLogger(req, res, next) {
  const startTime = Date.now();

  logRequest(req);

  const originalSend = res.send;

  res.send = function (body) {
    res.locals.responseBody = body;
    return originalSend.call(this, body);
  };

  res.on("finish", () => {
    logResponse(req, res, startTime);
  });

  res.on("close", () => {
    logResponse(req, res, startTime);
  });

  next();
}

/* ----------------------------------------------------------
   ERROR HANDLING MIDDLEWARE
---------------------------------------------------------- */

function errorLogger(err, req, res, next) {
  logError(err, req);

  res.status(err.status || 500).json({
    success: false,
    message: "Internal Server Error"
  });
}

/* ----------------------------------------------------------
   HEALTH CHECK
---------------------------------------------------------- */

function loggerHealth(req, res) {
  res.json({
    status: "ok",
    logsDirectory: LOG_DIR,
    requestLog: REQUEST_LOG_FILE,
    errorLog: ERROR_LOG_FILE
  });
}

/* ----------------------------------------------------------
   EXPORTS
---------------------------------------------------------- */

module.exports = {
  requestLogger,
  errorLogger,
  loggerHealth
};
