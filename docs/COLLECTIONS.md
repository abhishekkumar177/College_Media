# Collections & Bookmarks System

**Issue #308** - Complete post collections and saved items management system

## Overview

The Collections system allows users to organize and save posts into custom collections, providing a powerful bookmarking and content curation experience. Users can create unlimited collections, categorize posts, search within collections, and manage their saved content with privacy controls.

## Features

### Core Features

1. **Default "Saved" Collection**
   - Auto-created for all users
   - Cannot be deleted
   - Quick-save destination for bookmarked posts

2. **Custom Collections**
   - Create unlimited collections
   - Custom names and descriptions
   - Thumbnail preview (first 3 posts)
   - Post count and last updated tracking

3. **Smart Bookmarking**
   - Enhanced bookmark button with collection selector
   - Quick-save to default collection
   - Dropdown to select specific collections
   - Inline collection creation
   - Visual feedback for saved status

4. **Collection Management**
   - Grid view of all collections
   - Search collections by name
   - Sort by: alphabetical, date, most posts
   - Edit collection metadata
   - Delete collections (except "Saved")
   - Privacy toggle (public/private)

5. **Collection Detail View**
   - Individual collection page
   - Infinite scroll for posts
   - Search within collection
   - Bulk operations (select multiple posts)
   - Move posts between collections
   - Remove posts from collection
   - Share collection (public only)

6. **Offline Support**
   - LocalStorage-based persistence
   - No backend dependency for MVP
   - Instant synchronization
   - Data available offline

### Advanced Features

- **Bulk Operations**: Multi-select posts for batch moving/deleting
- **Privacy Controls**: Public/private collection toggles
- **Search**: Global collection search and within-collection search
- **Statistics**: Post count, creation date, last updated tracking
- **Responsive Design**: Mobile-optimized grid and detail views
- **Loading States**: Skeleton loaders for better UX
- **Empty States**: Helpful prompts for new users

## User Guide

### Creating a Collection

1. Navigate to `/collections` page
2. Click "Create New Collection" button
3. Enter collection name and optional description
4. Click "Create" or press Enter
5. Collection appears in grid view

**Alternative**: Create inline when saving a post:
1. Click bookmark button on any post
2. Select "Create New Collection" from dropdown
3. Enter name and create instantly
4. Post is automatically added to new collection

### Saving Posts to Collections

1. **Quick Save** (to "Saved" collection):
   - Click bookmark icon on any post
   - Post is saved to default "Saved" collection
   - Icon changes to filled state

2. **Save to Specific Collection**:
   - Click bookmark icon
   - Dropdown appears showing all collections
   - Click collection name to save post there
   - Checkmarks indicate collections containing this post

3. **Multiple Collections**:
   - Posts can be saved to multiple collections
   - Each collection tracks posts independently
   - Removing from one collection doesn't affect others

### Managing Collections

#### Edit Collection
1. Navigate to Collections page
2. Click "Edit" on collection card
3. Modify name or description
4. Changes save automatically

#### Delete Collection
1. Click "Delete" on collection card
2. Confirm deletion
3. Collection and associations are removed
4. Posts themselves remain unaffected

#### Toggle Privacy
1. Open collection detail page
2. Click privacy toggle in header
3. Public collections can be shared
4. Private collections are personal only

### Organizing Posts

#### Search Within Collection
1. Open collection detail page
2. Use search bar at top
3. Results filter in real-time
4. Search matches post titles and content

#### Bulk Operations
1. Enable bulk mode (checkbox icon)
2. Select multiple posts
3. Choose action:
   - Move to another collection
   - Delete from collection
4. Confirm bulk action

#### Sort Collections
- On Collections page, use sort dropdown
- Options:
  - Alphabetical (A-Z)
  - Date Created (newest first)
  - Most Posts (highest count first)

## Technical Architecture

### Component Structure

```
frontend/src/
├── components/
│   ├── BookmarkButton.jsx          # Enhanced bookmark with collection selector
│   └── CollectionSelector.jsx      # Dropdown for selecting/creating collections
├── pages/
│   ├── Collections.jsx              # Grid view of all collections
│   └── CollectionDetail.jsx         # Individual collection with posts
├── context/
│   └── CollectionContext.jsx        # Global state management
├── hooks/
│   └── useCollections.js            # Custom hooks for operations
├── utils/
│   └── collectionStorage.js         # localStorage utilities
└── api/
    └── endpoints.js                 # API endpoints (collectionsApi)
```

### State Management

**CollectionContext** provides:
- `collections`: Array of all collections
- `loading`: Loading state
- `createCollection()`: Create new collection
- `updateCollection()`: Update collection metadata
- `deleteCollection()`: Remove collection
- `addPostToCollection()`: Add post to collection
- `removePostFromCollection()`: Remove post from collection
- `bulkMovePostsToCollection()`: Move multiple posts
- `bulkDeletePosts()`: Delete multiple posts
- `toggleCollectionPrivacy()`: Toggle public/private
- `searchInCollection()`: Search within collection
- `sortCollections()`: Sort collections

