# Testing Documentation

## Overview

This document outlines the comprehensive testing strategy for College Media, a React-based social media platform. Testing is crucial for ensuring code quality, preventing regressions, and maintaining a reliable user experience.

## Testing Strategy

### Testing Pyramid

We follow a balanced testing pyramid approach:

```
End-to-End Tests (E2E)
    ↕️
Integration Tests
    ↕️
Unit Tests
```

### Test Types

#### 1. Unit Tests
- **Purpose**: Test individual functions, components, and utilities in isolation
- **Coverage**: Business logic, component rendering, state management, utility functions
- **Tools**: Jest + React Testing Library

#### 2. Integration Tests
- **Purpose**: Test interactions between components and external services
- **Coverage**: Component interactions, API calls, data flow
- **Tools**: Jest + React Testing Library + MSW (Mock Service Worker)

#### 3. End-to-End (E2E) Tests
- **Purpose**: Test complete user workflows from start to finish
- **Coverage**: Critical user journeys, cross-browser compatibility
- **Tools**: Cypress

## Testing Tools

### Jest
**Primary testing framework for unit and integration tests**
- Fast test execution with parallel processing
- Rich assertion library and mocking capabilities
- Built-in code coverage reporting
- Watch mode for development

### React Testing Library
**Testing utilities for React components**
- Focus on user behavior rather than implementation details
- Encourages accessible testing practices
- Lightweight and focused on component testing

### Cypress
**End-to-end testing framework**
- Real browser testing with fast execution
- Excellent debugging capabilities
- Automatic waiting and retry logic
- Great developer experience

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs all testing dependencies defined in `package.json`:
- `jest` - Testing framework
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - Custom Jest matchers
- `@testing-library/user-event` - User interaction simulation
- `cypress` - E2E testing
- `jest-environment-jsdom` - DOM environment for Jest

### 2. Jest Configuration

Create `jest.config.js` in the project root:

```javascript
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/vite-env.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### 3. Setup Test Files

Create `src/setupTests.js`:

```javascript
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};
```

Create `src/__mocks__/fileMock.js`:

```javascript
export default 'test-file-stub';
```

### 4. Cypress Configuration

Cypress is configured automatically when installed. Create `cypress.config.js` if needed:

```javascript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
```

## Writing Tests

### Unit Tests - Component Testing

#### PostCard Component Testing

```jsx
// src/components/PostCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostCard from './PostCard';

const mockPost = {
  id: 1,
  user: {
    username: 'testuser',
    avatar: 'https://example.com/avatar.jpg'
  },
  media: 'https://example.com/post.jpg',
  caption: 'Test post caption #hashtag',
  likes: 42,
  comments: 7
};

describe('PostCard', () => {
  test('renders post content correctly', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText(/Test post caption/)).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  test('handles like button click', async () => {
    const user = userEvent.setup();
    const mockOnLike = jest.fn();

    render(<PostCard post={mockPost} onLike={mockOnLike} />);

    const likeButton = screen.getByRole('button', { name: /like/i });
    await user.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledWith(1);
  });

  test('updates like count when liked', async () => {
    const user = userEvent.setup();
    let likedPosts = {};

    const TestWrapper = () => {
      const [likes, setLikes] = useState(likedPosts);

      const handleLike = (postId) => {
        setLikes(prev => ({
          ...prev,
          [postId]: !prev[postId]
        }));
      };

      return (
        <PostCard
          post={mockPost}
          onLike={handleLike}
          isLiked={likes[1]}
        />
      );
    };

    render(<TestWrapper />);

    const likeButton = screen.getByRole('button', { name: /like/i });
    await user.click(likeButton);

    expect(screen.getByText('43')).toBeInTheDocument(); // 42 + 1
  });

  test('displays correct comment count', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
```

#### Testing User Interactions

```jsx
// Testing search functionality
test('filters posts based on search query', async () => {
  const user = userEvent.setup();
  const mockPosts = [
    { id: 1, caption: 'Hello world' },
    { id: 2, caption: 'React testing' }
  ];

  render(<PostFeed posts={mockPosts} />);

  const searchInput = screen.getByPlaceholderText(/search/i);
  await user.type(searchInput, 'React');

  expect(screen.getByText('React testing')).toBeInTheDocument();
  expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
});
```

### API Mocking with MSW

```jsx
// src/__mocks__/handlers.js
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/posts', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          user: { username: 'testuser' },
          caption: 'Mocked post',
          likes: 10
        }
      ])
    );
  }),

  rest.post('/api/posts/:id/like', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({ success: true, likes: 11 })
    );
  })
];

// src/__mocks__/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```jsx
// Integration test with API mocking
describe('PostCard with API', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('likes post and updates count', async () => {
    const user = userEvent.setup();
    render(<PostCard post={mockPost} />);

    const likeButton = screen.getByRole('button', { name: /like/i });
    await user.click(likeButton);

    await waitFor(() => {
      expect(screen.getByText('11')).toBeInTheDocument();
    });
  });
});
```

### End-to-End Tests with Cypress

```javascript
// cypress/e2e/post-interactions.cy.js
describe('Post Interactions', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display posts on homepage', () => {
    cy.get('[data-testid="post-card"]').should('have.length.greaterThan', 0);
  });

  it('should allow liking a post', () => {
    cy.get('[data-testid="like-button"]').first().click();
    cy.get('[data-testid="like-count"]').should('contain', '43');
  });

  it('should navigate to user profile', () => {
    cy.get('[data-testid="user-avatar"]').first().click();
    cy.url().should('include', '/profile');
  });

  it('should search for posts', () => {
    cy.get('[data-testid="search-input"]').type('nature');
    cy.get('[data-testid="post-card"]').should('have.length.greaterThan', 0);
  });
});

