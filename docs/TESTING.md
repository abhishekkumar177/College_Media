# Testing Guide

This comprehensive guide covers the testing strategy and implementation for the College Media platform, including unit tests, integration tests, end-to-end tests, and CI/CD integration.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Strategy](#testing-strategy)
- [Project Setup](#project-setup)
- [Unit Testing](#unit-testing)
- [Component Testing](#component-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Test Coverage](#test-coverage)
- [Mocking Strategies](#mocking-strategies)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Testing Philosophy

Our testing approach follows these core principles:

- **Test-Driven Development (TDD)**: Write tests before implementing features
- **Quality over Quantity**: Focus on meaningful tests that provide value
- **Fast Feedback**: Tests should run quickly to enable rapid development
- **Maintainable**: Tests should be easy to understand and modify
- **Realistic**: Tests should reflect actual user behavior and edge cases

## Testing Strategy

### Testing Pyramid

We follow the testing pyramid approach:

```
End-to-End Tests (E2E)
    ↕️
Integration Tests
    ↕️
Unit Tests
```

- **Unit Tests** (80%): Test individual functions and components in isolation
- **Integration Tests** (15%): Test interactions between components and services
- **E2E Tests** (5%): Test complete user workflows from start to finish

### Test Categories

#### Frontend Tests
- **Component Tests**: UI component behavior and interactions
- **Hook Tests**: Custom React hooks logic
- **Utility Tests**: Helper functions and utilities
- **Integration Tests**: Component integration and data flow

#### Backend Tests
- **Unit Tests**: Individual functions and middleware
- **Integration Tests**: API endpoints and database operations
- **Authentication Tests**: JWT and security features

#### End-to-End Tests
- **User Journeys**: Complete user workflows
- **Critical Paths**: Login, posting, profile management
- **Cross-browser**: Compatibility across different browsers

## Project Setup

### Dependencies

#### Root Package (Jest-based)
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "msw": "^2.7.1"
  }
}
```

#### Frontend Package (Vitest-based)
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.5.1",
    "@vitest/ui": "^0.34.6",
    "jsdom": "^22.1.0",
    "playwright": "^1.40.1",
    "vitest": "^0.34.6"
  }
}
```

#### Backend Package (Jest-based)
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "mongodb-memory-server": "^8.15.0"
  }
}
```

### Configuration Files

#### Vitest Configuration (vitest.config.js)

```javascript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
      ],
    },
  },
})
```

#### Test Setup (src/test/setup.ts)

```typescript
import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

#### Jest Configuration (jest.config.cjs)

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/main.jsx',
    '!src/vite-env.d.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  }
}
```

#### Playwright Configuration (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Unit Testing

Unit tests focus on testing individual functions and utilities in isolation.

### Utility Function Testing

```javascript
// src/utils/formatters.test.js
import { describe, it, expect } from 'vitest'
import { formatDate, truncateText } from './formatters'

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z')
    expect(formatDate(date)).toBe('January 15, 2024')
  })

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
  })
})

