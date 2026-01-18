/**
 * Unit Tests for Circuit Breaker Service
 */

const { CircuitBreaker, CircuitBreakerService, circuitBreakerService } = require('../services/circuitBreakerService');

describe('CircuitBreaker', () => {
  let breaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      name: 'test-service',
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 5000
    });
  });

  describe('Initialization', () => {
    test('should initialize with correct default values', () => {
      const defaultBreaker = new CircuitBreaker();

      expect(defaultBreaker.name).toBe('DefaultCircuit');
      expect(defaultBreaker.failureThreshold).toBe(5);
      expect(defaultBreaker.successThreshold).toBe(3);
      expect(defaultBreaker.timeout).toBe(10000);
      expect(defaultBreaker.state).toBe('CLOSED');
      expect(defaultBreaker.failureCount).toBe(0);
      expect(defaultBreaker.successCount).toBe(0);
    });

    test('should initialize with custom values', () => {
      expect(breaker.name).toBe('test-service');
      expect(breaker.failureThreshold).toBe(3);
      expect(breaker.successThreshold).toBe(2);
      expect(breaker.timeout).toBe(5000);
    });
  });

  describe('canRequest', () => {
    test('should allow requests when circuit is CLOSED', () => {
      expect(breaker.canRequest()).toBe(true);
    });

    test('should block requests when circuit is OPEN and timeout not reached', () => {
      breaker.state = 'OPEN';
      breaker.nextAttempt = Date.now() + 10000; // 10 seconds from now

      expect(breaker.canRequest()).toBe(false);
    });

    test('should allow requests when circuit is OPEN and timeout reached', () => {
      breaker.state = 'OPEN';
      breaker.nextAttempt = Date.now() - 1000; // 1 second ago

      expect(breaker.canRequest()).toBe(true);
      expect(breaker.state).toBe('HALF_OPEN');
      expect(breaker.successCount).toBe(0);
    });

    test('should allow requests when circuit is HALF_OPEN', () => {
      breaker.state = 'HALF_OPEN';

      expect(breaker.canRequest()).toBe(true);
    });
  });

  describe('execute', () => {
    test('should execute successful request', async () => {
      const mockRequestFn = jest.fn().mockResolvedValue('success');
      const mockFallbackFn = jest.fn();

      const result = await breaker.execute(mockRequestFn, mockFallbackFn);

      expect(result).toBe('success');
      expect(mockRequestFn).toHaveBeenCalled();
      expect(mockFallbackFn).not.toHaveBeenCalled();
      expect(breaker.failureCount).toBe(0);
    });

    test('should execute fallback on failed request', async () => {
      const mockRequestFn = jest.fn().mockRejectedValue(new Error('Request failed'));
      const mockFallbackFn = jest.fn().mockReturnValue('fallback result');

      const result = await breaker.execute(mockRequestFn, mockFallbackFn);

      expect(result).toBe('fallback result');
      expect(mockRequestFn).toHaveBeenCalled();
      expect(mockFallbackFn).toHaveBeenCalled();
      expect(breaker.failureCount).toBe(1);
    });

    test('should trip circuit after failure threshold', async () => {
      const mockRequestFn = jest.fn().mockRejectedValue(new Error('Request failed'));
      const mockFallbackFn = jest.fn().mockReturnValue('fallback');

      // Fail 3 times (threshold)
      for (let i = 0; i < 3; i++) {
        await breaker.execute(mockRequestFn, mockFallbackFn);
      }

      expect(breaker.state).toBe('OPEN');
      expect(breaker.failureCount).toBe(3);
    });

    test('should reset circuit after success in HALF_OPEN state', async () => {
      // Put circuit in OPEN state
      breaker.state = 'OPEN';
      breaker.nextAttempt = Date.now() - 1000;

      const mockRequestFn = jest.fn().mockResolvedValue('success');
      const mockFallbackFn = jest.fn();

      // First request should succeed and reset circuit
      await breaker.execute(mockRequestFn, mockFallbackFn);

      expect(breaker.state).toBe('CLOSED');
      expect(breaker.failureCount).toBe(0);
      expect(breaker.successCount).toBe(0);
    });
  });

  describe('onSuccess', () => {
    test('should increment success count in HALF_OPEN state', () => {
      breaker.state = 'HALF_OPEN';
      breaker.successCount = 1;

      breaker.onSuccess();

      expect(breaker.successCount).toBe(2);
    });

    test('should reset circuit when success threshold reached in HALF_OPEN', () => {
      breaker.state = 'HALF_OPEN';
      breaker.successCount = 1; // One more will reach threshold of 2

      breaker.onSuccess();

      expect(breaker.state).toBe('CLOSED');
      expect(breaker.failureCount).toBe(0);
      expect(breaker.successCount).toBe(0);
    });

    test('should not change failure count in CLOSED state', () => {
      breaker.failureCount = 2;

      breaker.onSuccess();

      expect(breaker.failureCount).toBe(0); // Reset to 0
    });
  });

  describe('onFailure', () => {
    test('should increment failure count', () => {
      breaker.onFailure();

      expect(breaker.failureCount).toBe(1);
    });

    test('should trip circuit when failure threshold reached', () => {
      breaker.failureThreshold = 2;

      breaker.onFailure();
      expect(breaker.state).toBe('CLOSED');

      breaker.onFailure();
      expect(breaker.state).toBe('OPEN');
    });
  });

  describe('getStatus', () => {
    test('should return correct status object', () => {
      breaker.failureCount = 2;
      breaker.successCount = 1;
      breaker.state = 'HALF_OPEN';

      const status = breaker.getStatus();

      expect(status).toEqual({
        name: 'test-service',
        state: 'HALF_OPEN',
        failureCount: 2,
        successCount: 1,
        lastFailureTime: null,
        nextAttempt: expect.any(Number),
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 5000
      });
    });
  });
});

