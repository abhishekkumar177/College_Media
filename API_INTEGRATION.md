# API Integration Layer Documentation

## Overview

This API integration layer provides a centralized, production-ready approach to handling all HTTP requests in the College Media application. It includes automatic token injection, error handling, request retry logic, caching, and domain-specific hooks.

## Architecture

```
src/
├── services/
│   ├── api.js                 # Main Axios instance with all interceptors
│   ├── apiConfig.js           # Centralized API configuration
│   └── interceptors/
│       ├── authInterceptor.js # Token injection & management
│       ├── errorInterceptor.js# Global error handling
│       └── loggingInterceptor.js # Development logging
├── hooks/
│   ├── usePosts.js           # Posts domain hooks
│   ├── useAuthHooks.js       # Authentication hooks
│   ├── useUsers.js           # User operations hooks
│   └── useComments.js        # Comments operations hooks
└── utils/
    ├── tokenManager.js        # JWT token storage & validation
    ├── requestCache.js        # In-memory cache with TTL
    └── apiHelpers.js          # Helper utilities
```

## Features

### ✅ Centralized Configuration
- Environment-based base URLs
- Consistent timeout settings
- Standard headers

### ✅ Automatic Token Management
- JWT token injection
- Automatic logout on 401
- Token refresh support

### ✅ Retry Logic
- Exponential backoff
- Network error retry
- 5xx status code retry

### ✅ Request Caching
- In-memory cache for GET requests
- Configurable TTL (5 minutes default)
- Automatic cache invalidation

### ✅ Error Handling
- Global error interceptor
- Integration with ErrorContext
- User-friendly error messages

### ✅ Development Tools
- Request/response logging in dev mode
- Performance timing
- Network monitoring

## Installation

Dependencies are already installed:
```bash
npm install axios axios-retry
```

## Usage Guide

### 1. Posts Operations

```jsx
import { useFetchPosts, useCreatePost, useLikePost } from '@/hooks/usePosts';

function PostsPage() {
  const { data: posts, loading, error, fetchPosts } = useFetchPosts();
  const { createPost, loading: creating } = useCreatePost();
  const { likePost } = useLikePost();

  useEffect(() => {
    fetchPosts({ page: 1, limit: 10 });
  }, [fetchPosts]);

  const handleCreatePost = async (postData) => {
    try {
      await createPost(postData);
      fetchPosts(); // Refresh list
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {posts?.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <button onClick={() => likePost(post.id)}>Like</button>
        </div>
      ))}
    </div>
  );
}
```

### 2. Authentication

```jsx
import { useLogin, useLogout, useFetchCurrentUser } from '@/hooks/useAuthHooks';

function LoginPage() {
  const { login, loading, error } = useLogin();
  const { logout } = useLogout();
  const { fetchCurrentUser, getUserFromLocalToken } = useFetchCurrentUser();

  const handleLogin = async (credentials) => {
    try {
      const { token, user } = await login(credentials);
      console.log('Logged in as:', user.username);
      
      // Fetch full user profile
      await fetchCurrentUser();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    // Will redirect to /login
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin({ email, password });
    }}>
      {/* Login form fields */}
    </form>
  );
}
```

### 3. User Profile

```jsx
import { useFetchUser, useUpdateProfile, useFollowUser } from '@/hooks/useUsers';

function UserProfile({ userId }) {
  const { data: user, loading, fetchUser } = useFetchUser();
  const { updateProfile, loading: updating } = useUpdateProfile();
  const { followUser, unfollowUser } = useFollowUser();

  useEffect(() => {
    fetchUser(userId);
  }, [userId, fetchUser]);

  const handleFollow = async () => {
    try {
      await followUser(userId);
      fetchUser(userId); // Refresh profile
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {user && (
        <>
          <h2>{user.username}</h2>
          <button onClick={handleFollow}>Follow</button>
        </>
      )}
    </div>
  );
}
```

### 4. Comments

```jsx
import { useFetchComments, useCreateComment, useDeleteComment } from '@/hooks/useComments';

function CommentsSection({ postId }) {
  const { data: comments, loading, fetchComments } = useFetchComments();
  const { createComment, loading: creating } = useCreateComment();
  const { deleteComment } = useDeleteComment();

  useEffect(() => {
    fetchComments(postId);
  }, [postId, fetchComments]);

  const handleAddComment = async (content) => {
    try {
      await createComment(postId, { content });
      fetchComments(postId); // Refresh comments
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>
          <p>{comment.content}</p>
          <button onClick={() => deleteComment(comment.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## Configuration

### Environment Variables

Create a `.env` file:

```env
# Production
VITE_API_BASE_URL=https://api.collegemedia.com/api

# Development
VITE_API_BASE_URL=http://localhost:5000/api
```

### Customizing Timeouts

Edit [src/services/apiConfig.js](src/services/apiConfig.js):

```javascript
const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_CONFIG: {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
  }
};
```

### Adding New Endpoints

Add to [src/services/apiConfig.js](src/services/apiConfig.js):

```javascript
ENDPOINTS: {
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id) => `/notifications/${id}`,
    MARK_READ: (id) => `/notifications/${id}/read`
  }
}
```

## Error Handling

The API layer integrates with the existing ErrorContext:

```jsx
import { useError } from '@/hooks/useError';