### Data Models

#### Collection Object
```javascript
{
  id: "uuid-v4",
  name: "Collection Name",
  description: "Optional description",
  posts: ["postId1", "postId2", ...],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  isPrivate: false,
  isDefault: false // true for "Saved" collection
}
```

### API Endpoints

```javascript
// Collections CRUD
GET    /api/collections              // Get all user collections
POST   /api/collections              // Create new collection
PUT    /api/collections/:id          // Update collection
DELETE /api/collections/:id          // Delete collection

// Collection Operations
POST   /api/collections/:id/posts    // Add post to collection
DELETE /api/collections/:id/posts/:postId  // Remove post
GET    /api/collections/:id/posts    // Get posts (paginated)
PUT    /api/collections/:id/privacy  // Toggle privacy
```

### Storage Strategy

**LocalStorage (Current MVP)**
- Key: `collections_${userId}`
- Auto-sync on all operations
- Instant updates without backend
- No network dependency

**Future Backend Integration**
- Replace localStorage calls with API calls
- Keep same interface for easy migration
- Add synchronization for multi-device support
- Implement conflict resolution

## Component Reference

### BookmarkButton

Enhanced bookmark button with collection support.

**Props:**
- `postId` (string, required): ID of the post to bookmark
- `className` (string): Additional CSS classes

**Features:**
- Shows filled icon if post is in any collection
- Opens CollectionSelector dropdown on click
- Displays toast notifications
- Handles saved state detection

**Usage:**
```jsx
import BookmarkButton from '../components/BookmarkButton';

<BookmarkButton postId={post.id} />
```

### CollectionSelector

Dropdown component for selecting/creating collections.

**Props:**
- `postId` (string, required): ID of the post being saved
- `isOpen` (boolean, required): Controls dropdown visibility
- `onClose` (function, required): Callback when dropdown closes

**Features:**
- Lists all collections with checkmarks for saved state
- "Create New Collection" option
- Inline collection creation form
- Click-outside detection
- Keyboard navigation support

**Usage:**
```jsx
import CollectionSelector from '../components/CollectionSelector';

<CollectionSelector
  postId={postId}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

### Collections Page

Grid view of all user collections.

**Route:** `/collections`

**Features:**
- Responsive grid (1-4 columns)
- Collection cards with thumbnails
- Post count and update time
- Search bar for filtering
- Sort dropdown (3 options)
- Create new collection button
- Edit/delete actions
- Empty state for new users

### CollectionDetail Page

Individual collection view with posts.

**Route:** `/collections/:collectionId`

**Features:**
- Collection header with stats
- Privacy toggle
- Search within collection
- Infinite scroll for posts
- Bulk selection mode
- Bulk move/delete operations
- Share button (public collections)
- Empty state prompts

## Custom Hooks

### useCollections

Main hook for collection operations.

```javascript
const {
  collections,
  loading,
  createCollection,
  updateCollection,
  deleteCollection,
  addPostToCollection,
  removePostFromCollection,
  bulkMovePostsToCollection,
  bulkDeletePosts,
  toggleCollectionPrivacy,
  searchInCollection,
  sortCollections
} = useCollections();
```

### useCollectionById

Get specific collection by ID.

```javascript
const { collection, loading } = useCollectionById(collectionId);
```

### useCreateCollection

Hook for creating collections.

```javascript
const { createCollection, loading } = useCreateCollection();
```

### useUpdateCollection

Hook for updating collection metadata.

```javascript
const { updateCollection, loading } = useUpdateCollection();
```

### useDeleteCollection

Hook for deleting collections.

```javascript
const { deleteCollection, loading } = useDeleteCollection();
```

### useAddToCollection

Hook for adding posts to collections.

```javascript
const { addPostToCollection, loading } = useAddToCollection();
```

### useRemoveFromCollection

Hook for removing posts from collections.

```javascript
const { removePostFromCollection, loading } = useRemoveFromCollection();
```

### useBulkOperations

Hook for bulk operations.

```javascript
const { bulkMovePostsToCollection, bulkDeletePosts, loading } = useBulkOperations();
```

### useCollectionStats

Hook for collection statistics.

```javascript
const stats = useCollectionStats(collectionId);
// Returns: { postCount, createdAt, updatedAt, lastPostAdded }
```

## Implementation Guide

### Adding Collections to Your App

1. **Install Dependencies** (already included):
   - React Router v6
   - @iconify/react
   - react-hot-toast
   - date-fns

2. **Wrap App with CollectionProvider**:
```jsx
import { CollectionProvider } from './context/CollectionContext';

<CollectionProvider>
  <App />
