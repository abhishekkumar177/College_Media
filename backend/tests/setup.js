/**
 * Backend Test Setup
 */

// Load environment variables for testing
require('dotenv').config({ path: '.env.test' });

// Mock external services
jest.mock('../config/tracing', () => ({
  trace: {
    getTracer: () => ({
      startActiveSpan: (name, fn) => fn({ setAttribute: jest.fn(), recordException: jest.fn(), setStatus: jest.fn(), end: jest.fn() })
    })
  },
  context: {}
}));

// Mock database connection
jest.mock('../config/db', () => ({
  initDB: jest.fn().mockResolvedValue({})
}));

// Mock secrets initialization
jest.mock('../config/vault', () => ({
  initSecrets: jest.fn().mockResolvedValue({})
}));

// Mock resilience manager
jest.mock('../services/resilienceManager', () => ({
  startMonitoring: jest.fn()
}));

// Mock live stream service
jest.mock('../services/liveStreamService', () => ({
  start: jest.fn()
}));

// Mock sync listeners
jest.mock('../listeners/mongoSync', () => jest.fn());
jest.mock('../listeners/eventConsumer', () => jest.fn().mockResolvedValue({}));

// Mock socket initializers
jest.mock('../sockets/notifications', () => ({
  initNotificationSockets: jest.fn()
}));

jest.mock('../sockets/collab', () => ({
  initCollabSockets: jest.fn()
}));

jest.mock('../sockets/careerExpo', () => ({
  initCareerExpoSockets: jest.fn()
}));

// Mock routes
jest.mock('../routes/resume', () => jest.fn());
jest.mock('../routes/upload', () => jest.fn());

// Mock GraphQL
jest.mock('../graphql/typeDefs', () => 'type Query { test: String }');
jest.mock('../graphql/resolvers', () => ({}));
jest.mock('../graphql/context', () => jest.fn());

// Mock middleware
jest.mock('../middleware/distributedRateLimit', () => jest.fn(() => (req, res, next) => next()));

// Global test utilities
global.testUtils = {
  createMockRequest: (overrides = {}) => ({
    correlationId: 'test-correlation-id',
    headers: {},
    body: {},
    params: {},
    query: {},
    ...overrides
  }),

  createMockResponse: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis()
    };
    return res;
  },

  createMockNext: () => jest.fn()
};

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.METRICS_TOKEN = 'test-metrics-token';