# State Management Documentation

## Overview

This document describes the global state management system implemented using React Context API and Reducers. The system provides centralized, predictable state management across the College Media application.

## Architecture

\\\
src/
 context/
    AuthContext.jsx       # Authentication state
    PostsContext.jsx      # Posts data state
    UIContext.jsx         # UI state (theme, modals)
    AppProviders.jsx      # Combined providers
 reducers/
    authReducer.js        # Auth state logic
    postsReducer.js       # Posts state logic
    uiReducer.js          # UI state logic
    actionTypes.js        # Action type constants
 hooks/
    useAuthState.js       # Auth state hook
    usePostsState.js      # Posts state hook
    useUIState.js         # UI state hook
    useLocalStorage.js    # Persistence hook
 utils/
     stateHelpers.js       # State utility functions
     actionCreators.js     # Action creator helpers
     stateLogger.js        # Development logging
\\\

## Features

###  Centralized State Management
- Single source of truth for app state
- No prop drilling
- Clean component tree

###  Predictable State Updates
- Reducer pattern for state updates
- Immutable updates with immer
- Type-safe action creators

###  State Persistence
- LocalStorage integration
- Auto-persist auth and theme
- Cross-tab synchronization

###  Development Tools
- State change logging
- Action tracking
- Performance monitoring
- Redux DevTools compatible

###  Optimized Performance
- Context splitting by domain
- Memoized action creators
- Selective re-renders

## Getting Started

### 1. Wrap App with Providers

\\\jsx
// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProviders } from './context/AppProviders';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
\\\

### 2. Use State in Components

\\\jsx
import { useAuthState, usePostsState, useUIState } from '@/hooks';

function MyComponent() {
  const { user, isAuthenticated } = useAuthState();
  const { posts, likePost } = usePostsState();
  const { showSuccess } = useUIState();

  return <div>...</div>;
}
\\\

## Usage Examples

### Authentication State

\\\jsx
import { useAuthState, useAuthActions } from '@/hooks/useAuthState';

function LoginPage() {
  const { isAuthenticated, isLoading, error } = useAuthState();
  const { loginSuccess, loginFailure } = useAuthActions();

  const handleLogin = async (credentials) => {
    try {
      const { user, token } = await loginAPI(credentials);
      loginSuccess(user, token);
    } catch (err) {
      loginFailure(err.message);
    }
  };

  return <div>...</div>;
}
\\\

### Posts State

\\\jsx
import { usePostsState, usePostsActions } from '@/hooks/usePostsState';

function PostsPage() {
  const { posts, isLoading, pagination } = usePostsState();
  const { fetchPostsSuccess, likePost } = usePostsActions();

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPostsAPI();
      fetchPostsSuccess(data.posts, data.pagination);
    };
    fetchData();
  }, []);

  const handleLike = (postId) => {
    likePost(postId);
    // API call
  };

  return <div>...</div>;
}
\\\

### UI State

\\\jsx
import { useTheme, useModals, useNotifications } from '@/hooks/useUIState';

function Header() {
  const { theme } = useTheme();
  const { openModal } = useModals();
  const { showSuccess } = useNotifications();

  return (
    <header data-theme={theme}>
      <button onClick={() => openModal('CREATE_POST')}>
        Create Post
      </button>
    </header>
  );
}
\\\

## State Structure

### Auth State

\\\javascript
{
  user: {
    id: string,
    username: string,
    email: string,
    avatar: string,
    // ...
  },
  token: string | null,
  refreshToken: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null,
  lastLogin: string | null
}
\\\

### Posts State

\\\javascript
{
  posts: [{
    id: string,
    content: string,
    author: User,
    likes: number,
    comments: Comment[],
    isLiked: boolean,
    // ...
  }],
  selectedPost: Post | null,
  isLoading: boolean,
  error: string | null,
  pagination: {
    currentPage: number,
    totalPages: number,
    totalPosts: number,
    postsPerPage: number
  },
  filters: {
    sort: 'recent' | 'popular' | 'trending',
    category: string | null,
    searchQuery: string
  }
}
\\\

### UI State

