# API Error Handling and Retry Logic Enhancement

## Issue #349: Enhanced API Error Handling and Retry Logic

### Overview
This enhancement provides a comprehensive API error handling system with user-friendly feedback, automatic retry logic, and offline detection for the College_Media frontend application.

---

## 🎯 Features Implemented

### 1. **Centralized Error Handler** (`src/utils/apiErrorHandler.js`)
- ✅ User-friendly error messages for all HTTP status codes
- ✅ Error categorization (network, authentication, validation, etc.)
- ✅ Retryable error detection
- ✅ Toast notifications with contextual styling
- ✅ Offline/online status detection

### 2. **Enhanced Axios Client** (`src/api/client.js`)
- ✅ Visual retry notifications during automatic retries
- ✅ Success notifications when connection is restored
- ✅ Exponential backoff retry strategy (3 attempts)
- ✅ Retry on network errors and specific status codes (408, 429, 500, 502, 503, 504)

### 3. **Custom React Hooks** (`src/hooks/useApiCall.js`)
- ✅ `useApiCall` - Simple API calls with error handling
- ✅ `useApiCallWithRetry` - Manual retry capability
- ✅ Built-in loading states and error management
- ✅ Success/error callbacks

### 4. **Network Status Indicator** (`src/components/NetworkStatusIndicator.jsx`)
- ✅ Real-time offline/online detection
- ✅ Persistent banner when offline
- ✅ Toast notifications for status changes
- ✅ `useNetworkStatus` hook for components

### 5. **Enhanced Error Boundary** (`src/components/ErrorBoundary.jsx`)
- ✅ API error detection
- ✅ Retryable error identification
- ✅ Special guidance for connection issues
- ✅ Visual indicators for different error types

---

## 📚 Usage Guide

### Using the Error Handler Utility

```javascript
import { handleApiError, getUserFriendlyMessage } from '../utils/apiErrorHandler';

// Handle error with toast notification
try {
  const response = await postsApi.create(postData);
} catch (error) {
  handleApiError(error); // Shows user-friendly toast
}

// Get error message without toast
const message = getUserFriendlyMessage(error);
console.log(message);
```

### Using the useApiCall Hook

```javascript
import { useApiCall } from '../hooks/useApiCall';
import { postsApi } from '../api/endpoints';

function CreatePostComponent() {
  const { execute, loading, error, data } = useApiCall(postsApi.create, {
    onSuccess: (response) => {
      console.log('Post created!', response);
    },
    onError: (err) => {
      console.error('Failed to create post', err);
    },
  });

  const handleSubmit = async (postData) => {
    try {
      await execute(postData);
    } catch (err) {
      // Error already handled by hook
    }
  };

  return (
    <div>
      {loading && <p>Creating post...</p>}
      {error && <p>Error: {error.message}</p>}
      <button onClick={() => handleSubmit(data)} disabled={loading}>
        Create Post
      </button>
    </div>
  );
}
```

### Using useApiCallWithRetry Hook

```javascript
import { useApiCallWithRetry } from '../hooks/useApiCall';

function DataFetchComponent() {
  const {
    executeWithRetry,
    loading,
    error,
    data,
    retry,
    retryCount,
    canRetry,
  } = useApiCallWithRetry(postsApi.getAll, {
    maxRetries: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    executeWithRetry({ page: 1, limit: 10 });
  }, []);

  return (
    <div>
      {loading && <p>Loading... (Retry: {retryCount})</p>}
      {error && canRetry && (
        <button onClick={retry}>Retry</button>
      )}
      {data && <PostList posts={data} />}
    </div>
  );
}
```

### Using Network Status Indicator

```javascript
// In your main App.jsx or layout component
import NetworkStatusIndicator from './components/NetworkStatusIndicator';

function App() {
  return (
    <div>
      <NetworkStatusIndicator />
      {/* Rest of your app */}
    </div>
  );
}

// Or use the hook in any component
import { useNetworkStatus } from './components/NetworkStatusIndicator';

function MyComponent() {
  const { isOnline, isOffline } = useNetworkStatus();

  return (
    <div>
      {isOffline && <p>You are currently offline</p>}
      <button disabled={isOffline}>Submit</button>
    </div>
  );
}
```

---

## 🎨 Error Message Examples

### Network Errors
- **Message**: "🔌 No internet connection. Please check your network."
- **Toast Style**: Red background with network icon

### Authentication Errors (401)
- **Message**: "🔐 Please login to continue."
- **Toast Style**: Standard error with lock icon
- **Action**: Automatically clears token and triggers logout event

### Validation Errors (400)
- **Message**: "⚠️ Please check your input and try again."
- **Toast Style**: Yellow/warning background
- **Additional**: Field-specific error messages available

