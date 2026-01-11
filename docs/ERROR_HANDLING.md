# Error Handling System

The College Media application implements a comprehensive Error Boundary system to catch runtime errors, prevent crashes, and provide a user-friendly recovery experience.

## Overview

The system consists of:
- **Global Error Boundary**: Catches unhandled JavaScript errors in the React component tree.
- **Custom Error Pages**: Dedicated UI for 404 (Not Found), 500 (Server Error), and Network errors.
- **Error Fallback UI**: A generic error screen with details and recovery options ("Try Again", "Go Home").
- **Error Logging**: Centralized utility to log errors to the console (and capable of extending to external services).
- **Hooks**: `useErrorHandler` for functional components to manually trigger the error boundary.

## Components

### 1. `ErrorBoundary.jsx`
Located at `src/components/ErrorBoundary.jsx`.
Wraps the application (indide `src/app/AppProviders.jsx`) to catch downstream errors. It differentiates between general errors and network-related errors to show appropriate messaging.

### 2. `ErrorFallback.jsx`
Located at `src/components/ErrorFallback.jsx`.
The default UI component rendered when an error occurs. It displays:
- A friendly error message.
- "Try Again" button (resets the boundary and reloads).
- "Go Home" button (navigates to `/` and reloads).
- Technical details (only in Development mode).

## Custom Pages

- **NotFound (404)**: `src/pages/NotFound.jsx` - Shown when navigating to a non-existent route.
- **ServerError (500)**: `src/pages/ServerError.jsx` - Can be used for API response errors.
- **NetworkError**: `src/pages/NetworkError.jsx` - Shown when offline or connection fails.

## Utilities & Hooks

### `logError` (`src/utils/errorLogger.js`)
Used to log errors with metadata.
```javascript
import { logError } from '../utils/errorLogger';
logError(error, { componentStack: '...' });
```

### `useErrorHandler` (`src/hooks/useErrorHandler.js`)
Allows catching async errors or logic errors in functional components and throwing them to the Error Boundary.
```javascript
import useErrorHandler from '../hooks/useErrorHandler';

const MyComponent = () => {
  const handleError = useErrorHandler();

  const fetchData = async () => {
    try {
      await apiCall();
    } catch (err) {
      handleError(err); // Triggers Error Boundary
    }
  };
};
```

## Route Handling
`src/routes/AppRoutes.jsx` includes a catch-all `*` route that renders the `NotFound` page for undefined URLs.

## Development vs Production
- **Development**: Shows full error name, message, and component stack trace in the UI.
- **Production**: Shows a generic "Something went wrong" message to avoid leaking sensitive info.
