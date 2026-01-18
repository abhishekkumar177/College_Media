/**
 * Circuit Breaker Service
 * Provides resilience for external API calls and internal service communication
 */

const { trace, SpanStatusCode } = require('@opentelemetry/api');

class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || 'DefaultCircuit';
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 3;
    this.timeout = options.timeout || 10000;
    this.requestTimeout = options.requestTimeout || 5000;

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = Date.now();
  }

  /**
   * Check if request is allowed
   */
  canRequest() {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        console.log(`[${this.name}] Circuit switched to HALF_OPEN`);
        return true;
      }
      return false;
    }
    return true;
  }

  /**
   * Execute request with circuit breaker protection
   */
  async execute(requestFn, fallbackFn = null) {
    const tracer = trace.getTracer('circuit-breaker-service');
    return tracer.startActiveSpan(`${this.name}.execute`, async (span) => {
      try {
        span.setAttribute('circuit.name', this.name);
        span.setAttribute('circuit.state', this.state);

        if (!this.canRequest()) {
          span.setAttribute('circuit.blocked', true);
          span.setStatus({ code: SpanStatusCode.OK, message: 'Request blocked by circuit breaker' });

          if (fallbackFn) {
            const fallback = await fallbackFn();
            span.setAttribute('circuit.fallback', true);
            return fallback;
          }

          throw new Error(`Circuit ${this.name} is OPEN`);
        }

        span.setAttribute('circuit.allowed', true);
        const result = await requestFn();
        this.onSuccess();
        span.setAttribute('circuit.success', true);
        return result;

      } catch (error) {
        span.setAttribute('circuit.error', error.message);
        this.onFailure();
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });

        if (fallbackFn) {
          const fallback = await fallbackFn();
          span.setAttribute('circuit.fallback', true);
          return fallback;
        }

        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Handle successful request
   */
  onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.reset();
      }
    } else {
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed request
   */
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.trip();
    }
  }

  /**
   * Open the circuit
   */
  trip() {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.timeout;
    console.warn(`🚨 [${this.name}] Circuit OPENED - ${this.failureCount} failures`);
  }

  /**
   * Reset the circuit
   */
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    console.log(`✅ [${this.name}] Circuit CLOSED - recovered`);
  }

  /**
   * Get circuit status
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt,
      failureThreshold: this.failureThreshold,
      successThreshold: this.successThreshold,
      timeout: this.timeout
    };
  }
}

/**
 * Circuit Breaker Service
 * Manages multiple circuit breakers for different services
 */
class CircuitBreakerService {
  constructor() {
    this.breakers = new Map();
  }

  /**
   * Get or create circuit breaker for a service
   */
  getBreaker(serviceName, options = {}) {
    if (!this.breakers.has(serviceName)) {
      const breaker = new CircuitBreaker({
        name: serviceName,
        ...options
      });
      this.breakers.set(serviceName, breaker);
    }
    return this.breakers.get(serviceName);
  }

  /**
   * Execute request with circuit breaker protection
   */
  async execute(serviceName, requestFn, fallbackFn = null, options = {}) {
    const breaker = this.getBreaker(serviceName, options);
    return breaker.execute(requestFn, fallbackFn);
  }

  /**
   * Get status of all circuit breakers
   */
  getAllStatuses() {
    const statuses = {};
    for (const [name, breaker] of this.breakers) {
      statuses[name] = breaker.getStatus();
    }
    return statuses;
  }

  /**
   * Get status of specific circuit breaker
   */
  getStatus(serviceName) {
    const breaker = this.breakers.get(serviceName);
    return breaker ? breaker.getStatus() : null;
  }

  /**
   * Reset specific circuit breaker
   */
  reset(serviceName) {
    const breaker = this.breakers.get(serviceName);
    if (breaker) {
      breaker.reset();
      return true;
    }
    return false;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll() {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

// Export singleton instance
const circuitBreakerService = new CircuitBreakerService();

module.exports = {
  CircuitBreaker,
  CircuitBreakerService,
  circuitBreakerService
};