\\\javascript
{
  theme: 'light' | 'dark' | 'system',
  modals: {
    open: string[],
    data: Record<string, any>
  },
  notifications: Notification[],
  sidebar: {
    isOpen: boolean,
    isPinned: boolean
  },
  drawer: {
    isOpen: boolean,
    content: any
  },
  mobileMenu: {
    isOpen: boolean
  },
  search: {
    query: string,
    isOpen: boolean
  },
  viewMode: 'grid' | 'list',
  isGlobalLoading: boolean
}
\\\

## Actions Reference

### Auth Actions

- \loginStart()\ - Start login process
- \loginSuccess(user, token, refreshToken)\ - Login successful
- \loginFailure(error)\ - Login failed
- \logout()\ - Logout user
- \setUser(user)\ - Set user data
- \updateUser(updates)\ - Update user data
- \setToken(token, refreshToken)\ - Set auth tokens

### Posts Actions

- \etchPostsSuccess(posts, pagination)\ - Set posts data
- \createPostSuccess(post)\ - Add new post
- \updatePostSuccess(post)\ - Update existing post
- \deletePostSuccess(postId)\ - Remove post
- \likePost(postId)\ - Like a post
- \unlikePost(postId)\ - Unlike a post
- \ddComment(postId, comment)\ - Add comment
- \setFilter(filters)\ - Set posts filters

### UI Actions

- \setTheme(theme)\ - Change theme
- \	oggleTheme()\ - Toggle light/dark theme
- \openModal(modalType, data)\ - Open modal
- \closeModal(modalType)\ - Close modal
- \showSuccess(message)\ - Show success notification
- \showError(message)\ - Show error notification
- \	oggleSidebar()\ - Toggle sidebar

## Best Practices

###  DO

1. **Use appropriate hooks**
   \\\jsx
   const { user } = useAuthState();
   \\\

2. **Destructure only what you need**
   \\\jsx
   const { posts, likePost } = usePostsState();
   \\\

3. **Handle loading and error states**
   \\\jsx
   if (isLoading) return <Spinner />;
   if (error) return <ErrorMessage error={error} />;
   \\\

4. **Use action creators**
   \\\jsx
   const { loginSuccess } = useAuthActions();
   loginSuccess(user, token);
   \\\

###  DON'T

1. **Don't bypass the context**
   \\\jsx
   //  Bad
   localStorage.setItem('user', JSON.stringify(user));
   
   //  Good
   const { setUser } = useAuthActions();
   setUser(user);
   \\\

2. **Don't mutate state directly**
   \\\jsx
   //  Bad
   state.posts.push(newPost);
   
   //  Good
   createPostSuccess(newPost);
   \\\

3. **Don't create nested contexts unnecessarily**
   \\\jsx
   //  Bad - Context in component
   //  Good - Use AppProviders
   \\\

## Migration Guide

### Before (Local State)

\\\jsx
function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchPosts = async () => {
    setLoading(true);
    const data = await api.get('/posts');
    setPosts(data);
    setLoading(false);
  };
  
  return <div>...</div>;
}
\\\

### After (Global State)

\\\jsx
function PostsPage() {
  const { posts, isLoading, fetchPostsSuccess } = usePostsState();
  
  const fetchPosts = async () => {
    const data = await api.get('/posts');
    fetchPostsSuccess(data.posts, data.pagination);
  };
  
  return <div>...</div>;
}
\\\

## Debugging

### Enable State Logging

State logging is enabled in development mode by default:

\\\javascript
// src/utils/stateLogger.js
const ENABLE_LOGGING = import.meta.env.MODE === 'development';
\\\

### View State Changes

Open browser console to see:
- Action dispatches
- State before/after
- State diffs
- Performance metrics

### Manual Logging

\\\javascript
import { logStateTree, logAction } from '@/utils/stateLogger';

logStateTree('Current Auth State', authState);
logAction('AUTH', { type: 'LOGIN_SUCCESS', payload: user });
\\\

## Performance Optimization

### Context Splitting

State is split into domains to prevent unnecessary re-renders:
- AuthContext - Only auth consumers re-render
- PostsContext - Only posts consumers re-render
- UIContext - Only UI consumers re-render

### Memoization

Action creators are memoized with \useCallback\:

\\\jsx
const loginSuccess = useCallback((user, token) => {
  dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
}, []);
\\\

