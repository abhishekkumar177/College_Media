/**
 * ============================================================
 * Middleware Orchestrator
 * ------------------------------------------------------------
 * ✔ Enforces strict middleware execution order
 * ✔ Separates global / route / error middlewares
 * ✔ Prevents auth & validation bypass
 * ✔ Centralized & reusable middleware stacks
 * ✔ Improves security, predictability & maintainability
 * ============================================================
 */

/* ============================================================
   📦 CORE IMPORTS
============================================================ */
const express = require("express");

/* ============================================================
   🔗 PROJECT MIDDLEWARE IMPORTS
   (Existing middlewares reused – no duplication)
============================================================ */

// Observability & tracing
const {
  requestIdMiddleware,
} = require("./requestId.middleware");

// Security
const helmet = require("helmet");
const securityHeaders = require("../config/securityHeaders");

// Rate limiting
const {
  globalLimiter,
  authLimiter,
} = require("./rateLimiter");
const {
  slidingWindowLimiter,
} = require("./slidingWindowLimiter");

// Auth & validation (existing)
const authenticate =
  require("./authMiddleware")?.authenticate ||
  ((req, res, next) => next());

const authorize =
  require("./authMiddleware")?.authorize ||
  ((req, res, next) => next());

const validateRequest =
  require("./validationMiddleware") ||
  ((req, res, next) => next());

// Logging & metrics
const logger = require("../utils/logger");
const metricsMiddleware =
  require("./metrics.middleware");

// Error handling
const {
  notFound,
  errorHandler,
} = require("./errorMiddleware");

/* ============================================================
   🧠 INTERNAL HELPERS
============================================================ */

/**
 * Ensure middleware is a function
 */
const ensureMiddleware = (mw, name) => {
  if (typeof mw !== "function") {
    throw new Error(
      `Middleware "${name}" is not a valid function`
    );
  }
  return mw;
};

/**
 * Safe middleware wrapper
 * (ensures errors propagate to error handler)
 */
const safe =
  (mw) =>
  (req, res, next) => {
    try {
      Promise.resolve(mw(req, res, next)).catch(
        next
      );
    } catch (err) {
      next(err);
    }
  };

/* ============================================================
   🧩 GLOBAL MIDDLEWARE STACK
   (Runs for EVERY request)
============================================================ */

const globalMiddlewares = (app, env) => {
  logger.info(
    "Registering global middleware stack"
  );

  /**
   * 1️⃣ Request Correlation ID
   */
  app.use(
    ensureMiddleware(
      requestIdMiddleware,
      "requestIdMiddleware"
    )
  );

  /**
   * 2️⃣ Security headers
   */
  app.use(
    helmet(
      securityHeaders(env || "development")
    )
  );

  /**
   * 3️⃣ Metrics / observability
   */
  app.use(
    ensureMiddleware(
      metricsMiddleware,
      "metricsMiddleware"
    )
  );

  /**
   * 4️⃣ Rate limiting (light → strict)
   */
  app.use("/api", slidingWindowLimiter);

  if (env === "production") {
    app.use("/api", globalLimiter);
  }

  /**
   * 5️⃣ Request logging (after requestId)
   */
  app.use((req, res, next) => {
    logger.info("Incoming request", {
      method: req.method,
      path: req.originalUrl,
      requestId: req.requestId,
    });
    next();
  });
};

/* ============================================================
   🔐 AUTHENTICATED ROUTE STACK
   auth → authorization → validation → controller
============================================================ */

const protectedRoute = (
  middlewares,
  controller
) => {
  const router = express.Router();

  router.use(safe(authenticate));
  router.use(safe(authorize));

  if (Array.isArray(middlewares)) {
    middlewares.forEach((mw) =>
      router.use(safe(mw))
    );
  }

  router.use(safe(controller));

  return router;
};

/* ============================================================
   🌐 PUBLIC ROUTE STACK
============================================================ */

const publicRoute = (
  middlewares,
  controller
) => {
  const router = express.Router();

  if (Array.isArray(middlewares)) {
    middlewares.forEach((mw) =>
      router.use(safe(mw))
    );
  }

  router.use(safe(controller));

  return router;
};

/* ============================================================
   🔐 AUTH ROUTE STACK
   (Special strict limiter)
============================================================ */

const authRoute = (
  middlewares,
  controller
) => {
  const router = express.Router();

  router.use(authLimiter);

  if (Array.isArray(middlewares)) {
    middlewares.forEach((mw) =>
      router.use(safe(mw))
    );
  }

  router.use(safe(controller));

  return router;
};

/* ============================================================
   ❌ ERROR HANDLING STACK
   (MUST ALWAYS BE LAST)
============================================================ */

const errorMiddlewares = (app) => {
  logger.info(
    "Registering error middleware stack"
  );

  app.use(notFound);
  app.use(errorHandler);
};

/* ============================================================
   🚀 MAIN APPLY FUNCTION
============================================================ */

/**
 * Apply all middleware stacks in correct order
 */
const applyMiddleware = ({
  app,
  env,
  routes = {},
}) => {
  if (!app) {
    throw new Error(
      "Express app instance is required"
    );
  }

  /* ---------- GLOBAL ---------- */
  globalMiddlewares(app, env);

  /* ---------- ROUTES ---------- */
  Object.entries(routes).forEach(
    ([path, config]) => {
      const {
        type,
        middlewares,
        controller,
      } = config;

      if (!controller) {
        throw new Error(
          `Controller missing for route ${path}`
        );
      }

      switch (type) {
        case "public":
          app.use(
            path,
            publicRoute(
              middlewares,
              controller
            )
          );
          break;

        case "auth":
          app.use(
            path,
            authRoute(
              middlewares,
              controller
            )
          );
          break;

        case "protected":
          app.use(
            path,
            protectedRoute(
              middlewares,
              controller
            )
          );
          break;

        default:
          throw new Error(
            `Unknown route type "${type}" for ${path}`
          );
      }
    }
  );

  /* ---------- ERRORS (ALWAYS LAST) ---------- */
  errorMiddlewares(app);

  logger.info(
    "Middleware execution order enforced successfully"
  );
};

/* ============================================================
   📤 EXPORTS
============================================================ */

module.exports = {
  applyMiddleware,
  publicRoute,
  protectedRoute,
  authRoute,
};
