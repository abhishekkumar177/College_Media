# 🧪 Testing Strategy & Guide

## Overview
We follow a balanced testing pyramid using **Vitest** (Unit/Integration) and **Cypress** (End-to-End).

## Toolchain
- **Framework**: Vitest (faster Jest alternative).
- **Component Testing**: React Testing Library.
- **E2E**: Cypress.
- **Mocking**: MSW (Mock Service Worker) for network requests.

## Directory Structure
```text
src/ components/ Navbar.jsx tests/ Navbar.test.jsx <-- Co-located unit tests tests/ integration/ <-- Feature workflows e2e/ <-- Cypress specs
```

## Running Tests
```bash
# Unit & Integration (Watch mode)
npm test

# Run with UI Dashboard
npm run test:ui

# Generate Coverage Report
npm run test:coverage

# End-to-End Tests
npm run cypress:open
```

## Writing Tests
### Basic Component Test
```javascript
import { render, screen } from '@testing-library/react';
import Navbar from '../Navbar';

describe('Navbar', () => {
  it('renders logo correctly', () => {
    render(<Navbar />);
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });
});
```
### Best Practices
1. **Test Behavior, Not Implementation:** Use `getByRole` or `getByText` instead of testing internal state.
2. **Mock External Calls:** Never make real API calls in unit tests; use MSW or `vi.mock`.
3. **Accessibility:** Ensure components pass basic a11y checks (e.g., proper aria-labels).