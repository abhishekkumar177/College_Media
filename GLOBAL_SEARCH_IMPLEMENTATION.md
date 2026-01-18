# Global Full-Text Search Implementation

## Overview

Comprehensive global full-text search across Posts, Users, and Events with advanced filtering, autocomplete suggestions, and unified result display. Issue #883.

## Features

### 1. Advanced Filter System
- **Type Filters**: `type:post`, `type:user`, `type:event`
- **Date Filters**: `date:last_day`, `date:last_week`, `date:last_month`, `date:last_year`
- **Sort Options**: `sort:relevance`, `sort:recent`, `sort:popular`, `sort:trending`
- **User Filters**: `role:admin`, `role:moderator`, `role:user`
- **Verification**: `verified:true` or `verified:false`
- **Pagination**: `limit:20`, `skip:0`

### 2. Global Search Endpoints

#### GET `/api/search`
Global search across all content types
```
Query Parameters:
- q (required): Search query
- filters (optional): Filter string (e.g., "type:post date:last_week")
- type (optional): Limit to specific type (post|user|event)

Response:
{
  success: true,
  data: {
    posts: [],
    users: [],
    events: [],
    totalResults: number
  },
  query: string,
  filters: string
}
```

#### GET `/api/search/advanced`
Advanced search with pagination
```
Query Parameters:
- q (required): Search query
- filters (optional): Filter string
- page (optional): Page number (default: 1)
- limit (optional): Results per page, max 100 (default: 20)

Response:
{
  success: true,
  data: {
    results: [
      {
        _id: string,
        type: 'post'|'user'|'event',
        title: string,
        description: string,
        score: number,
        ...
      }
    ],
    page: number,
    totalPages: number,
    totalResults: number,
    limit: number
  }
}
```

#### GET `/api/search/posts`
Search posts only
```
Query Parameters:
- q (required): Search query
- filters (optional): Filter string (date, sort, etc.)
```

#### GET `/api/search/users`
Search users only
```
Query Parameters:
- q (required): Search query
- filters (optional): Filter string (verified, role, sort, etc.)
```

#### GET `/api/search/events`
Search events only
```
Query Parameters:
- q (required): Search query
- filters (optional): Filter string (date, sort, etc.)
```

#### GET `/api/search/suggestions`
Autocomplete suggestions
```
Query Parameters:
- q (required, min 2 chars): Partial query
- limit (optional): Max suggestions (default: 10)

Response:
{
  success: true,
  data: {
    suggestions: [
      {
        _id: string,
        type: 'post'|'user'|'event',
        title: string,
        score: number
      }
    ]
  }
}
```

## Backend Implementation

### SearchService (`backend/services/searchService.js`)

```javascript
class SearchService {
  // Parse filter strings like "type:post date:last_week role:moderator"
  static parseFilters(filterString): Object

  // Search posts with full-text index
  static async searchPosts(query, filters): Promise<Array>

  // Search users with full-text index
  static async searchUsers(query, filters): Promise<Array>

  // Search events with full-text index
  static async searchEvents(query, filters): Promise<Array>

  // Global search aggregating all types
  static async globalSearch(query, filters, options): Promise<Object>

  // Get autocomplete suggestions
  static async getSuggestions(query, limit): Promise<Object>

  // Advanced paginated search
  static async advancedSearch(query, filters, page, limit): Promise<Object>
}
```

### SearchController (`backend/controllers/searchController.js`)

6 main endpoints:
- `globalSearch()` - Multi-type search
- `advancedSearch()` - Paginated unified search
- `searchPosts()` - Post-only search
- `searchUsers()` - User-only search
- `searchEvents()` - Event-only search
- `getSuggestions()` - Autocomplete

### Search Routes (`backend/routes/search.js`)

- `GET /api/search` → globalSearch
- `GET /api/search/advanced` → advancedSearch
- `GET /api/search/posts` → searchPosts
- `GET /api/search/users` → searchUsers
- `GET /api/search/events` → searchEvents
- `GET /api/search/suggestions` → getSuggestions

## Frontend Implementation

### GlobalSearch Page (`frontend/src/pages/GlobalSearch.tsx`)

Main search interface with:
- Search bar with autocomplete
- Advanced filters sidebar
- Grouped results by type
- Pagination support
- Empty/loading states

**Features:**
- Real-time search as user types
- Filter suggestions
- Result grouping by type (Posts, Users, Events)
- Load more functionality
- URL state persistence (query & filters)

### SearchFilters Component (`frontend/src/components/search/SearchFilters.tsx`)

Filter sidebar with:
- Type filter (post, user, event)
- Date range filter (last day/week/month/year)
- Sort options (relevance, recent, popular, trending)
- User role filter (admin, moderator, user)
- Verification filter for users
- Clear all button
- Quick filter syntax tips

### ResultItem Component (`frontend/src/components/search/ResultItem.tsx`)

Polymorphic result card that renders:
- **Posts**: Title, snippet, author, date, relevance score
- **Users**: Avatar, name, username, bio, verified badge
- **Events**: Title, description, location, creator, date

Features:
- Type-specific icons and colors
- Hover effects with navigation
- Relative date formatting
- Text truncation
- Click-to-navigate

### useGlobalSearch Hook (`frontend/src/hooks/useGlobalSearch.ts`)

Custom React hook for search:
```typescript
const {
  results: SearchResult[],
  loading: boolean,
  error: string | null,
  hasMore: boolean,
  totalResults: number
} = useGlobalSearch(query, filters, page, limit)
```