function MyComponent() {
  const { showError, showSuccess } = useError();

  const handleAction = async () => {
    try {
      await someApiCall();
      showSuccess('Action completed!');
    } catch (err) {
      // Error already shown by interceptor
      // Additional handling if needed
    }
  };
}
```

### Error Types

| Status | Behavior | User Message |
|--------|----------|--------------|
| 401 | Auto-logout, redirect to /login | "Session expired. Please login again." |
| 403 | Show error | "You don't have permission for this action." |
| 500 | Show error | "Server error. Please try again later." |
| Network | Retry 3 times | "Network error. Check your connection." |

## Caching Strategy

GET requests are cached for 5 minutes by default. Cache is automatically invalidated on mutations:

```javascript
// Cache is used
const { data } = await api.get('/posts/123');

// Cache is invalidated
await api.put('/posts/123', updatedData);

// Fresh data fetched
const { data: freshData } = await api.get('/posts/123');
```

### Manual Cache Control

```javascript
import requestCache from '@/utils/requestCache';

// Clear specific endpoint
requestCache.invalidate('/posts/123');

// Clear all cache
requestCache.clear();

// Check if cached
if (requestCache.has('/posts/123')) {
  // ...
}
```

## Migration Guide

### Before (Direct Fetch)

```jsx
// Old approach
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### After (Using Hooks)

```jsx
// New approach
import { useFetchPosts } from '@/hooks/usePosts';

const { data: posts, loading, fetchPosts } = useFetchPosts();

useEffect(() => {
  fetchPosts();
}, [fetchPosts]);
```

## Testing

The API layer works with existing test infrastructure:

```javascript
// Mock API in tests
import api from '@/services/api';

jest.mock('@/services/api');

test('fetches posts successfully', async () => {
  api.get.mockResolvedValue({ data: [{ id: 1, title: 'Test' }] });
  
  const { result } = renderHook(() => useFetchPosts());
  await act(async () => {
    await result.current.fetchPosts();
  });
  
  expect(result.current.data).toHaveLength(1);
});
```

## Best Practices

### ✅ DO

1. **Use hooks for all API calls**
   ```jsx
   const { data, loading, fetchPosts } = useFetchPosts();
   ```

2. **Handle loading and error states**
   ```jsx
   if (loading) return <Spinner />;
   if (error) return <ErrorMessage error={error} />;
   ```

3. **Invalidate cache after mutations**
   ```jsx
   await updatePost(postId, data);
   requestCache.invalidate(`/posts/${postId}`);
   ```

4. **Use try-catch for error handling**
   ```jsx
   try {
     await createPost(data);
   } catch (err) {
     // Handle specific error
   }
   ```

### ❌ DON'T

1. **Don't bypass the API layer**
   ```jsx
   // ❌ Bad
   fetch('/api/posts')
   
   // ✅ Good
   useFetchPosts()
   ```

2. **Don't store tokens manually**
   ```jsx
   // ❌ Bad
   localStorage.setItem('token', token);
   
   // ✅ Good
   setToken(token); // from tokenManager
   ```

3. **Don't create custom axios instances**
   ```jsx
   // ❌ Bad
   const customApi = axios.create({...});
   
   // ✅ Good
   import api from '@/services/api';
   ```

## Performance Tips

1. **Batch requests when possible**
   ```jsx
   const [posts, users] = await Promise.all([
     fetchPosts(),
     fetchUsers()
   ]);
   ```

2. **Use cache for frequently accessed data**
   ```jsx
   // Cached for 5 minutes
   fetchPosts(); // Fetches from API
   fetchPosts(); // Uses cache
   ```

3. **Implement pagination**
   ```jsx
   fetchPosts({ page: 1, limit: 10 });
   ```

## Troubleshooting

### Token Not Being Sent

Check token is stored:
```javascript
import { getToken } from '@/utils/tokenManager';
console.log('Token:', getToken());
```

### Requests Failing

Check base URL:
```javascript
import API_CONFIG from '@/services/apiConfig';
console.log('Base URL:', API_CONFIG.BASE_URL);
```

### Cache Issues

Clear cache:
```javascript
import requestCache from '@/utils/requestCache';
requestCache.clear();
```

## API Reference

### Available Hooks

#### Posts
- `useFetchPosts()` - Fetch all posts
- `useFetchPost()` - Fetch single post
- `useCreatePost()` - Create new post
- `useUpdatePost()` - Update existing post
- `useDeletePost()` - Delete post
- `useLikePost()` - Like/unlike post

#### Authentication
- `useLogin()` - User login
- `useRegister()` - User registration
- `useLogout()` - User logout
- `useFetchCurrentUser()` - Get current user
- `useRefreshToken()` - Refresh auth token

#### Users
- `useFetchUser()` - Fetch user by ID
- `useFetchUserProfile()` - Fetch user profile
- `useUpdateProfile()` - Update user profile
- `useFollowUser()` - Follow/unfollow user
- `useSearchUsers()` - Search users

#### Comments
- `useFetchComments()` - Fetch comments for post
- `useCreateComment()` - Create comment
- `useUpdateComment()` - Update comment
- `useDeleteComment()` - Delete comment
- `useLikeComment()` - Like/unlike comment

## Contributing

When adding new API endpoints:

1. Add endpoint to [apiConfig.js](src/services/apiConfig.js)
2. Create corresponding hook in `src/hooks/`
3. Add tests for the hook
4. Update this documentation

## Support

For issues or questions:
- Check existing issues on GitHub
- Review the troubleshooting section
- Contact the development team

---

**Related Issues:** #228
**Authors:** @SatyamPandey-07
**Last Updated:** 2024
