# 🧪 Testing Guide for College Media

## Overview

This project uses **Vitest** as the testing framework and **React Testing Library** for component testing. This guide will help you understand how to write, run, and maintain tests.

## Table of Contents

- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)

---

## Getting Started

### Prerequisites

All testing dependencies are already installed. If you need to reinstall:

```bash
npm install --legacy-peer-deps
```

### Test Setup

The test environment is configured in:
- `vitest.config.js` - Main Vitest configuration
- `src/setupTests.js` - Global test setup and mocks

---

## Running Tests

### Available Commands

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests with UI dashboard
npm run test:ui

# Run all tests once (useful for CI)
npm run test:run

# Generate coverage report
npm run test:coverage
```

### Watch Mode

Watch mode automatically reruns tests when files change:

```bash
npm test
```

Press `q` to quit, `a` to run all tests, `f` to run only failed tests.

### UI Mode

For a visual testing experience:

```bash
npm run test:ui
```

This opens an interactive dashboard at `http://localhost:51204`

---

## Writing Tests

### Test File Structure

Place test files next to the component they test or in a `__tests__` directory:

```
src/
  components/
    Navbar.jsx
    __tests__/
      Navbar.test.jsx
```

### Basic Test Template

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<YourComponent />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText(/result/i)).toBeInTheDocument();
  });
});
```

### Testing Components with Context

```jsx
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Component with Context', () => {
  it('works with context', () => {
    renderWithProviders(<MyComponent />);
    // Your assertions here
  });
});
```

### Mocking Modules

```jsx
import { vi } from 'vitest';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '1', username: 'testuser' },
  })),
}));
```

### Testing User Interactions

```jsx
import userEvent from '@testing-library/user-event';

it('handles text input', async () => {
  const user = userEvent.setup();
  render(<MyForm />);
  
  const input = screen.getByPlaceholderText(/enter text/i);
  await user.type(input, 'Hello World');
  
  expect(input).toHaveValue('Hello World');
});
```

### Testing Async Operations

```jsx
import { waitFor } from '@testing-library/react';

it('loads data', async () => {
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText(/loaded/i)).toBeInTheDocument();
  });
});
```

---

## Best Practices

### 1. Follow the Testing Trophy

Focus on:
- ✅ Integration tests (most valuable)
- ✅ Unit tests for complex logic
- ✅ E2E tests for critical paths

### 2. Query Priority

Use queries in this order:
1. `getByRole` - Best for accessibility
2. `getByLabelText` - Great for forms
3. `getByPlaceholderText` - For inputs
4. `getByText` - For content
5. `getByTestId` - Last resort

```jsx
// ✅ Good - Accessible
const button = screen.getByRole('button', { name: /submit/i });

// ❌ Avoid - Not accessible
const button = screen.getByTestId('submit-button');
```

### 3. Test Behavior, Not Implementation

```jsx
// ✅ Good - Tests user behavior
it('shows error message when form is invalid', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  
  await user.click(screen.getByRole('button', { name: /login/i }));
  
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});

// ❌ Bad - Tests implementation details
it('sets error state to true', () => {
  const { result } = renderHook(() => useLoginForm());
  act(() => result.current.validate());
  expect(result.current.hasError).toBe(true);
});
```

### 4. Use Descriptive Test Names

```jsx
// ✅ Good
it('displays error message when email is invalid');
it('submits form when all fields are valid');
it('disables submit button while loading');

// ❌ Bad
it('works correctly');
it('test 1');
it('should work');
```

### 5. Keep Tests Independent

Each test should run independently without relying on others.

```jsx
// ✅ Good
describe('Counter', () => {
  it('starts at zero', () => {
    render(<Counter />);
    expect(screen.getByText(/count: 0/i)).toBeInTheDocument();
  });

  it('increments when button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByRole('button', { name: /increment/i }));
    expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
  });
});
```

### 6. Clean Up After Tests

```jsx
import { beforeEach, afterEach, vi } from 'vitest';

beforeEach(() => {
  // Setup before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  vi.clearAllTimers();
});
```

---

## Test Coverage

### Viewing Coverage

Generate a coverage report:

```bash
npm run test:coverage
```

Open the HTML report:

```bash
# The report is in coverage/index.html
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

### Coverage Goals

- **Statements**: 80%+
- **Branches**: 70%+
- **Functions**: 80%+
- **Lines**: 80%+

### Excluding Files from Coverage

Add to `vitest.config.js`:

```js
coverage: {
  exclude: [
    'node_modules/',
    'src/setupTests.js',
    '**/*.config.js',
    '**/mockData.js',
  ],
}
```

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request

See `.github/workflows/test.yml` for configuration.

### Pre-commit Hook (Optional)

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
npm run test:run
```

---

## Testing Checklist

When writing tests for a component:

- [ ] Renders without crashing
- [ ] Displays correct initial content
- [ ] Handles user interactions (clicks, typing, etc.)
- [ ] Shows loading states appropriately
- [ ] Displays error messages correctly
- [ ] Has proper accessibility attributes
- [ ] Works with different props
- [ ] Calls callbacks with correct arguments
- [ ] Handles edge cases (empty states, errors, etc.)

---

## Common Issues & Solutions

### Issue: Tests timeout

**Solution**: Increase timeout in `vitest.config.js`:

```js
test: {
  testTimeout: 10000,
}
```

### Issue: Module not found

**Solution**: Check path aliases in `vitest.config.js`:

```js
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Issue: Mock not working

**Solution**: Make sure to clear mocks between tests:

```js
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Contributing

When adding new features:

1. Write tests for new components
2. Update existing tests if behavior changes
3. Run `npm run test:coverage` to ensure coverage stays high
4. Include test results in your PR

---

**Happy Testing! 🎉**
