/**
 * ============================================
 * API Dependency Failure Handling – Production Ready
 * ============================================
 */

const axios = require("axios");

/* ================= CONFIG ================= */

const API_TIMEOUT = 4000;
const MAX_RETRIES = 3;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_RESET_TIME = 30000;

/* ============== CIRCUIT STATE ============== */

const circuit = {
  failures: 0,
  lastFailureTime: null,
  open: false,
};

/* ============== AXIOS INSTANCE ============== */

const client = axios.create({
  timeout: API_TIMEOUT,
});

/* ============== HELPERS ============== */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isCircuitOpen = () => {
  if (!circuit.open) return false;

  const now = Date.now();
  if (now - circuit.lastFailureTime > CIRCUIT_BREAKER_RESET_TIME) {
    circuit.open = false;
    circuit.failures = 0;
    return false;
  }
  return true;
};

const recordFailure = () => {
  circuit.failures += 1;
  circuit.lastFailureTime = Date.now();

  if (circuit.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuit.open = true;
  }
};

const recordSuccess = () => {
  circuit.failures = 0;
  circuit.open = false;
};

/* ============== MAIN FUNCTION ============== */

const safeApiCall = async ({ method, url, data, headers, fallback }) => {
  if (isCircuitOpen()) {
    return fallback ?? {
      success: false,
      message: "Service temporarily unavailable (circuit open)",
    };
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client({
        method,
        url,
        data,
        headers,
      });

      recordSuccess();
      return response.data;
    } catch (err) {
      recordFailure();

      if (attempt === MAX_RETRIES) {
        return fallback ?? {
          success: false,
          message: "Dependent service failed",
        };
      }

      // exponential backoff
      await sleep(attempt * 500);
    }
  }
};

module.exports = safeApiCall;
