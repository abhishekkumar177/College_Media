/**
 * Test Setup - Global test configuration
 * Issue #245: Testing Infrastructure
 */

import { afterEach, beforeAll, afterAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import { handlers } from "./mocks/handlers";
import "@testing-library/jest-dom";

// Setup MSW server
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  cleanup();
  // Clear all mocks after each test
  vi.clearAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock WebSocket
global.WebSocket = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  send: vi.fn(),
  close: vi.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}));

// Global test utilities
global.testUtils = {
  // Create mock user
  createMockUser: (overrides = {}) => ({
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'student',
    avatar: 'https://example.com/avatar.jpg',
    isVerified: true,
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  // Create mock post
  createMockPost: (overrides = {}) => ({
    id: 'post-123',
    content: 'Test post content',
    author: global.testUtils.createMockUser(),
    likes: [],
    comments: [],
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  // Create mock comment
  createMockComment: (overrides = {}) => ({
    id: 'comment-123',
    content: 'Test comment',
    author: global.testUtils.createMockUser(),
    postId: 'post-123',
    likes: [],
    replies: [],
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  // Mock API responses
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  }),

  // Mock fetch for specific endpoint
  mockFetch: (url, response, method = 'GET') => {
    global.fetch.mockImplementation((fetchUrl, options = {}) => {
      if (fetchUrl.includes(url) && (!method || options.method === method)) {
        return Promise.resolve(global.testUtils.mockApiResponse(response));
      }
      return Promise.reject(new Error('Network error'));
    });
  },

  // Wait for component updates
  waitForNextTick: () => new Promise(resolve => setTimeout(resolve, 0)),

  // Mock file
  createMockFile: (name = 'test.jpg', type = 'image/jpeg', size = 1024) => {
    const file = new File(['test'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  },

  // Mock form data
  createMockFormData: (fields = {}) => {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  }
};

// Performance testing utilities
global.performanceUtils = {
  // Measure component render time
  measureRenderTime: async (component, iterations = 10) => {
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      // Render component logic here
      const end = performance.now();
      times.push(end - start);
    }
    return {
      average: times.reduce((a, b) => a + b) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      times
    };
  },

  // Memory usage tracking
  getMemoryUsage: () => {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
};
