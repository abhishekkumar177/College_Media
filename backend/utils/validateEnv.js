/**
 * ============================================================
 * Environment Configuration Validator
 * ------------------------------------------------------------
 * ✔ Fail-fast on missing / invalid env variables
 * ✔ Type-safe validation
 * ✔ Environment-specific enforcement
 * ✔ Secret strength checks
 * ✔ URL / number / boolean validation
 * ✔ Clear startup error reporting
 * ✔ Production hardened
 * ============================================================
 */

const fs = require("fs");
const path = require("path");

/* ============================================================
   🔧 INTERNAL UTILITIES
============================================================ */

/**
 * Log helper (console only at startup)
 */
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
};

/**
 * Throw fatal startup error
 */
const fatal = (msg) => {
  log.error(msg);
  log.error("Startup aborted due to invalid configuration.");
  process.exit(1);
};

/* ============================================================
   🧠 TYPE CHECK HELPERS
============================================================ */

const isNonEmptyString = (v) =>
  typeof v === "string" && v.trim().length > 0;

const isNumber = (v) => !isNaN(Number(v));

const isBoolean = (v) =>
  v === "true" || v === "false" || typeof v === "boolean";

const isValidURL = (v) => {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};

const minLength = (v, len) =>
  typeof v === "string" && v.length >= len;

/* ============================================================
   🔐 SECRET STRENGTH CHECKS
============================================================ */

const validateSecret = (name, value, minLen = 32) => {
  if (!isNonEmptyString(value)) {
    fatal(`Missing required secret: ${name}`);
  }

  if (!minLength(value, minLen)) {
    fatal(
      `Secret ${name} is too weak. Minimum length: ${minLen}`
    );
  }
};

/* ============================================================
   📦 ENV SCHEMA DEFINITION
============================================================ */

const ENV_SCHEMA = {
  NODE_ENV: {
    required: true,
    validate: (v) =>
      ["development", "test", "staging", "production"].includes(
        v
      ),
  },

  PORT: {
    required: true,
    validate: isNumber,
  },

  DATABASE_URL: {
    required: true,
    validate: isValidURL,
  },

  JWT_SECRET: {
    required: true,
    secret: true,
    minLength: 32,
  },

  JWT_REFRESH_SECRET: {
    required: true,
    secret: true,
    minLength: 32,
  },

  REDIS_URL: {
    required: false,
    validate: isValidURL,
  },

  METRICS_TOKEN: {
    required: false,
    minLength: 16,
  },

  CORS_ORIGIN: {
    required: false,
  },

  TRUST_PROXY: {
    required: false,
    validate: isBoolean,
  },

  LOG_LEVEL: {
    required: false,
    validate: (v) =>
      ["debug", "info", "warn", "error"].includes(v),
  },

  RATE_LIMIT_ENABLED: {
    required: false,
    validate: isBoolean,
  },

  FILE_UPLOAD_MAX_SIZE: {
    required: false,
    validate: isNumber,
  },
};

/* ============================================================
   🌍 ENVIRONMENT-SPECIFIC RULES
============================================================ */

const ENV_RULES = {
  production: {
    required: [
      "DATABASE_URL",
      "JWT_SECRET",
      "JWT_REFRESH_SECRET",
    ],
    forbiddenDefaults: ["changeme", "secret"],
  },

  development: {
    warnIfMissing: ["REDIS_URL"],
  },
};

/* ============================================================
   🧪 VALIDATION ENGINE
============================================================ */

const validateEnv = () => {
  log.info("Validating environment configuration...");

  const env = process.env;
  const errors = [];

  /* ---------- BASIC SCHEMA VALIDATION ---------- */
  for (const [key, rules] of Object.entries(
    ENV_SCHEMA
  )) {
    const value = env[key];

    if (rules.required && !isNonEmptyString(value)) {
      errors.push(`Missing required env variable: ${key}`);
      continue;
    }

    if (value && rules.validate && !rules.validate(value)) {
      errors.push(`Invalid value for env variable: ${key}`);
      continue;
    }

    if (rules.secret) {
      validateSecret(
        key,
        value,
        rules.minLength || 32
      );
    }
  }

  if (errors.length > 0) {
    errors.forEach((e) => log.error(e));
    fatal("Environment validation failed");
  }

  /* ---------- ENV-SPECIFIC VALIDATION ---------- */
  const envName = env.NODE_ENV || "development";
  const rules = ENV_RULES[envName];

  if (rules?.required) {
    for (const key of rules.required) {
      if (!isNonEmptyString(env[key])) {
        fatal(
          `Env ${key} is required in ${envName} environment`
        );
      }
    }
  }

  if (rules?.forbiddenDefaults) {
    for (const key of Object.keys(env)) {
      if (
        rules.forbiddenDefaults.includes(env[key])
      ) {
        fatal(
          `Env ${key} uses insecure default value in ${envName}`
        );
      }
    }
  }

  if (rules?.warnIfMissing) {
    for (const key of rules.warnIfMissing) {
      if (!isNonEmptyString(env[key])) {
        log.warn(
          `Optional env ${key} is missing (allowed in ${envName})`
        );
      }
    }
  }

  /* ---------- FILE SYSTEM CHECKS ---------- */
  if (env.NODE_ENV === "production") {
    const envFile = path.join(
      process.cwd(),
      ".env"
    );
    if (fs.existsSync(envFile)) {
      log.warn(
        ".env file detected in production environment"
      );
    }
  }

  log.info("Environment configuration validated successfully");
};

/* ============================================================
   📤 EXPORT
============================================================ */

module.exports = validateEnv;
