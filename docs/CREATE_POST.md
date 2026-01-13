# Create Post Feature Documentation

## Overview
The Create Post feature allows users to share content with their college community through the Feed page. Users can create posts with text captions, images, and polls, with built-in content moderation.

## User Interface

### Access Points
1. **Feed Page Input**: Click the "What's on your mind?" input box on the Feed page
2. **Action Buttons**: Click any of the three buttons:
   - 📸 **Photo** - Opens create post modal
   - 🎥 **Video** - Opens create post modal  
   - 📊 **Poll** - Opens create post modal
3. **Navbar Button**: Click the orange "Add New Post" button in the top navigation

### Create Post Modal
When opened, displays a modal with the following features:
- User profile picture and username
- Text area for caption (500 character limit)
- Character counter with visual indicators
- Image upload button with preview
- Poll creation button
- Post/Cancel actions

## Features

### 1. Text Posts
- **Caption Input**: Multi-line text area with 500 character limit
- **Character Counter**: 
  - Gray: Under 80% capacity
  - Yellow: 80-100% capacity
  - Red: At maximum capacity
- **Validation**: At least one of caption, image, or poll required

### 2. Image Posts
- **Upload**: Click image icon to select file
- **Preview**: Shows image preview before posting
- **Remove**: X button to remove uploaded image
- **Formats**: Accepts standard image formats (jpg, png, gif, etc.)

### 3. Poll Posts
- **Poll Creator**: Interactive component to create polls
- **Question**: Main poll question
- **Options**: Multiple choice options
- **Duration**: Optional expiry time
- **Preview**: Shows poll preview before posting

### 4. Content Moderation
- **Automatic Check**: All posts analyzed before submission
- **Warning Modal**: Displays if inappropriate content detected
- **Options**:
  - Edit content
  - Bypass warning (if allowed)
- **Coverage**: Checks both caption and poll questions

## Technical Implementation

### Frontend Components

#### Files Structure
```
frontend/src/
├── pages/
│   └── Feed.jsx                    # Main feed page with modal
├── components/
│   ├── CreatePost.jsx              # Post creation form
│   ├── PollCreator.jsx             # Poll creation component
│   └── ModerationWarning.jsx       # Content moderation modal
├── context/
│   └── PollContext.jsx             # Poll state management
└── hooks/
    ├── usePolls.js                 # Poll operations hook
    └── useContentModeration.js     # Content moderation hook
```

#### Feed.jsx
```javascript
// State Management
const [posts, setPosts] = useState([...]); // Posts array with localStorage
const [showCreateModal, setShowCreateModal] = useState(false); // Modal visibility

// Load posts from localStorage on mount
useEffect(() => {
  const savedPosts = localStorage.getItem('feedPosts');
  // Load and parse saved posts
}, []);

// Save posts to localStorage on change
useEffect(() => {
  localStorage.setItem('feedPosts', JSON.stringify(posts));
}, [posts]);

// Handle new post creation
const handlePostCreated = (newPost) => {
  const formattedPost = {
    id: newPost.id,
    user: { name, username, avatar, verified },
    content: newPost.caption,
    image: newPost.imageUrl,
    timestamp: "Just now",
    likes: 0,
    comments: 0,
    shares: 0,
    tags: []
  };
  
  setPosts((prevPosts) => [formattedPost, ...prevPosts]);
  setShowCreateModal(false);
};
```

