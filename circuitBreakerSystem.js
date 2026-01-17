/**
 * =====================================================
 * CIRCUIT BREAKER PATTERN IMPLEMENTATION
 * =====================================================
 * File: circuitBreakerSystem.js
 * Tech: Node.js + Express
 *
 * Purpose:
 * - Prevent cascading failures
 * - Stop calling failing services
 * - Improve system stability
 *
 * States:
 * - CLOSED
 * - OPEN
 * - HALF_OPEN
 *
 * Author: Ayaanshaikh12243
 */

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/**
 * =====================================================
 * CIRCUIT BREAKER STATES
 * =====================================================
 */
const STATES = {
  CLOSED: "CLOSED",
  OPEN: "OPEN",
  HALF_OPEN: "HALF_OPEN"
};

/**
 * =====================================================
 * CIRCUIT BREAKER CLASS
 * =====================================================
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 10000;

    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();

    this.name = options.name || "DefaultCircuit";
  }

  /**
   * -----------------------------------------------------
   * MAIN EXECUTE FUNCTION
   * -----------------------------------------------------
   */
  async exec(requestFn, fallbackFn) {
    if (this.state === STATES.OPEN) {
      if (Date.now() > this.nextAttempt) {
        this.state = STATES.HALF_OPEN;
        console.log(`[${this.name}] Switching to HALF_OPEN`);
      } else {
        console.log(`[${this.name}] OPEN - Request blocked`);
        return fallbackFn();
      }
    }

    try {
      const response = await requestFn();
      return this._onSuccess(response);
    } catch (error) {
      return this._onFailure(error, fallbackFn);
    }
  }

  /**
   * -----------------------------------------------------
   * SUCCESS HANDLER
   * -----------------------------------------------------
   */
  _onSuccess(response) {
    if (this.state === STATES.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this._reset();
      }
    } else {
      this.failureCount = 0;
    }
    return response;
  }

  /**
   * -----------------------------------------------------
   * FAILURE HANDLER
   * -----------------------------------------------------
   */
  _onFailure(error, fallbackFn) {
    this.failureCount++;

    console.error(`[${this.name}] Failure count: ${this.failureCount}`);

    if (this.failureCount >= this.failureThreshold) {
      this._trip();
    }

    return fallbackFn();
  }

  /**
   * -----------------------------------------------------
   * TRIP CIRCUIT
   * -----------------------------------------------------
   */
  _trip() {
    this.state = STATES.OPEN;
    this.nextAttempt = Date.now() + this.timeout;
    console.warn(`[${this.name}] Circuit OPENED`);
  }

  /**
   * -----------------------------------------------------
   * RESET CIRCUIT
   * -----------------------------------------------------
   */
  _reset() {
    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    console.log(`[${this.name}] Circuit RESET to CLOSED`);
  }

  /**
   * -----------------------------------------------------
   * STATUS
   * -----------------------------------------------------
   */
  status() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt
    };
  }
}

/**
 * =====================================================
 * SERVICE CALL SIMULATION
 * =====================================================
 */
const unstableServiceCall = async () => {
  const random = Math.random();
  if (random < 0.6) {
    throw new Error("Service Failure");
  }
  return { data: "Service Success Response" };
};

/**
 * =====================================================
 * FALLBACK FUNCTION
 * =====================================================
 */
const fallbackResponse = () => {
  return {
    success: false,
    message: "Service temporarily unavailable (fallback)"
  };
};

/**
 * =====================================================
 * CIRCUIT BREAKER INSTANCE
 * =====================================================
 */
const serviceCircuitBreaker = new CircuitBreaker({
  name: "UserServiceCircuit",
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 8000
});

/**
 * =====================================================
 * API ENDPOINT
 * =====================================================
 */
app.get("/api/v1/user/profile", async (req, res) => {
  const result = await serviceCircuitBreaker.exec(
    unstableServiceCall,
    fallbackResponse
  );

  res.json({
    circuitState: serviceCircuitBreaker.status(),
    response: result
  });
});

/**
 * =====================================================
 * MONITORING ENDPOINT
 * =====================================================
 */
app.get("/api/v1/circuit/status", (req, res) => {
  res.json(serviceCircuitBreaker.status());
});

/**
 * =====================================================
 * SERVER START
 * =====================================================
 */
app.listen(3000, () => {
  console.log("Circuit Breaker Service running on port 3000");
});

/**
 * =====================================================
 * NOTES:
 * =====================================================
 * - This file can be extended with:
 *   - Redis state storage
 *   - Prometheus metrics
 *   - Kafka retries
 *   - Per-route circuit breakers
 *
 * - Prevents cascading failures
 * - Production-safe pattern
 *
 * =====================================================
 */
