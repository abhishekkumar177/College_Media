/**
 * Backend API Integration Tests
 * Tests the integrated backend services and APIs
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../backend/server');

// Mock external services for testing
jest.mock('../backend/services/circuitBreakerService');
jest.mock('../backend/services/dataConsistencyService');
jest.mock('../backend/services/runawayJobProtectionService');
jest.mock('../backend/services/distributedSagaService');

describe('Backend API Integration Tests', () => {
  let mongoServer;
  let server;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to test database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Start the server
    server = app.listen(5001);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    server.close();
  });

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();

    // Clear database collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('Health Check Endpoint', () => {
    test('GET / - should return health status', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('service', 'College Media API');
      expect(response.body).toHaveProperty('correlationId');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('cpu');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should include correlation ID in response', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.correlationId).toBeDefined();
      expect(typeof response.body.correlationId).toBe('string');
    });
  });

  describe('System Monitoring Endpoints', () => {
    test('GET /api/system/consistency - should return consistency status', async () => {
      const mockConsistencyService = require('../backend/services/dataConsistencyService');
      mockConsistencyService.getConsistencyStatus = jest.fn().mockReturnValue({
        strongConsistencyCount: 5,
        eventualConsistencyCount: 3,
        totalOperations: 8
      });

      const response = await request(app)
        .get('/api/system/consistency')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('correlationId');
      expect(response.body.data).toHaveProperty('strongConsistencyCount', 5);
    });

    test('GET /api/system/jobs - should return job statistics', async () => {
      const mockJobService = require('../backend/services/runawayJobProtectionService');
      mockJobService.getStats = jest.fn().mockReturnValue({
        activeJobs: 2,
        completedJobs: 15,
        failedJobs: 1,
        totalJobs: 18
      });

      const response = await request(app)
        .get('/api/system/jobs')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('activeJobs', 2);
      expect(response.body.data).toHaveProperty('completedJobs', 15);
    });

    test('GET /api/system/jobs/:jobId - should return specific job status', async () => {
      const mockJobService = require('../backend/services/runawayJobProtectionService');
      mockJobService.getJobStatus = jest.fn().mockReturnValue({
        id: 'job-123',
        status: 'running',
        progress: 50,
        startTime: new Date().toISOString()
      });

      const response = await request(app)
        .get('/api/system/jobs/job-123')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', 'job-123');
      expect(response.body.data).toHaveProperty('status', 'running');
    });

    test('GET /api/system/jobs/:jobId - should return 404 for non-existent job', async () => {
      const mockJobService = require('../backend/services/runawayJobProtectionService');
      mockJobService.getJobStatus = jest.fn().mockReturnValue(null);

      const response = await request(app)
        .get('/api/system/jobs/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Job not found');
    });

    test('DELETE /api/system/jobs/:jobId - should cancel job', async () => {
      const mockJobService = require('../backend/services/runawayJobProtectionService');
      mockJobService.cancelJob = jest.fn().mockReturnValue(true);

      const response = await request(app)
        .delete('/api/system/jobs/job-123')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Job cancelled');
    });

    test('GET /api/system/sagas - should return saga statistics', async () => {
      const mockSagaService = require('../backend/services/distributedSagaService');
      mockSagaService.getSagaStats = jest.fn().mockReturnValue({
        activeSagas: 1,
        completedSagas: 10,
        failedSagas: 2,
        totalSagas: 13
      });

      const response = await request(app)
        .get('/api/system/sagas')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('activeSagas', 1);
    });

    test('GET /api/system/circuits - should return circuit breaker statuses', async () => {
      const mockCircuitService = require('../backend/services/circuitBreakerService');
      mockCircuitService.getAllStatuses = jest.fn().mockReturnValue({
        'api-service': {
          name: 'api-service',
          state: 'CLOSED',
          failureCount: 0,
          successCount: 5
        }
      });

      const response = await request(app)
        .get('/api/system/circuits')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('api-service');
    });

    test('GET /api/system/circuits/:serviceName - should return specific circuit status', async () => {
      const mockCircuitService = require('../backend/services/circuitBreakerService');
      mockCircuitService.getStatus = jest.fn().mockReturnValue({
        name: 'api-service',
        state: 'OPEN',
        failureCount: 5,
        nextAttempt: Date.now() + 10000
      });

      const response = await request(app)
        .get('/api/system/circuits/api-service')
        .expect(200);

      expect(response.body.data).toHaveProperty('state', 'OPEN');
    });

    test('POST /api/system/circuits/:serviceName/reset - should reset circuit breaker', async () => {
      const mockCircuitService = require('../backend/services/circuitBreakerService');
      mockCircuitService.reset = jest.fn().mockReturnValue(true);

      const response = await request(app)
        .post('/api/system/circuits/api-service/reset')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Circuit breaker reset');
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Not Found');
    });

    test('should include correlation ID in error responses', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('correlationId');
    });
  });

  describe('Request Deadline Middleware', () => {
    test('should handle requests within deadline', async () => {
      const response = await request(app)
        .get('/')
        .set('x-request-deadline', Date.now() + 30000)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('should handle requests without deadline header', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Rate Limiting', () => {
    test('should allow requests within rate limits', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    // Note: Rate limiting tests would require more complex setup
    // with Redis or similar for distributed rate limiting
  });
});