#### CreatePost.jsx
```javascript
// State
const [caption, setCaption] = useState('');
const [image, setImage] = useState(null);
const [imagePreview, setImagePreview] = useState(null);
const [pollData, setPollData] = useState(null);
const [isCreating, setIsCreating] = useState(false);

// Form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate input
  if (!caption.trim() && !image && !pollData) return;
  
  // Content moderation
  const { isClean } = analyze(caption);
  if (!isClean) {
    setShowModerationModal(true);
    return;
  }
  
  // Create post
  await executePostCreation();
};

// Post creation
const executePostCreation = async () => {
  setIsCreating(true);
  
  // Create poll if exists
  let createdPoll = null;
  if (pollData) {
    createdPoll = await createPoll(pollData);
  }
  
  // Format post object
  const newPost = {
    id: Date.now(),
    user: { id, username, profilePicture },
    imageUrl: imagePreview,
    caption: caption,
    likes: 0,
    comments: 0,
    timestamp: 'Just now',
    liked: false,
    poll: createdPoll
  };
  
  // Callback to parent
  onPostCreated && onPostCreated(newPost);
  
  // Reset form
  setCaption('');
  setImage(null);
  setImagePreview(null);
  setPollData(null);
  setIsCreating(false);
};
```

### Data Flow

```
User Action → Modal Opens
     ↓
User Inputs Content (caption/image/poll)
     ↓
Click "Post" Button
     ↓
Content Moderation Check
     ↓
Create Post Object
     ↓
onPostCreated Callback
     ↓
Feed.jsx handlePostCreated()
     ↓
Format Post Data
     ↓
Update Posts State (prepend new post)
     ↓
Save to localStorage
     ↓
Modal Closes → Post Appears in Feed
```

### Data Persistence

#### localStorage
Posts are persisted using browser localStorage:

```javascript
// Key: 'feedPosts'
// Value: JSON stringified array of post objects

// Save
localStorage.setItem('feedPosts', JSON.stringify(posts));

// Load
const savedPosts = localStorage.getItem('feedPosts');
const parsedPosts = JSON.parse(savedPosts);
```

#### Post Object Structure
```javascript
{
  id: number,                    // Unique timestamp-based ID
  user: {
    name: string,                // Display name
    username: string,            // @username
    avatar: string,              // Profile picture URL
    verified: boolean            // Verification badge
  },
  content: string,               // Post caption/text
  image: string | null,          // Image URL or null
  timestamp: string,             // "Just now", "2h ago", etc.
  likes: number,                 // Like count
  comments: number,              // Comment count
  shares: number,                // Share count
  tags: string[],               // Hashtags array
  poll: object | null           // Poll data or null
}
```

## Context Providers

### Required Providers
The create post feature requires these context providers:

```javascript
// main.jsx
<PollProvider>        // For poll functionality
  <AuthProvider>      // For user information
    <App />
  </AuthProvider>
</PollProvider>
```

### PollProvider
- Manages poll creation and voting
- Stores polls in localStorage
- Provides `createPoll()` function
- Tracks user votes

### AuthProvider
- Provides current user data
- Used for post author information
- Profile picture and username display

## Content Moderation

### useContentModeration Hook
```javascript
const { analyze, bypass, resetModeration, warnings } = useContentModeration();

// Analyze content
const { isClean } = analyze(textContent);

// If not clean, show warning
if (!isClean) {
  setShowModerationModal(true);
}
```

### ModerationWarning Component
- Displays detected issues
- Options to edit or bypass
- Warnings about inappropriate content

## Styling

### Modal Styling
- Fixed overlay: `bg-black bg-opacity-50`
- Centered: `flex items-center justify-center`
- Z-index: `z-50`
- Max width: `max-w-2xl`
- Max height: `max-h-[90vh]`
- Overflow: `overflow-y-auto`

### Responsive Design
- Works on mobile and desktop
- Scrollable modal content
- Touch-friendly buttons
- Accessible form controls

## User Experience

### Success Flow
1. User clicks "What's on your mind?"
2. Modal opens with create post form
3. User enters caption/uploads image
4. User clicks "Post" button
5. Content passes moderation
6. Post appears at top of feed
7. Modal closes automatically
8. Success (silent - post appearance is confirmation)

### Error Handling
- Empty post: Submit button disabled
- Content moderation failure: Warning modal shown
- Image load failure: Placeholder shown
- localStorage error: Falls back to in-memory state

## Testing

