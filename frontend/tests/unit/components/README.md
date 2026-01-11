# Unit Tests for Core Components

This directory contains comprehensive unit tests for the core components of the College Media application, addressing issue #348.

## Test Coverage

### Components Tested

1. **Post.test.jsx** - Post component
2. **CreatePost.test.jsx** - CreatePost component  
3. **SearchBar.test.jsx** - SearchBar component
4. **NotificationCenter.test.jsx** - NotificationCenter component

## Test Structure

Each test file follows a consistent structure:

```
Component Tests
├── Rendering
├── Core Functionality
├── User Interactions
├── Loading States
├── Empty States
├── Accessibility
└── Edge Cases
```

## Running Tests

### Run all component tests
```bash
npm test tests/unit/components/
```

### Run a specific component test
```bash
npm test tests/unit/components/Post.test.jsx
```

### Run tests in watch mode
```bash
npm test
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests with UI
```bash
npm run test:ui
```

## Test Coverage Goals

- ✅ **Post Component**: 80%+ coverage
  - Rendering with various props
  - Like/unlike functionality
  - Copy link feature
  - More options menu
  - Poll display
  - Accessibility features
  - Edge cases (zero likes, long captions, etc.)

- ✅ **CreatePost Component**: 80%+ coverage
  - Form rendering
  - Caption input with character counter
  - Image upload and preview
  - Poll creation
  - Form submission
  - Validation (empty, whitespace)
  - Accessibility
  - Edge cases (special characters, rapid submissions)

- ✅ **SearchBar Component**: 80%+ coverage
  - Search input rendering
  - Suggestion fetching and display
  - Search submission
  - Keyboard shortcuts (Ctrl+K)
  - Search history
  - Clear functionality
  - Accessibility
  - Edge cases (special characters, long queries)

- ✅ **NotificationCenter Component**: 80%+ coverage
  - Notification list rendering
  - Filtering by type
  - Mark all as read
  - Clear all notifications
  - Infinite scroll / Load more
  - Loading states
  - Empty states
  - Accessibility
  - Edge cases (large counts, unknown types)

## Testing Best Practices

### 1. Mocking
- All external dependencies are properly mocked
- API calls are mocked to avoid network requests
- Context providers are mocked for isolated testing

### 2. User Interactions
- Uses `@testing-library/user-event` for realistic user interactions
- Tests user flows, not implementation details

### 3. Accessibility
- Tests include aria-labels, alt text, and semantic HTML
- Ensures components are keyboard accessible

### 4. Edge Cases
- Tests handle empty states, error states, and boundary conditions
- Validates behavior with unusual inputs

### 5. Async Operations
- Uses `waitFor` for async operations
- Properly handles loading states and transitions

## Test Utilities

### Mocked Dependencies

#### Post Component
- `usePolls` hook
- `ReportButton` component
- `PollDisplay` component

#### CreatePost Component
- `AuthContext`
- `useCreatePoll` hook
- `PollCreator` component

#### SearchBar Component
- `react-router-dom` (useNavigate)
- `useDebounce` hook
- `searchApi`
- `searchHistory` utils
- `SearchSuggestions` component

#### NotificationCenter Component
- `NotificationContext`
- `notificationsApi`
- `NotificationItem` component
- `react-hot-toast`

## Coverage Reports

After running tests with coverage, view the HTML report:

```bash
npm run test:coverage
# Open coverage/index.html in your browser
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- Fast execution (no real API calls)
- Deterministic results (mocked dependencies)
- Clear error messages

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Aim for 80%+ code coverage
3. Test user behavior, not implementation
4. Include accessibility tests
5. Add edge case scenarios
6. Document complex test scenarios

## Troubleshooting

### Tests failing due to missing mocks
- Ensure all external dependencies are mocked
- Check that mock paths match actual file structure

### Async test timeouts
- Increase timeout in `vitest.config.js` if needed
- Use `waitFor` with appropriate timeout options

### Component not rendering
- Check that all required props are provided
- Verify context providers are properly mocked

## Related Documentation

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)

## Issue Reference

This test suite was created to address:
- **Issue #348**: Add Unit Tests for Core Components (Post, CreatePost, SearchBar, NotificationCenter)

## Test Statistics

- **Total Test Files**: 4
- **Total Test Cases**: 150+
- **Expected Coverage**: 80%+
- **Test Execution Time**: ~10-15 seconds

---

**Last Updated**: 2026-01-11
**Maintainer**: @SatyamPandey-07
