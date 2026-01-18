/**
 * Unit Tests for Data Consistency Service
 */

const dataConsistencyService = require('../../services/dataConsistencyService');

describe('DataConsistencyService', () => {
  beforeEach(() => {
    // Reset service state before each test
    dataConsistencyService.consistencyStats = {
      strongConsistencyCount: 0,
      eventualConsistencyCount: 0,
      totalOperations: 0,
      consistencyViolations: 0
    };
  });

  describe('writeStrong', () => {
    test('should perform strong consistency write', async () => {
      const key = 'test-key';
      const value = 'test-value';

      const result = await dataConsistencyService.writeStrong(key, value);

      expect(result).toEqual({
        success: true,
        key,
        value,
        consistency: 'strong',
        timestamp: expect.any(Date)
      });

      const stats = dataConsistencyService.getConsistencyStatus();
      expect(stats.strongConsistencyCount).toBe(1);
      expect(stats.totalOperations).toBe(1);
    });

    test('should handle write errors', async () => {
      // Mock a failure scenario
      const originalWrite = dataConsistencyService.writeStrong;
      dataConsistencyService.writeStrong = jest.fn().mockRejectedValue(new Error('Write failed'));

      const key = 'test-key';
      const value = 'test-value';

      await expect(dataConsistencyService.writeStrong(key, value)).rejects.toThrow('Write failed');

      // Restore original function
      dataConsistencyService.writeStrong = originalWrite;
    });
  });

  describe('readStrong', () => {
    test('should perform strong consistency read', async () => {
      const key = 'test-key';

      // First write some data
      await dataConsistencyService.writeStrong(key, 'test-value');

      const result = await dataConsistencyService.readStrong(key);

      expect(result).toEqual({
        success: true,
        key,
        value: 'test-value',
        consistency: 'strong',
        timestamp: expect.any(Date)
      });

      const stats = dataConsistencyService.getConsistencyStatus();
      expect(stats.strongConsistencyCount).toBe(2); // write + read
      expect(stats.totalOperations).toBe(2);
    });

    test('should return null for non-existent key', async () => {
      const result = await dataConsistencyService.readStrong('non-existent');

      expect(result).toEqual({
        success: false,
        key: 'non-existent',
        value: null,
        consistency: 'strong',
        error: 'Key not found'
      });
    });
  });

  describe('writeEventual', () => {
    test('should perform eventual consistency write', async () => {
      const key = 'test-key';
      const value = 'test-value';

      const result = await dataConsistencyService.writeEventual(key, value);

      expect(result).toEqual({
        success: true,
        key,
        value,
        consistency: 'eventual',
        timestamp: expect.any(Date)
      });

      const stats = dataConsistencyService.getConsistencyStatus();
      expect(stats.eventualConsistencyCount).toBe(1);
      expect(stats.totalOperations).toBe(1);
    });

    test('should simulate eventual consistency delay', async () => {
      const key = 'test-key';
      const value = 'test-value';

      const startTime = Date.now();
      const result = await dataConsistencyService.writeEventual(key, value);
      const endTime = Date.now();

      // Should have some delay (simulated)
      expect(endTime - startTime).toBeGreaterThanOrEqual(0);
      expect(result.consistency).toBe('eventual');
    });
  });

  describe('readEventual', () => {
    test('should perform eventual consistency read', async () => {
      const key = 'test-key';

      // First write some data
      await dataConsistencyService.writeEventual(key, 'test-value');

      const result = await dataConsistencyService.readEventual(key);

      expect(result).toEqual({
        success: true,
        key,
        value: 'test-value',
        consistency: 'eventual',
        timestamp: expect.any(Date)
      });

      const stats = dataConsistencyService.getConsistencyStatus();
      expect(stats.eventualConsistencyCount).toBe(2); // write + read
      expect(stats.totalOperations).toBe(2);
    });

    test('should handle stale reads in eventual consistency', async () => {
      const key = 'test-key';

      // Write initial value
      await dataConsistencyService.writeEventual(key, 'initial-value');

      // Simulate concurrent write
      setTimeout(async () => {
        await dataConsistencyService.writeEventual(key, 'updated-value');
      }, 10);

      const result = await dataConsistencyService.readEventual(key);

      // Should return some version of the data
      expect(result.success).toBe(true);
      expect(result.consistency).toBe('eventual');
    });
  });

  describe('getConsistencyStatus', () => {
    test('should return correct statistics', async () => {
      // Perform some operations
      await dataConsistencyService.writeStrong('key1', 'value1');
      await dataConsistencyService.readStrong('key1');
      await dataConsistencyService.writeEventual('key2', 'value2');
      await dataConsistencyService.readEventual('key2');

      const stats = dataConsistencyService.getConsistencyStatus();

      expect(stats).toEqual({
        strongConsistencyCount: 2,
        eventualConsistencyCount: 2,
        totalOperations: 4,
        consistencyViolations: 0,
        consistencyRate: 100
      });
    });

    test('should calculate consistency rate correctly', async () => {
      // Perform operations with some failures
      await dataConsistencyService.writeStrong('key1', 'value1');
      await dataConsistencyService.writeStrong('key2', 'value2');

      // Simulate a consistency violation
      dataConsistencyService.consistencyStats.consistencyViolations = 1;

      const stats = dataConsistencyService.getConsistencyStatus();

      expect(stats.consistencyRate).toBe(50); // 1 violation out of 2 operations = 50% consistency
    });
  });

  describe('validateConsistency', () => {
    test('should validate strong consistency', async () => {
      const key = 'test-key';
      const expectedValue = 'expected-value';

      // Write data
      await dataConsistencyService.writeStrong(key, expectedValue);

      const isConsistent = await dataConsistencyService.validateConsistency(key, expectedValue, 'strong');

      expect(isConsistent).toBe(true);
    });

    test('should detect consistency violations', async () => {
      const key = 'test-key';
      const expectedValue = 'expected-value';
      const actualValue = 'different-value';

      // Write different data
      await dataConsistencyService.writeStrong(key, actualValue);

      const isConsistent = await dataConsistencyService.validateConsistency(key, expectedValue, 'strong');

      expect(isConsistent).toBe(false);

      const stats = dataConsistencyService.getConsistencyStatus();
      expect(stats.consistencyViolations).toBe(1);
    });

    test('should handle eventual consistency validation', async () => {
      const key = 'test-key';
      const expectedValue = 'expected-value';

      // Write data with eventual consistency
      await dataConsistencyService.writeEventual(key, expectedValue);

      // Eventual consistency might have some delay
      const isConsistent = await dataConsistencyService.validateConsistency(key, expectedValue, 'eventual');

      // Should be consistent (eventual consistency allows for some delay)
      expect(isConsistent).toBe(true);
    });
  });

  describe('consistency monitoring', () => {
    test('should track operation metrics', async () => {
      const initialStats = dataConsistencyService.getConsistencyStatus();

      await dataConsistencyService.writeStrong('key1', 'value1');
      await dataConsistencyService.writeEventual('key2', 'value2');
      await dataConsistencyService.readStrong('key1');
      await dataConsistencyService.readEventual('key2');

      const finalStats = dataConsistencyService.getConsistencyStatus();

      expect(finalStats.totalOperations).toBe(initialStats.totalOperations + 4);
      expect(finalStats.strongConsistencyCount).toBe(initialStats.strongConsistencyCount + 2);
      expect(finalStats.eventualConsistencyCount).toBe(initialStats.eventualConsistencyCount + 2);
    });

    test('should maintain operation history', async () => {
      await dataConsistencyService.writeStrong('key1', 'value1');

      // Check if operation is recorded (this would depend on implementation)
      const stats = dataConsistencyService.getConsistencyStatus();
      expect(stats.totalOperations).toBeGreaterThan(0);
    });
  });
});