describe('truncateText', () => {
  it('truncates text longer than max length', () => {
    const text = 'This is a very long text that should be truncated'
    expect(truncateText(text, 20)).toBe('This is a very long...')
  })

  it('returns original text if shorter than max length', () => {
    const text = 'Short text'
    expect(truncateText(text, 20)).toBe('Short text')
  })
})
```

### Custom Hook Testing

```javascript
// src/hooks/useLocalStorage.test.js
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns initial value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('returns stored value when it exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('stored-value')
  })

  it('updates stored value when setter is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    act(() => {
      result.current[1]('new-value')
    })
    expect(result.current[0]).toBe('new-value')
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'))
  })
})
```

## Component Testing

Component tests verify UI component behavior and user interactions.

### Basic Component Testing

```javascript
// src/components/Button.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct styles for variants', () => {
    render(<Button variant="primary">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-500')
  })

  it('is disabled when disabled prop is true', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    const button = screen.getByRole('button')

    expect(button).toBeDisabled()
    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
```

### Form Component Testing

```javascript
// src/components/LoginForm.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('submits form with valid data', async () => {
    const handleSubmit = vi.fn()
    const user = userEvent.setup()

    render(<LoginForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()

    render(<LoginForm onSubmit={() => {}} />)

    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()

    render(<LoginForm onSubmit={() => new Promise(resolve => setTimeout(resolve, 1000))} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(screen.getByText(/logging in/i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

## Integration Testing

Integration tests verify that different parts of the application work together correctly.

### API Integration Testing

```javascript
// backend/tests/integration/auth.test.js
const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const app = require('../server')
const User = require('../models/User')

describe('Authentication API', () => {
  let mongoServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    await mongoose.connect(mongoUri)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    await User.deleteMany({})
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('User registered successfully')

      const user = await User.findOne({ email: userData.email })
      expect(user).toBeTruthy()
      expect(user.username).toBe(userData.username)
    })

    it('should not register user with existing email', async () => {
      await User.create({
        username: 'existing',
        email: 'test@example.com',
        password: 'password123'
      })

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'test@example.com',
          password: 'Password123!'
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('User already exists')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      })
    })

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.accessToken).toBeDefined()
      expect(response.body.user).toBeDefined()
    })

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid credentials')
    })
  })
})
```

### Database Integration Testing

```javascript
// backend/tests/integration/userService.test.js
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const User = require('../models/User')
const userService = require('../services/userService')

describe('User Service', () => {
  let mongoServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    await mongoose.connect(mongoUri)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    await User.deleteMany({})
  })

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      }

      const user = await userService.createUser(userData)

      expect(user.username).toBe(userData.username)
      expect(user.email).toBe(userData.email)
      expect(user.firstName).toBe(userData.firstName)
      expect(user.password).not.toBe(userData.password) // Should be hashed
    })

    it('should throw error for duplicate email', async () => {
      const userData = {
        username: 'testuser1',
        email: 'test@example.com',
        password: 'Password123!'
      }

      await userService.createUser(userData)

      await expect(userService.createUser({
        ...userData,
        username: 'testuser2'
      })).rejects.toThrow('User already exists')
    })
  })

  describe('findUserById', () => {
    it('should find user by ID', async () => {
      const createdUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      })

      const user = await userService.findUserById(createdUser._id)

      expect(user.username).toBe('testuser')
      expect(user.email).toBe('test@example.com')
    })

    it('should return null for non-existent user', async () => {
      const user = await userService.findUserById('507f1f77bcf86cd799439011')
      expect(user).toBeNull()
    })
  })
})
```

## End-to-End Testing

E2E tests simulate real user interactions across the entire application.

### Playwright Test Examples

```javascript
// tests/e2e/auth.spec.js
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should allow user to register and login', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register')

    // Fill registration form
    await page.fill('[data-testid="username"]', 'testuser')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'Password123!')
    await page.fill('[data-testid="confirm-password"]', 'Password123!')

    // Submit form
    await page.click('[data-testid="register-button"]')

    // Should redirect to login or dashboard
    await expect(page).toHaveURL(/\/login|\/dashboard/)

    // Login with created account
    if (page.url().includes('/login')) {
      await page.fill('[data-testid="email"]', 'test@example.com')
      await page.fill('[data-testid="password"]', 'Password123!')
      await page.click('[data-testid="login-button"]')
    }

    // Should be logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="email"]', 'invalid@example.com')
    await page.fill('[data-testid="password"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials')
  })
})
```

```javascript
// tests/e2e/post-creation.spec.js
import { test, expect } from '@playwright/test'

test.describe('Post Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'Password123!')
    await page.click('[data-testid="login-button"]')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('should create a new post', async ({ page }) => {
    // Navigate to create post page
    await page.goto('/create-post')

    // Fill post form
    await page.fill('[data-testid="post-title"]', 'Test Post Title')
    await page.fill('[data-testid="post-content"]', 'This is a test post content.')

    // Upload image
    await page.setInputFiles('[data-testid="image-upload"]', 'tests/fixtures/test-image.jpg')

    // Submit post
    await page.click('[data-testid="submit-post"]')

    // Should redirect to post page
    await expect(page).toHaveURL(/\/post\/.+/)

    // Verify post content
    await expect(page.locator('[data-testid="post-title"]')).toContainText('Test Post Title')
    await expect(page.locator('[data-testid="post-content"]')).toContainText('This is a test post content.')
    await expect(page.locator('[data-testid="post-image"]')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/create-post')

    // Try to submit without content
    await page.click('[data-testid="submit-post"]')

    // Should show validation errors
    await expect(page.locator('[data-testid="content-error"]')).toContainText('Content is required')
  })

  test('should handle image upload errors', async ({ page }) => {
    await page.goto('/create-post')

    // Try to upload invalid file
    await page.setInputFiles('[data-testid="image-upload"]', 'tests/fixtures/invalid-file.txt')

    await expect(page.locator('[data-testid="upload-error"]')).toContainText('Invalid file type')
  })
})
```

### Visual Regression Testing

```javascript
// tests/e2e/visual-regression.spec.js
import { test, expect } from '@playwright/test'

test.describe('Visual Regression', () => {
  test('homepage should match visual baseline', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('homepage.png')
  })

  test('login form should match visual baseline', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('[data-testid="login-form"]')).toHaveScreenshot('login-form.png')
  })

  test('post card should match visual baseline', async ({ page }) => {
    await page.goto('/posts')
    await expect(page.locator('[data-testid="post-card"]').first()).toHaveScreenshot('post-card.png')
  })
})
```

## Performance Testing

Performance testing ensures that the application meets performance requirements and can handle expected load.

### Types of Performance Tests

#### Load Testing
- **API Load Testing**: Test API endpoints under various load conditions
- **Database Load Testing**: Test database queries and operations under load
- **Frontend Load Testing**: Test UI performance with multiple concurrent users

#### Stress Testing
- **Breaking Point Testing**: Find the maximum capacity of the system
- **Recovery Testing**: Test system recovery after failure
- **Spike Testing**: Test sudden increases in load

#### Endurance Testing
- **Memory Leak Testing**: Ensure no memory leaks over extended periods
- **Resource Usage Testing**: Monitor CPU, memory, and disk usage

### Performance Testing Tools

#### Lighthouse
```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'ready on',
      url: ['http://localhost:3000']
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
```

#### Artillery
```yaml
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
      name: Warm up
    - duration: 120
      arrivalRate: 5
      rampTo: 50
      name: Ramp up load
    - duration: 60
      arrivalRate: 50
      name: Sustained load

scenarios:
  - name: 'User journey'
    weight: 60
    flow:
      - get:
          url: '/'
      - post:
          url: '/api/auth/login'
          json:
            email: 'test@example.com'
            password: 'password123'
          capture:
            json: '$.accessToken'
            as: 'token'
      - get:
          url: '/api/posts'
          headers:
            Authorization: 'Bearer {{ token }}'
      - post:
          url: '/api/posts'
          headers:
            Authorization: 'Bearer {{ token }}'
          json:
            title: 'Performance Test Post'
            content: 'Testing performance under load'

  - name: 'API endpoints'
    weight: 40
    flow:
      - get:
          url: '/api/posts'
      - get:
          url: '/api/posts/featured'
```

#### k6
```javascript
// performance-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // below normal load
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 }, // normal load
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 }, // around the breaking point
    { duration: '5m', target: 300 },
    { duration: '2m', target: 400 }, // beyond the breaking point
    { duration: '5m', target: 400 },
    { duration: '10m', target: 0 }, // scale down. Recovery stage.
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
  },
}

const BASE_URL = 'http://localhost:3000'

export default function () {
  let response = http.get(`${BASE_URL}/api/posts`)
  check(response, { 'status is 200': (r) => r.status === 200 })

  sleep(1)
}
```

### Performance Metrics

#### Frontend Metrics
- **First Contentful Paint (FCP)**: Time for first content to appear
- **Largest Contentful Paint (LCP)**: Time for largest content element
- **First Input Delay (FID)**: Responsiveness to user input
- **Cumulative Layout Shift (CLS)**: Visual stability

#### Backend Metrics
- **Response Time**: API response times under load
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Memory Usage**: RAM consumption patterns
- **CPU Usage**: Processor utilization

#### Database Metrics
- **Query Execution Time**: Database query performance
- **Connection Pool Usage**: Database connection efficiency
- **Index Hit Rate**: Query optimization effectiveness

### Performance Testing in CI/CD

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lighthouse:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js 18.x
      uses: actions/setup-node@v4
      with:
        node-version: 18.x
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build

    - name: Run Lighthouse
      uses: treosh/lighthouse-ci-action@v10
      with:
        configPath: './lighthouse.config.js'
        uploadArtifacts: true
        temporaryPublicStorage: true

  load-test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js 18.x
      uses: actions/setup-node@v4
      with:
        node-version: 18.x
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Start application
      run: npm run dev &
      env:
        NODE_ENV: production

    - name: Wait for app to be ready
      run: |
        timeout 60 bash -c 'until curl -f http://localhost:3000 > /dev/null 2>&1; do sleep 1; done'

    - name: Run load tests
      run: npx artillery run artillery.yml --output report.json

    - name: Upload load test results
      uses: actions/upload-artifact@v3
      with:
        name: load-test-report
        path: report.json
```

### Performance Budgets

```javascript
// performance-budget.json
{
  "budgets": [
    {
      "path": "/",
      "resourceSizes": [
        {
          "resourceType": "document",
          "budget": 18
        },
        {
          "resourceType": "script",
          "budget": 150
        },
        {
          "resourceType": "stylesheet",
          "budget": 50
        }
      ],
      "resourceCounts": [
        {
          "resourceType": "total",
          "budget": 50
        }
      ],
      "timings": [
        {
          "metric": "interactive",
          "budget": 3000
        },
        {
          "metric": "first-meaningful-paint",
          "budget": 2000
        }
      ]
    }
  ]
}
```

## Test Coverage

### Coverage Requirements

- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 85%
- **Lines**: ≥ 80%

### Coverage Configuration

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.js',
        'src/main.jsx',
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 75,
          functions: 85,
          lines: 80,
        },
      },
    },
  },
})
```

### Coverage Report Analysis

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html

# Check coverage for specific files
npx vitest run --coverage --reporter=verbose
```

## Mocking Strategies

### API Mocking

```javascript
// src/test/mocks/handlers.js
import { rest } from 'msw'

export const handlers = [
  rest.get('/api/posts', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: '1',
            title: 'Mock Post',
            content: 'Mock content',
            author: 'Mock Author'
          }
        ]
      })
    )
  }),

  rest.post('/api/posts', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          id: '2',
          ...req.body
        }
      })
    )
  })
]
```

```javascript
// src/test/mocks/server.js
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

