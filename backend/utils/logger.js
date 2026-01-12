/**
 * ============================
 * Centralized Logger Utility
 * ============================
 */

const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, "app.log");

const formatMessage = (level, message, meta) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    meta,
  });
};

const writeLog = (level, message, meta = {}) => {
  const log = formatMessage(level, message, meta);

  // Console output
  if (level === "error" || level === "critical") {
    console.error(log);
  } else {
    console.log(log);
  }

  // File output
  fs.appendFile(logFile, log + "\n", (err) => {
    if (err) console.error("Failed to write log:", err.message);
  });
};

module.exports = {
  info: (msg, meta) => writeLog("info", msg, meta),
  warn: (msg, meta) => writeLog("warn", msg, meta),
  error: (msg, meta) => writeLog("error", msg, meta),
  critical: (msg, meta) => writeLog("critical", msg, meta),
};