### Selective Subscriptions

Use specific hooks to subscribe to minimal state:

\\\jsx
//  Bad - Subscribes to entire auth state
const auth = useAuthState();

//  Good - Only subscribes to user
const user = useCurrentUser();
\\\

## Testing

### Testing Components with State

\\\jsx
import { render } from '@testing-library/react';
import { AppProviders } from '@/context/AppProviders';

test('renders with state', () => {
  render(
    <AppProviders>
      <MyComponent />
    </AppProviders>
  );
});
\\\

### Testing Reducers

\\\jsx
import { authReducer, initialAuthState } from '@/reducers/authReducer';
import { AUTH_ACTIONS } from '@/reducers/actionTypes';

test('handles login success', () => {
  const action = {
    type: AUTH_ACTIONS.LOGIN_SUCCESS,
    payload: { user, token, refreshToken }
  };
  
  const state = authReducer(initialAuthState, action);
  
  expect(state.isAuthenticated).toBe(true);
  expect(state.user).toEqual(user);
});
\\\

## Troubleshooting

### Context Provider Errors

**Error:** "useAuthState must be used within an AuthProvider"

**Solution:** Wrap app with AppProviders in main.jsx

### State Not Persisting

**Check:** LocalStorage helpers in stateHelpers.js

\\\javascript
import { getStoredAuth } from '@/utils/stateHelpers';
console.log(getStoredAuth());
\\\

### State Not Updating

**Check:** Ensure you're using action creators:

\\\jsx
//  Wrong
dispatch({ type: 'LOGIN' });

//  Correct
loginSuccess(user, token);
\\\

## Adding New State Domains

### 1. Create Reducer

\\\javascript
// src/reducers/notificationsReducer.js
export const initialNotificationsState = {
  items: [],
  unreadCount: 0
};

export const notificationsReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return { ...state, items: [...state.items, action.payload] };
    default:
      return state;
  }
};
\\\

### 2. Create Context

\\\jsx
// src/context/NotificationsContext.jsx
export const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    notificationsReducer,
    initialNotificationsState
  );

  const value = { ...state, /* actions */ };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};
\\\

### 3. Create Hook

\\\javascript
// src/hooks/useNotificationsState.js
export const useNotificationsState = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('Must use within NotificationsProvider');
  return context;
};
\\\

### 4. Add to AppProviders

\\\jsx
export const AppProviders = ({ children }) => {
  return (
    <UIProvider>
      <AuthProvider>
        <PostsProvider>
          <NotificationsProvider>
            {children}
          </NotificationsProvider>
        </PostsProvider>
      </AuthProvider>
    </UIProvider>
  );
};
\\\

## API Reference

### Available Hooks

#### Auth
- \useAuthState()\ - Full auth state
- \useIsAuthenticated()\ - Auth status
- \useCurrentUser()\ - Current user
- \useAuthToken()\ - Auth token
- \useAuthActions()\ - Auth actions

#### Posts
- \usePostsState()\ - Full posts state
- \usePosts()\ - Posts array
- \useSelectedPost()\ - Selected post
- \usePostsLoading()\ - Loading state
- \usePostsActions()\ - Posts actions

#### UI
- \useUIState()\ - Full UI state
- \useTheme()\ - Current theme
- \useModals()\ - Modal state
- \useNotifications()\ - Notifications
- \useSidebar()\ - Sidebar state
- \useUIActions()\ - UI actions

#### Storage
- \useLocalStorage(key, initialValue)\ - Persistent state
- \useLocalStorageBoolean(key, initialValue)\ - Boolean state
- \useLocalStorageObject(key, initialValue)\ - Object state
- \useLocalStorageArray(key, initialValue)\ - Array state

## Contributing

When modifying state management:

1. Update action types in actionTypes.js
2. Update reducer with new action handlers
3. Add action creators in context
4. Update hooks if needed
5. Update this documentation
6. Add tests for new functionality

## Support

For questions or issues:
- Check this documentation
- Review example usage in components
- Check console for state logs (dev mode)
- Contact development team

---

**Related Issues:** #229  
**Authors:** @SatyamPandey-07  
**Last Updated:** 2024