```javascript
// src/test/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Component Mocking

```javascript
// src/components/__mocks__/UserAvatar.jsx
const UserAvatar = ({ user, size = 'md' }) => {
  return `<div data-testid="user-avatar" data-size="${size}">
    Mock Avatar for ${user.name}
  </div>`
}

export default UserAvatar
```

### Service Mocking

```javascript
// src/services/__mocks__/api.js
export const api = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

// Mock implementations
api.get.mockResolvedValue({
  data: { success: true, data: [] }
})

api.post.mockResolvedValue({
  data: { success: true, data: { id: '123' } }
})
```

## CI/CD Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js 18.x
      uses: actions/setup-node@v4
      with:
        node-version: 18.x
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright
      run: npx playwright install --with-deps

    - name: Run E2E tests
      run: npm run test:e2e

    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

### Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:unit": "vitest --run tests/unit",
    "test:integration": "vitest --run tests/integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix"
  }
}
```

## Best Practices

### Writing Good Tests

1. **Descriptive Names**: Use clear, descriptive test names
2. **Single Responsibility**: Each test should verify one behavior
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Avoid Magic Numbers**: Use named constants
5. **Test Edge Cases**: Include boundary conditions and error scenarios

### Test Organization

```
tests/
├── unit/                 # Unit tests
│   ├── components/      # Component tests
│   ├── hooks/          # Hook tests
│   ├── utils/          # Utility tests
│   └── services/       # Service tests
├── integration/         # Integration tests
│   ├── api/            # API tests
│   └── database/       # Database tests
├── e2e/                # End-to-end tests
│   ├── auth.spec.js
│   ├── posts.spec.js
│   └── profile.spec.js
└── fixtures/           # Test data
    ├── users.json
    ├── posts.json
    └── images/
```

