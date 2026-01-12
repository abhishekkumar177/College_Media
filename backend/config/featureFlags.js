/**
 * ======================================
 * Centralized Feature Flag Configuration
 * Safe Defaults | Env Controlled
 * ======================================
 */

const ENV = process.env.NODE_ENV || "development";

/* ------------------
   🔐 Helper
------------------ */
const bool = (value, defaultVal = false) => {
  if (value === undefined) return defaultVal;
  return value === "true";
};

/* ------------------
   🚩 FEATURE FLAGS
------------------ */
const FEATURE_FLAGS = Object.freeze({
  ENABLE_EXPERIMENTAL_RESUME:
    ENV !== "production" &&
    bool(process.env.FEATURE_EXPERIMENTAL_RESUME, false),

  ENABLE_NEW_MESSAGING_FLOW:
    ENV !== "production" &&
    bool(process.env.FEATURE_NEW_MESSAGING, false),

  ENABLE_DEBUG_LOGS:
    ENV !== "production" ||
    bool(process.env.FEATURE_DEBUG_LOGS, false),

  ENABLE_STRICT_RATE_LIMITING:
    ENV === "production" ||
    bool(process.env.FEATURE_STRICT_RATE_LIMITING, false),

  ENABLE_VERBOSE_ERRORS:
    ENV !== "production" &&
    bool(process.env.FEATURE_VERBOSE_ERRORS, false),
});

/* ------------------
   ✅ VALIDATION (FAIL FAST)
------------------ */
Object.entries(FEATURE_FLAGS).forEach(([key, value]) => {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid feature flag value for ${key}`);
  }
});

if (
  ENV === "production" &&
  (FEATURE_FLAGS.ENABLE_EXPERIMENTAL_RESUME ||
    FEATURE_FLAGS.ENABLE_NEW_MESSAGING_FLOW)
) {
  throw new Error("Unsafe feature flags enabled in production");
}

module.exports = FEATURE_FLAGS;