### Manual Testing Checklist
- [ ] Click "What's on your mind?" opens modal
- [ ] Click Photo/Video/Poll buttons opens modal
- [ ] Enter text under 500 characters works
- [ ] Character counter updates correctly
- [ ] Image upload shows preview
- [ ] Remove image works
- [ ] Create poll works
- [ ] Remove poll works
- [ ] Submit with text only works
- [ ] Submit with image only works
- [ ] Submit with poll only works
- [ ] Empty submit is prevented
- [ ] Content moderation triggers when needed
- [ ] Post appears at top of feed
- [ ] Modal closes after posting
- [ ] Post persists after refresh
- [ ] Multiple posts work correctly

### Edge Cases
- Maximum character limit (500)
- Large image files
- Multiple rapid post creations
- localStorage quota exceeded
- Invalid image formats
- Network disconnection (for future API integration)

## Future Enhancements

### Planned Features
1. **Backend Integration**: Save posts to MongoDB database
2. **Video Upload**: Support video content
3. **Multiple Images**: Gallery/carousel support
4. **Mentions**: @username tagging
5. **Hashtag Extraction**: Auto-detect and link hashtags
6. **Draft Saving**: Save incomplete posts
7. **Scheduled Posts**: Post at specific time
8. **Location Tagging**: Add location to posts
9. **Privacy Settings**: Control post visibility
10. **Edit Posts**: Modify existing posts

### Backend API (When Implemented)
```javascript
// POST /api/posts
{
  caption: string,
  imageUrl: string,
  pollId: string,
  visibility: 'public' | 'friends' | 'private'
}

// Response
{
  success: true,
  post: { id, user, caption, ... }
}
```

## Troubleshooting

### Common Issues

#### Modal doesn't open
- Check `showCreateModal` state
- Verify onClick handlers are attached
- Check for JavaScript errors in console

#### Post doesn't appear after creating
- Check `handlePostCreated` is called
- Verify `setPosts` functional update
- Check localStorage quota
- Review console logs

#### PollProvider error
- Ensure PollProvider wraps the app in main.jsx
- Check PollContext import path
- Verify usePolls hook usage

#### Content moderation false positives
- Review moderation word list
- Adjust sensitivity settings
- Implement bypass mechanism

#### localStorage issues
- Check browser privacy settings
- Verify localStorage quota
- Test in incognito mode
- Clear localStorage: `localStorage.clear()`

## Performance Considerations

- **Image Optimization**: Consider compressing images before upload
- **localStorage Limits**: ~5-10MB per domain
- **Post Limit**: Consider limiting stored posts (e.g., last 100)
- **Lazy Loading**: Load images as needed in feed
- **Debouncing**: Character counter updates

## Accessibility

- Modal keyboard navigation (Esc to close)
- Focus management (trap focus in modal)
- ARIA labels on buttons
- Alt text for images
- Screen reader announcements
- Sufficient color contrast
- Touch target sizes (minimum 44x44px)

## Security Notes

- Content moderation for inappropriate content
- XSS prevention (sanitize input before rendering)
- CSRF protection (when backend integrated)
- Rate limiting (prevent spam)
- File type validation
- File size limits
- Authentication required

## Related Documentation

- [API_REFERENCE.md](./API_REFERENCE.md) - API endpoints
- [AUTHENTICATION.md](./AUTHENTICATION.md) - User authentication
- [POLLS.md](./POLLS.md) - Poll system details
- [MODERATION.md](./MODERATION.md) - Content moderation
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - State patterns

## Changelog

### Version 1.0.0 (January 13, 2026)
- ✅ Initial implementation
- ✅ Text post creation
- ✅ Image upload with preview
- ✅ Poll integration
- ✅ Content moderation
- ✅ localStorage persistence
- ✅ Modal UI implementation
- ✅ Feed integration

---

**Last Updated**: January 13, 2026  
**Maintainer**: College Media Team  
**Status**: Active Development
