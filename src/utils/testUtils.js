/**
 * Test Utilities and Helpers
 */

// Mock data generators
export const createMockUser = (overrides = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  username: `user${Math.random().toString(36).substr(2, 5)}`,
  email: `user${Math.random().toString(36).substr(2, 5)}@example.com`,
  avatar: `https://example.com/avatar/${Math.random().toString(36).substr(2, 9)}.jpg`,
  followers: Math.floor(Math.random() * 1000),
  following: Math.floor(Math.random() * 500),
  ...overrides
});

export const createMockPost = (overrides = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  user: createMockUser(),
  media: `https://example.com/post/${Math.random().toString(36).substr(2, 9)}.jpg`,
  caption: `Test post caption ${Math.random().toString(36).substr(2, 10)} #hashtag`,
  likes: Math.floor(Math.random() * 1000),
  comments: Math.floor(Math.random() * 100),
  hashtags: ['test', 'hashtag', 'college'],
  createdAt: new Date().toISOString(),
  ...overrides
});

export const createMockNotification = (overrides = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  type: 'like',
  from: createMockUser(),
  post: createMockPost(),
  message: 'liked your post',
  read: false,
  createdAt: new Date().toISOString(),
  ...overrides
});

// Context providers for testing
export const createMockAuthContext = (overrides = {}) => ({
  user: createMockUser(),
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
  error: null,
  ...overrides
});

export const createMockSearchContext = (overrides = {}) => ({
  searchQuery: '',
  searchFilter: 'all',
  searchResults: {
    posts: Array.from({ length: 5 }, () => createMockPost()),
    users: Array.from({ length: 3 }, () => createMockUser()),
    hashtags: [
      { tag: '#college', useCount: 15420 },
      { tag: '#study', useCount: 8920 },
      { tag: '#exam', useCount: 5670 }
    ],
    total: 8
  },
  isSearching: false,
  currentPage: 1,
  resultsPerPage: 10,
  setCurrentPage: jest.fn(),
  performSearch: jest.fn(),
  clearSearch: jest.fn(),
  ...overrides
});

export const createMockNotificationContext = (overrides = {}) => ({
  notifications: Array.from({ length: 5 }, () => createMockNotification()),
  unreadCount: 3,
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  ...overrides
});

// Test wrapper components
export const TestWrapper = ({ children, contexts = {} }) => {
  const {
    auth = createMockAuthContext(),
    search = createMockSearchContext(),
    notifications = createMockNotificationContext()
  } = contexts;

  // Mock context providers would go here
  return children;
};

// Custom matchers
export const toBeVisibleInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  const isVisible = (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );

  return {
    pass: isVisible,
    message: () => `expected element to be visible in viewport`
  };
};

// Async utilities
export const waitForAsync = (callback, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      try {
        const result = callback();
        if (result) {
          resolve(result);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 100);
        }
      } catch (error) {
        reject(error);
      }
    };

    check();
  });
};

// API mocking utilities
export const mockApiResponse = (url, response, status = 200) => {
  global.fetch = jest.fn((requestUrl) => {
    if (requestUrl.includes(url)) {
      return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response))
      });
    }
    return Promise.reject(new Error('Network request failed'));
  });
};

export const mockApiError = (url, error = 'API Error', status = 500) => {
  global.fetch = jest.fn((requestUrl) => {
    if (requestUrl.includes(url)) {
      return Promise.resolve({
        ok: false,
        status,
        json: () => Promise.resolve({ error }),
        text: () => Promise.resolve(JSON.stringify({ error }))
      });
    }
    return Promise.reject(new Error('Network request failed'));
  });
};

// Local storage utilities for testing
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  return localStorageMock;
};

// Intersection Observer mock
export const mockIntersectionObserver = () => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }

    observe() {
      // Trigger intersection immediately for testing
      setTimeout(() => {
        this.callback([{
          isIntersecting: true,
          intersectionRatio: 1,
          target: { dataset: {} }
        }]);
      }, 0);
    }

    disconnect() {}
    unobserve() {}
  };
};

// Performance testing utilities
export const measurePerformance = async (fn, iterations = 100) => {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  return { avg, min, max, times };
};

// Accessibility testing utilities
export const checkAccessibility = (element) => {
  const issues = [];

  // Check for alt text on images
  const images = element.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push(`Image missing alt text: ${img.src}`);
    }
  });

  // Check for labels on form inputs
  const inputs = element.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const label = element.querySelector(`label[for="${input.id}"]`);
    if (!label && !input.getAttribute('aria-label') && !input.placeholder) {
      issues.push(`Input missing label: ${input.name || input.id}`);
    }
  });

  // Check for buttons with accessible names
  const buttons = element.querySelectorAll('button');
  buttons.forEach(button => {
    if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
      issues.push('Button missing accessible name');
    }
  });

  return issues;
};

// Test data factories
export const TestDataFactory = {
  user: createMockUser,
  post: createMockPost,
  notification: createMockNotification,

  // Bulk data generators
  users: (count) => Array.from({ length: count }, () => createMockUser()),
  posts: (count) => Array.from({ length: count }, () => createMockPost()),
  notifications: (count) => Array.from({ length: count }, () => createMockNotification()),

  // Specialized data
  trendingPosts: (count) => Array.from({ length: count }, (_, i) =>
    createMockPost({ likes: 1000 + i * 100, comments: 50 + i * 10 })
  ),

  popularUsers: (count) => Array.from({ length: count }, (_, i) =>
    createMockUser({ followers: 10000 + i * 1000 })
  )
};

export default {
  createMockUser,
  createMockPost,
  createMockNotification,
  createMockAuthContext,
  createMockSearchContext,
  createMockNotificationContext,
  TestWrapper,
  toBeVisibleInViewport,
  waitForAsync,
  mockApiResponse,
  mockApiError,
  mockLocalStorage,
  mockIntersectionObserver,
  measurePerformance,
  checkAccessibility,
  TestDataFactory
};