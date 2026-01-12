# Comprehensive Loading State System

## Overview
This system provides a unified approach to loading states across the application, improving perceived performance and user experience using skeleton screens and smooth progress indicators.

## 📦 Components

### Skeleton Screens (`src/components/skeletons/`)
Use these as placeholders while fetching data.

- **`<SkeletonPost />`**: Mimics a social media post card.
- **`<SkeletonProfile />`**: Mimics a user profile page.
- **`<SkeletonComment />`**: Mimics comment items.
- **`<SkeletonNotification />`**: Mimics notification list items.
- **`<SkeletonCard />`**: Generic card placeholder.

**Usage:**
```jsx
// Import css in your app root if not already done
import '../styles/skeleton.css';
import SkeletonPost from '../components/skeletons/SkeletonPost';

function Feed() {
  if (isLoading) {
    return <SkeletonPost count={3} />;
  }
  return <PostList posts={posts} />;
}
```

### Progress Indicators (`src/components/loaders/`)
Use these for active processes or button states.

- **`<LinearProgress />`**: Top bar loading or process steps.
- **`<CircularProgress />`**: Button loading states or small indicators.
- **`<UploadProgress />`**: File upload tracking with percentage.

**Usage:**
```jsx
import CircularProgress from '../components/loaders/CircularProgress';

<button disabled={isLoading}>
  {isLoading ? <CircularProgress size="sm" /> : 'Submit'}
</button>
```

## 🛠️ State Management

### `LoadingContext`
Provides global loading state management. Wrap your app in `LoadingProvider`.

```jsx
// In App.jsx
import { LoadingProvider } from './context/LoadingContext';

function App() {
  return (
    <LoadingProvider>
      <Router />
    </LoadingProvider>
  );
}
```

### `useLoadingState` Hook
Simplifies loading state logic in components.

```jsx
import useLoadingState from '../hooks/useLoadingState';

function MyComponent() {
  const { isLoading, withLoading } = useLoadingState();

  const handleAction = async () => {
    // Automatically sets loading to true, waits, then false
    await withLoading(async () => {
      await api.fetchData();
    });
  };

  if (isLoading) return <SkeletonCard />;
  
  return <button onClick={handleAction}>Load</button>;
}
```

## 🎨 Styling & Animations
All styles are defined in `src/styles/skeleton.css`.
- **Shimmer Animation**: Standard loading effect.
- **Pulse Animation**: Alternative subtle effect.
- **Dark Mode**: Automatically adjusts colors for dark mode.
- **Reduced Motion**: Disables animations for accessibility.

## ♿ Accessibility
All components include proper ARIA attributes:
- `aria-busy="true"`
- `role="status"` or `role="progressbar"`
- Visually hidden labels for screen readers.

## 🚀 Best Practices
1. **Initial Load**: Use Skeletons mapping the expected layout.
2. **Form Submission**: Use CircularProgress inside the button.
3. **Page Transition**: Use Global Loading Bar (via context).
4. **File Upload**: Use UploadProgress with percentage.