// cypress/e2e/navigation.cy.js
describe('Navigation', () => {
  it('should navigate between sections', () => {
    cy.visit('/');

    cy.get('[data-testid="nav-explore"]').click();
    cy.url().should('include', '/explore');

    cy.get('[data-testid="nav-home"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
```

## Coverage Goals

We aim for **80%+ code coverage** across all metrics:

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Coverage Configuration

Coverage is configured in `jest.config.js` with thresholds. Coverage reports are generated in the `coverage/` directory.

### Coverage Report Analysis

```bash
npm run test:coverage
```

This generates an HTML report in `coverage/lcov-report/index.html` showing:
- File-by-file coverage breakdown
- Uncovered lines highlighted
- Coverage trends over time

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test PostCard.test.jsx

# Run tests matching pattern
npm test -- --testNamePattern="should handle like"
```

### End-to-End Tests

```bash
# Run E2E tests headlessly
npm run test:e2e

# Open Cypress test runner (interactive)
npm run test:e2e:open
```

### Development Workflow

1. **Write Code**: Implement features with test-driven development
2. **Write Tests**: Create corresponding tests
3. **Run Tests**: Ensure all tests pass
4. **Check Coverage**: Verify coverage meets thresholds
5. **Debug Failures**: Use debugging tools when tests fail

## Debugging Test Failures

### Common Issues & Solutions

#### 1. Async Operations
```jsx
// ❌ Wrong - doesn't wait for async operation
test('loads posts', () => {
  render(<PostFeed />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

// ✅ Correct - waits for async operation
test('loads posts', async () => {
  render(<PostFeed />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Post content')).toBeInTheDocument();
  });
});
```

#### 2. Missing Test Setup
```jsx
// Ensure proper setup for components using hooks
test('component with useEffect', () => {
  render(
    <TestWrapper>
      <YourComponent />
    </TestWrapper>
  );
});
```

#### 3. Cypress Debugging
```javascript
// Add debugging to Cypress tests
cy.get('[data-testid="button"]').debug().click();

// Pause execution
cy.pause();

// Take screenshot on failure
cy.screenshot();
```

### Debugging Tools

#### Jest Debugging
- Use `debugger` statements in test code
- Run tests with `--inspect-brk` flag
- Use `console.log` for debugging (remove before commit)

#### Cypress Debugging
- Use `cy.debug()` to pause and inspect
- Use `cy.pause()` for manual stepping
- Check Cypress logs in the test runner
- Use browser dev tools during test execution

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run unit tests
        run: npm run test:coverage

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Coverage Reporting

We use Codecov for coverage tracking:
- Automatic PR comments with coverage changes
- Coverage badges in README
- Historical coverage trends
- Coverage alerts for drops below thresholds

## Test Case Templates

### Unit Test Template

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from './Component';

describe('Component', () => {
  // Setup
  const defaultProps = {
    // ... default props
  };

  beforeEach(() => {
    // Common setup
  });

  describe('Rendering', () => {
    test('renders correctly with default props', () => {
      render(<Component {...defaultProps} />);
      // Assertions
    });
  });

  describe('Interactions', () => {
    test('handles user interaction', async () => {
      const user = userEvent.setup();
      render(<Component {...defaultProps} />);

      // Interaction
      await user.click(screen.getByRole('button'));

      // Assertions
    });
  });

  describe('Edge Cases', () => {
    test('handles error state', () => {
      // Test error scenarios
    });
  });
});
```

### E2E Test Template

```javascript
describe('Feature', () => {
  beforeEach(() => {
    cy.visit('/');
    // Setup test data if needed
  });

  it('completes happy path', () => {
    // Arrange
    cy.get('[data-testid="element"]').should('be.visible');

    // Act
    cy.get('[data-testid="button"]').click();

    // Assert
    cy.get('[data-testid="result"]').should('contain', 'Expected text');
  });

  it('handles error scenarios', () => {
    // Test error flows
  });
});
```

## Roadmap Integration

This testing setup aligns with **Phase 4** of our development roadmap:

### Phase 4: Optimization & Enhancement (Q4 2026)
- ✅ **Unit & Integration Tests** (Jest, React Testing Library)
- ✅ **E2E Testing** (Cypress/Playwright)
- 🔄 Performance Optimization & Caching
- 🔄 Progressive Web App (PWA) Functionality
- 🔄 Offline support

### Future Enhancements
- Visual regression testing (Chromatic/Storybook)
- Performance testing (Lighthouse CI)
- Accessibility testing (axe-core)
- Contract testing for APIs

## Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow `Arrange-Act-Assert` pattern
- Keep tests focused and independent

### Naming Conventions
- Test files: `Component.test.jsx`
- Test descriptions: `should render correctly`
- Mock files: `__mocks__/api.js`

### Code Quality
- Avoid testing implementation details
- Test user behavior and outcomes
- Keep tests maintainable and readable
- Use page objects for complex E2E tests

### Performance
- Run tests in parallel when possible
- Use appropriate test isolation
- Mock external dependencies
- Keep test suites fast for CI/CD

## Troubleshooting

### Common Issues

**Tests failing intermittently**
- Check for race conditions in async code
- Ensure proper cleanup between tests
- Use `waitFor` for async assertions

**Cypress tests timing out**
- Increase timeout values if needed
- Check for slow network requests
- Ensure elements are properly awaited

**Coverage not updating**
- Clear Jest cache: `npx jest --clearCache`
- Check coverage configuration
- Ensure files are included in coverage collection

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Library Guides](https://testing-library.com/docs/)
- [MSW Documentation](https://mswjs.io/)

---

*This testing documentation is part of College Media's commitment to quality and reliability. Regular updates ensure our testing practices evolve with the project.*