### Performance Considerations

- **Fast Tests**: Keep unit tests under 100ms each
- **Parallel Execution**: Run tests in parallel when possible
- **Selective Testing**: Use `--run` flag for specific test files
- **Mock Heavy Dependencies**: Mock slow operations like API calls

## Troubleshooting

### Common Test Issues

#### Tests Failing Randomly

**Symptoms**: Tests pass locally but fail in CI, or pass/fail inconsistently

**Solutions**:
- Check for race conditions in async code
- Ensure proper cleanup between tests
- Use unique test data to avoid conflicts
- Mock external dependencies consistently

#### Slow Test Suite

**Symptoms**: Test suite takes too long to run

**Solutions**:
- Profile tests to identify bottlenecks
- Mock slow operations (API calls, file I/O)
- Run tests in parallel
- Use test.skip() for temporarily disabled tests

#### Component Tests Not Finding Elements

**Symptoms**: `getByText` or `getByRole` queries failing

**Solutions**:
- Check component rendering with `screen.debug()`
- Verify element roles and accessible names
- Wait for async operations with `waitFor`
- Check for conditional rendering

#### API Tests Failing with Connection Errors

**Symptoms**: Integration tests failing with database/network errors

**Solutions**:
- Ensure test database is properly configured
- Check MongoDB Memory Server setup
- Verify environment variables
- Clean up test data between runs

#### Coverage Not Meeting Thresholds

**Symptoms**: Coverage reports show low percentages

**Solutions**:
- Add missing test cases for uncovered code
- Review exclusion patterns in coverage config
- Check if dead code can be removed
- Add integration tests for complex flows

### Debugging Tests

```javascript
// Add debug logging
test('debugging example', () => {
  console.log('Test data:', testData)
  // ... test code
})

// Use Vitest UI for interactive debugging
npm run test:ui

// Debug specific test
npm run test -- --reporter=verbose path/to/test

// Debug E2E tests
npx playwright test --debug
```

### Getting Help

- Check existing issues and discussions
- Review test examples in the codebase
- Ask questions in development discussions
- Refer to testing framework documentation:
  - [Vitest](https://vitest.dev/)
  - [Testing Library](https://testing-library.com/)
  - [Playwright](https://playwright.dev/)

This testing guide provides a comprehensive foundation for maintaining high-quality code through automated testing. Regular review and updates to the testing strategy will ensure the test suite remains effective as the application evolves.