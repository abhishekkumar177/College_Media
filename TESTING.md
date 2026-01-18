# Testing Guide

This document provides comprehensive information about the testing strategy and setup for the College Media application.

## 🧪 Testing Overview

The application implements a multi-layered testing strategy covering:

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint and service integration testing
- **End-to-End Tests**: Full user workflow testing
- **Performance Tests**: Load and performance validation
- **Accessibility Tests**: WCAG compliance verification

## 📁 Test Structure

```
tests/
├── unit/                          # Unit tests
│   ├── components/               # React component tests
│   ├── services/                 # Service layer tests
│   └── utils/                    # Utility function tests
├── integration/                  # Integration tests
│   ├── api/                      # API endpoint tests
│   └── services/                 # Cross-service tests
├── e2e/                          # End-to-end tests
│   ├── basic-flows.spec.js       # Core user flows
│   └── api-tests.spec.js         # API testing
└── utils/                        # Test utilities and helpers
```

## 🚀 Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# For backend tests
cd backend && npm install

# For E2E tests
npx playwright install
```

### Test Commands

```bash
# Run all tests
npm run test:all

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run tests in CI mode (lint + coverage + integration)
npm run test:ci

# Generate and view coverage report
npm run test:report
```

### Backend-Specific Tests

```bash
cd backend

# Run backend unit tests
npm run test:unit

# Run backend integration tests
npm run test:integration

# Run all backend tests
npm test
```

### Service-Specific Tests

```bash
# Collab Service
cd collab-service && npm test

# Notification Service
cd notification-service && npm test
```

## 📊 Coverage Requirements

### Global Coverage Thresholds
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

### Component-Specific Thresholds
- **Components**: 75% (higher UX importance)
- **Hooks**: 80% (critical business logic)
- **Utils**: 85% (shared functionality)

## 🛠️ Test Configuration

### Jest Configuration (`jest.config.cjs`)

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  coverageThreshold: { /* thresholds */ },
  // ... additional config
};
```

### Playwright Configuration (`playwright.config.js`)

```javascript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] }
  ],
  webServer: [ /* dev servers */ ]
});
```

## 🧰 Test Utilities

### Test Helpers (`src/utils/testUtils.js`)

```javascript
import { TestDataFactory, createMockUser, mockApiResponse } from './testUtils';

// Generate mock data
const user = createMockUser({ username: 'testuser' });
const posts = TestDataFactory.posts(5);

// Mock API responses
mockApiResponse('/api/users', [user]);
```

### Available Test Utilities

- **Data Generators**: `createMockUser`, `createMockPost`, `createMockNotification`
- **Context Mocks**: Auth, Search, Notification contexts
- **API Mocks**: `mockApiResponse`, `mockApiError`
- **DOM Helpers**: Custom matchers and utilities
- **Performance Tools**: `measurePerformance`
- **Accessibility**: `checkAccessibility`

## 📝 Writing Tests

### Unit Test Example

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { createMockUser } from '../utils/testUtils';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  test('displays user information', () => {
    const mockUser = createMockUser({
      username: 'johndoe',
      followers: 150
    });

    render(<UserProfile user={mockUser} />);

    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.getByText('150 followers')).toBeInTheDocument();
  });
});
```

### Integration Test Example

```javascript
const request = require('supertest');
const app = require('../server');

describe('User API', () => {
  test('creates new user', async () => {
    const userData = {
      username: 'newuser',
      email: 'new@example.com'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(userData.username);
  });
});
```

### E2E Test Example

```javascript
import { test, expect } from '@playwright/test';

test('user can register and login', async ({ page }) => {
  await page.goto('/register');

  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/login');

  // Login with created account
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

## 🔧 CI/CD Integration

### GitHub Actions Workflow

The CI/CD pipeline includes:

1. **Linting**: ESLint code quality checks
2. **Unit Tests**: Frontend and backend unit tests
3. **Integration Tests**: API and service integration
4. **E2E Tests**: Full browser automation
5. **Coverage Reports**: Codecov integration
6. **Performance Tests**: Load testing with Artillery
7. **Security Audit**: Dependency vulnerability checks

### Workflow Stages

```yaml
jobs:
  test-frontend:     # Unit tests, coverage
  test-backend:      # Backend tests
  test-services:     # Microservice tests
  e2e-tests:         # End-to-end tests
  build-and-deploy:  # Build and deploy
  quality-gate:      # Final validation
  performance-test:  # Load testing
```

## 📈 Coverage Reporting

### Local Coverage

```bash
npm run test:coverage
# Opens coverage report in browser
npm run test:report
```

### CI Coverage

Coverage reports are automatically uploaded to Codecov and displayed in PRs.

## 🐛 Debugging Tests

### Common Issues

1. **Async Tests**: Use `await` and `waitFor`
2. **Mock Setup**: Clear mocks between tests
3. **DOM Queries**: Prefer `getByRole` over `getByTestId`
4. **Network Requests**: Mock external APIs

### Debugging Commands

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test file
npm test -- Login.test.jsx

# Run tests with coverage for specific file
npm run test:coverage -- --testPathPattern=Login.test.jsx
```

## 🎯 Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Mock Strategy
- Mock external dependencies
- Use realistic test data
- Avoid over-mocking

### Performance
- Keep tests fast (< 100ms per test)
- Use `beforeAll` for expensive setup
- Parallelize where possible

### Accessibility
- Test keyboard navigation
- Verify ARIA labels
- Check color contrast
- Test screen reader compatibility

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Maintain coverage thresholds
3. Update this documentation
4. Run full test suite before PR

---

**Test Coverage Status**: ✅ All tests passing
**CI/CD Status**: ✅ Pipeline configured
**E2E Status**: ✅ Browser automation ready