describe('CircuitBreakerService', () => {
  let service;

  beforeEach(() => {
    service = new CircuitBreakerService();
  });

  describe('getBreaker', () => {
    test('should create and return new breaker', () => {
      const breaker = service.getBreaker('test-service');

      expect(breaker).toBeInstanceOf(CircuitBreaker);
      expect(breaker.name).toBe('test-service');
    });

    test('should return existing breaker for same service', () => {
      const breaker1 = service.getBreaker('test-service');
      const breaker2 = service.getBreaker('test-service');

      expect(breaker1).toBe(breaker2);
    });

    test('should create breaker with custom options', () => {
      const breaker = service.getBreaker('custom-service', {
        failureThreshold: 10,
        timeout: 20000
      });

      expect(breaker.failureThreshold).toBe(10);
      expect(breaker.timeout).toBe(20000);
    });
  });

  describe('execute', () => {
    test('should execute request through breaker', async () => {
      const mockRequestFn = jest.fn().mockResolvedValue('success');
      const mockFallbackFn = jest.fn();

      const result = await service.execute('test-service', mockRequestFn, mockFallbackFn);

      expect(result).toBe('success');
      expect(mockRequestFn).toHaveBeenCalled();
    });
  });

  describe('getAllStatuses', () => {
    test('should return status of all breakers', () => {
      service.getBreaker('service1');
      service.getBreaker('service2');

      const statuses = service.getAllStatuses();

      expect(statuses).toHaveProperty('service1');
      expect(statuses).toHaveProperty('service2');
      expect(Object.keys(statuses)).toHaveLength(2);
    });
  });

  describe('getStatus', () => {
    test('should return status of specific breaker', () => {
      service.getBreaker('test-service');

      const status = service.getStatus('test-service');

      expect(status).toHaveProperty('name', 'test-service');
    });

    test('should return null for non-existent breaker', () => {
      const status = service.getStatus('non-existent');

      expect(status).toBeNull();
    });
  });

  describe('reset', () => {
    test('should reset specific breaker', () => {
      const breaker = service.getBreaker('test-service');
      breaker.state = 'OPEN';

      const result = service.reset('test-service');

      expect(result).toBe(true);
      expect(breaker.state).toBe('CLOSED');
    });

    test('should return false for non-existent breaker', () => {
      const result = service.reset('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('resetAll', () => {
    test('should reset all breakers', () => {
      const breaker1 = service.getBreaker('service1');
      const breaker2 = service.getBreaker('service2');

      breaker1.state = 'OPEN';
      breaker2.state = 'OPEN';

      service.resetAll();

      expect(breaker1.state).toBe('CLOSED');
      expect(breaker2.state).toBe('CLOSED');
    });
  });
});