### Rate Limit Errors (429)
- **Message**: "🚦 Too many requests. Try again in 30s."
- **Toast Style**: Extended duration (6 seconds)

### Server Errors (500+)
- **Message**: "🔧 Server error. Our team has been notified."
- **Toast Style**: Standard error with tool icon

---

## 🔄 Retry Logic

### Automatic Retries
The axios client automatically retries failed requests with:
- **Max Retries**: 3 attempts
- **Retry Delay**: Exponential backoff (1s, 2s, 4s)
- **Retryable Conditions**:
  - Network errors
  - Timeout errors (408)
  - Rate limit errors (429)
  - Server errors (500, 502, 503, 504)

### Visual Feedback
- **During Retry**: Blue toast showing "Retrying... (1/3)"
- **After Success**: Green toast showing "Connection restored!"

### Manual Retry
Use `useApiCallWithRetry` hook for manual retry control:
```javascript
const { retry, canRetry } = useApiCallWithRetry(apiFunction);

{canRetry && <button onClick={retry}>Try Again</button>}
```

---

## 🌐 Offline Detection

### Features
- Real-time monitoring of `navigator.onLine`
- Persistent banner at top of page when offline
- Toast notifications on status change
- Prevents showing "back online" on initial load

### Implementation
```javascript
// Automatically shows/hides based on connection status
<NetworkStatusIndicator />

// Or use the hook for custom behavior
const { isOnline } = useNetworkStatus();
```

---

## 🧪 Testing

### Test Error Scenarios

1. **Network Error**:
   ```javascript
   // Disconnect internet and make API call
   await postsApi.getAll(); // Shows network error
   ```

2. **Server Error**:
   ```javascript
   // Mock 500 error response
   // Automatically retries 3 times with visual feedback
   ```

3. **Validation Error**:
   ```javascript
   // Send invalid data
   await postsApi.create({ title: '' }); // Shows validation error
   ```

4. **Offline Mode**:
   ```javascript
   // Toggle offline in DevTools Network tab
   // Banner appears immediately
   ```

---

## 📊 Error Categories

| Category | HTTP Codes | Retryable | Icon |
|----------|-----------|-----------|------|
| Network | N/A | ✅ Yes | 🔌 |
| Authentication | 401 | ❌ No | 🔐 |
| Validation | 400, 422 | ❌ No | ⚠️ |
| Rate Limit | 429 | ✅ Yes | 🚦 |
| Server | 500, 502, 503, 504 | ✅ Yes | 🔧 |
| Timeout | 408 | ✅ Yes | ⏱️ |

---

## 🎯 Benefits

✅ **Better User Experience**
- Clear, actionable error messages
- Visual feedback during retries
- Offline awareness

✅ **Improved Resilience**
- Automatic retry for transient failures
- Exponential backoff prevents server overload
- Graceful degradation when offline

✅ **Developer Friendly**
- Simple hooks for common patterns
- Centralized error handling
- Consistent error formatting

✅ **Accessibility**
- ARIA labels on error messages
- Screen reader announcements
- Keyboard-friendly retry buttons

---

## 🔧 Configuration

### Customize Retry Behavior

```javascript
// In src/api/client.js
axiosRetry(apiClient, {
  retries: 5, // Change max retries
  retryDelay: axiosRetry.exponentialDelay, // Or custom delay
  retryCondition: (error) => {
    // Custom retry logic
    return error.response?.status === 503;
  },
});
```

### Customize Error Messages

```javascript
// In src/utils/apiErrorHandler.js
const ERROR_MESSAGES = {
  400: 'Your custom message here',
  // Add more custom messages
};
```

---

## 📝 Files Created/Modified

### Created Files
1. `src/utils/apiErrorHandler.js` - Centralized error handling utility
2. `src/hooks/useApiCall.js` - Custom hooks for API calls
3. `src/components/NetworkStatusIndicator.jsx` - Offline detection component
4. `frontend/API_ERROR_HANDLING.md` - This documentation

### Modified Files
1. `src/api/client.js` - Enhanced with retry notifications
2. `src/components/ErrorBoundary.jsx` - Added API error detection

---

## 🚀 Future Enhancements

- [ ] Integration with error logging service (Sentry, LogRocket)
- [ ] Offline request queue for POST/PUT/DELETE
- [ ] Custom retry strategies per endpoint
- [ ] Error analytics dashboard
- [ ] A/B testing for error messages

---

## 👨‍💻 Contributor
**@SatyamPandey-07**  
**Issue**: #349  
**ECWoC 2026**

---

## 📄 License
MIT License - Same as parent project