Features:
- Automatic API calls on parameter change
- Error handling
- Pagination support
- Loading state management
- Token-based authentication

### Routing

- `GET /search/global` - Global search page (protected)
- `GET /search?q=query` - Legacy search results
- Lazy-loaded with Suspense fallback

## Database Requirements

### Text Indexes

Add MongoDB text indexes to:

**Post Model:**
```javascript
postSchema.index({ title: 'text', caption: 'text', content: 'text' })
```

**User Model:**
```javascript
userSchema.index({ username: 'text', firstName: 'text', lastName: 'text', bio: 'text' })
```

**Event Model:**
```javascript
eventSchema.index({ title: 'text', description: 'text', location: 'text' })
```

## Filter Syntax Examples

### Basic Filters
```
"type:post"                          # Only posts
"type:user"                          # Only users
"type:event"                         # Only events
```

### Date Filters
```
"date:last_day"                      # Last 24 hours
"date:last_week"                     # Last 7 days
"date:last_month"                    # Last 30 days
"date:last_year"                     # Last 365 days
```

### Sorting
```
"sort:relevance"                     # Relevance score (default)
"sort:recent"                        # Newest first
"sort:popular"                       # Most popular (likes/views)
"sort:trending"                      # Trending content
```

### User-Specific
```
"verified:true"                      # Only verified users
"role:admin"                         # Admin users
"role:moderator"                     # Moderators
"role:user"                          # Regular users
```

### Combined Filters
```
"type:user verified:true role:moderator"
"type:post date:last_week sort:popular"
"date:last_month sort:trending"
```

## Performance Optimizations

1. **MongoDB Text Indexes**: Full-text search on indexed fields
2. **Selective Field Population**: Only fetch required fields
3. **Pagination**: Limit results per page (max 100)
4. **Aggregation Pipeline**: Efficient multi-collection queries
5. **Date Range Calculations**: Pre-computed date boundaries
6. **Query Caching**: Frontend hook caches results
7. **Rate Limiting**: API limiter prevents abuse

## Security Features

1. **Query Validation**: Minimum 2 characters for search
2. **Rate Limiting**: Applied to all search endpoints
3. **Optional Authentication**: Works for both auth'd and unauth'd users
4. **Field Filtering**: Only return public/appropriate fields
5. **Visibility Checks**: Respect post/user privacy settings

## Usage Examples

### Frontend Search
```typescript
// In GlobalSearch page
const { results, loading, error } = useGlobalSearch('javascript', 'type:post date:last_week', 1, 20);

// Results automatically update when dependencies change
```

### API Calls
```bash
# Global search
curl 'http://localhost:5000/api/search?q=react&filters=type%3Apost'

# Advanced search with pagination
curl 'http://localhost:5000/api/search/advanced?q=react&page=2&limit=20'

# Search with filters
curl 'http://localhost:5000/api/search/users?q=john&filters=verified%3Atrue+role%3Amoderator'

# Get suggestions
curl 'http://localhost:5000/api/search/suggestions?q=jav&limit=10'
```

## Testing

### API Testing
1. Test basic queries across all types
2. Verify filter parsing and application
3. Test pagination boundaries
4. Verify error handling (empty queries, invalid filters)
5. Test rate limiting

### Frontend Testing
1. Test filter UI interactions
2. Verify result rendering for each type
3. Test navigation on result click
4. Verify loading/error states
5. Test URL parameter persistence

## Future Enhancements

1. **Advanced Filters UI**: More sophisticated filter builder
2. **Saved Searches**: Save frequent search queries
3. **Search History**: Store and suggest previous searches
4. **Semantic Search**: Vector-based similarity matching
5. **Search Analytics**: Track popular searches and patterns
6. **Faceted Search**: Drill-down filtering by attributes
7. **Spell Correction**: Suggest corrections for typos
8. **Synonym Support**: Match related terms

## Files Modified/Created

### Backend
- ✅ `backend/services/searchService.js` (NEW) - Core search logic
- ✅ `backend/controllers/searchController.js` (UPDATED) - API handlers
- ✅ `backend/routes/search.js` (UPDATED) - Route definitions

### Frontend
- ✅ `frontend/src/pages/GlobalSearch.tsx` (NEW) - Main search page
- ✅ `frontend/src/pages/GlobalSearch.css` (NEW) - Page styling
- ✅ `frontend/src/components/search/SearchFilters.tsx` (NEW) - Filter component
- ✅ `frontend/src/components/search/SearchFilters.css` (NEW) - Filter styling
- ✅ `frontend/src/components/search/ResultItem.tsx` (NEW) - Result card component
- ✅ `frontend/src/components/search/ResultItem.css` (NEW) - Result styling
- ✅ `frontend/src/hooks/useGlobalSearch.ts` (NEW) - Search hook
- ✅ `frontend/src/routes/AppRoutes.tsx` (UPDATED) - Added /search/global route

## Deployment Notes

1. Add text indexes to MongoDB before deploying:
   ```javascript
   db.posts.createIndex({ title: 'text', caption: 'text', content: 'text' })
   db.users.createIndex({ username: 'text', firstName: 'text', lastName: 'text', bio: 'text' })
   db.events.createIndex({ title: 'text', description: 'text', location: 'text' })
   ```

2. Set `REACT_APP_API_URL` environment variable if needed

3. Test search functionality in staging environment

4. Monitor search performance and adjust indexes if needed

## Conclusion

Global Full-Text Search provides users with powerful search capabilities across all content types with flexible filtering and sorting options. The implementation follows the same architecture patterns as MFA (service-based, controller separation, clean routing) and is ready for production deployment.