</CollectionProvider>
```

3. **Add Routes**:
```jsx
<Route path="/collections" element={<Collections />} />
<Route path="/collections/:collectionId" element={<CollectionDetail />} />
```

4. **Use BookmarkButton in Post Components**:
```jsx
import BookmarkButton from './components/BookmarkButton';

<BookmarkButton postId={post.id} />
```

5. **Add Navigation Link**:
```jsx
<Link to="/collections">My Collections</Link>
```

### Migrating to Backend

When ready to add backend support:

1. **Update CollectionContext**:
   - Replace localStorage calls with API calls from `collectionsApi`
   - Keep same function signatures
   - Add error handling for network issues

2. **Implement Backend Endpoints**:
   - Follow API endpoint structure defined above
   - Use MongoDB for storage
   - Add user authentication middleware
   - Implement pagination for large collections

3. **Add Synchronization**:
   - Sync localStorage with backend on login
   - Handle conflicts (last-write-wins or merge)
   - Add offline queue for pending operations

4. **Database Schema** (MongoDB):
```javascript
const CollectionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  isPrivate: { type: Boolean, default: false },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });
```

## Best Practices

### Performance

1. **Lazy Loading**: Collection pages use React.lazy() for code splitting
2. **Infinite Scroll**: CollectionDetail loads posts in batches (20 at a time)
3. **Debounced Search**: Search inputs use 300ms debounce
4. **Memoization**: Expensive computations are memoized
5. **Optimistic Updates**: UI updates immediately, rolls back on error

### UX Considerations

1. **Clear Feedback**: Toast notifications for all operations
2. **Loading States**: Skeleton loaders prevent layout shift
3. **Empty States**: Helpful prompts guide new users
4. **Confirmation Dialogs**: Destructive actions require confirmation
5. **Keyboard Support**: Full keyboard navigation for accessibility

### Data Management

1. **Default Collection**: "Saved" collection auto-created and protected
2. **Data Validation**: All inputs validated before storage
3. **Error Handling**: Graceful fallbacks for all operations
4. **Data Persistence**: Auto-save on every operation
5. **Backup**: Consider exporting collections to JSON

## Security Notes

### Current Implementation (localStorage)

- Data stored in browser localStorage
- Accessible to all scripts on same origin
- No server-side validation
- No encryption at rest

### Future Backend Implementation

1. **Authentication**: Require valid JWT for all operations
2. **Authorization**: Users can only access their own collections
3. **Input Validation**: Sanitize all user inputs server-side
4. **Rate Limiting**: Prevent spam/abuse with rate limits
5. **Privacy**: Respect private collection settings
6. **Encryption**: Consider encrypting sensitive collections

## Troubleshooting

### Collection Not Appearing

- Check localStorage quota (5-10MB limit)
- Verify userId is set correctly
- Check browser console for errors
- Clear localStorage and refresh if corrupted

### Posts Not Saving

- Ensure postId is valid
- Check if collection exists
- Verify CollectionProvider is wrapping app
- Check network tab for API errors (future)

### Search Not Working

- Verify search input is connected to state
- Check debounce delay (300ms)
- Ensure posts have searchable content
- Clear search term and try again

### Performance Issues

- Reduce posts per page (currently 20)
- Implement virtual scrolling for large collections
- Clear old/unused collections
- Check for memory leaks in useEffect

## Future Enhancements

### Planned Features

1. **Collection Sharing**: Share public collections via link
2. **Collection Following**: Follow other users' public collections
3. **Collection Merge**: Combine multiple collections
4. **Collection Export**: Export to JSON/CSV
5. **Collection Import**: Import from bookmarks/other services
6. **Collection Templates**: Pre-defined collection types
7. **Smart Collections**: Auto-add posts based on rules
8. **Collection Tags**: Tag collections for better organization
9. **Collection Covers**: Custom cover images
10. **Collection Collaboration**: Multi-user collections

### Backend Features

1. **Real-time Sync**: WebSocket-based synchronization
2. **Multi-device Support**: Sync across devices
3. **Cloud Backup**: Automatic cloud backups
4. **Collection Analytics**: View stats, popular posts
5. **Collection Discovery**: Explore public collections
6. **Collection Feed**: Activity feed for followed collections
7. **Collection Notifications**: Alerts for updates
8. **Collection API**: Public API for third-party integrations

## Related Issues

- Issue #250: API Integration (base infrastructure)
- Issue #259: Notifications System (notification hooks)
- Issue #260: Advanced Search (search patterns)
- Issue #309: Content Moderation (admin patterns)

## Resources

- [React Context API](https://react.dev/reference/react/useContext)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [React Router v6](https://reactrouter.com/en/main)
- [Infinite Scroll Pattern](https://web.dev/infinite-scroll/)

---

**Implementation Status**: ✅ Complete  
**Branch**: `feature/collections-system`  
**Points**: 10 (L3)  
**Last Updated**: 2024
