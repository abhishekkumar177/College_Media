/**
 * ============================================================
 * Middleware Order Guard
 * ------------------------------------------------------------
 * ✔ Detects incorrect middleware execution order
 * ✔ Prevents auth / validation bypass
 * ✔ Ensures error middleware is last
 * ✔ Warns during startup (fail-fast optional)
 * ✔ Improves long-term maintainability
 * ============================================================
 */

const logger = require("../utils/logger");

/* ============================================================
   🧠 MIDDLEWARE CATEGORIES
============================================================ */

const MIDDLEWARE_PHASES = [
  "requestId",
  "security",
  "metrics",
  "rateLimit",
  "logging",
  "authentication",
  "authorization",
  "validation",
  "controller",
  "error",
];

/* ============================================================
   🧩 PHASE MAP
============================================================ */

const PHASE_MATCHERS = {
  requestId: ["requestId", "trace", "correlation"],
  security: ["helmet", "security"],
  metrics: ["metrics", "prometheus"],
  rateLimit: ["rateLimit", "limiter"],
  logging: ["log", "logger"],
  authentication: ["auth", "authenticate"],
  authorization: ["authorize", "permission"],
  validation: ["validate", "schema"],
  controller: ["controller", "handler"],
  error: ["error", "notFound"],
};

/* ============================================================
   🔍 PHASE DETECTION
============================================================ */

const detectPhase = (name = "") => {
  const lower = name.toLowerCase();

  for (const [phase, keywords] of Object.entries(
    PHASE_MATCHERS
  )) {
    if (keywords.some((k) => lower.includes(k))) {
      return phase;
    }
  }

  return "unknown";
};

/* ============================================================
   🧪 STACK VALIDATION
============================================================ */

const validateOrder = (stack) => {
  const detected = stack.map((mw) => ({
    name: mw.name || "anonymous",
    phase: detectPhase(mw.name),
  }));

  let lastIndex = -1;
  const errors = [];
  const warnings = [];

  detected.forEach((item, index) => {
    const phaseIndex = MIDDLEWARE_PHASES.indexOf(
      item.phase
    );

    if (phaseIndex === -1) {
      warnings.push(
        `Unknown middleware phase for "${item.name}"`
      );
      return;
    }

    if (phaseIndex < lastIndex) {
      errors.push(
        `Middleware "${item.name}" (${item.phase}) is out of order`
      );
    }

    lastIndex = Math.max(lastIndex, phaseIndex);
  });

  return { errors, warnings, detected };
};

/* ============================================================
   🚨 GUARD EXECUTOR
============================================================ */

const enforceMiddlewareOrder = (
  stack,
  options = {}
) => {
  const {
    failOnError = false,
    logDetails = true,
  } = options;

  const { errors, warnings, detected } =
    validateOrder(stack);

  if (logDetails) {
    logger.info("Middleware execution order", {
      detected,
    });
  }

  warnings.forEach((w) =>
    logger.warn("Middleware order warning", {
      warning: w,
    })
  );

  if (errors.length > 0) {
    errors.forEach((e) =>
      logger.error("Middleware order violation", {
        error: e,
      })
    );

    if (failOnError) {
      throw new Error(
        "Invalid middleware execution order detected"
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/* ============================================================
   🧰 EXPRESS INTEGRATION HELPER
============================================================ */

const captureStack = (app) => {
  if (!app || !app._router) return [];

  return app._router.stack
    .filter((l) => l.handle)
    .map((l) => l.handle);
};

/* ============================================================
   📤 EXPORTS
============================================================ */

module.exports = {
  enforceMiddlewareOrder,
  captureStack,
};
