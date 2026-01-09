# Real-time Notifications System

## Overview
Complete implementation of real-time notifications system with WebSocket integration, badge counters, notification center, and user preferences for College Media platform.

## Issue
[Notifications] Implement Real-time Notifications System with Badge Counter #259

## Features Implemented

### 1. Notification Bell Component
- **Location**: `frontend/src/components/NotificationBell.jsx`
- Bell icon in navbar with unread badge counter
- Dropdown notification panel on click
- Real-time badge updates
- Pulse animation for new notifications
- Click-outside to close functionality

### 2. Notification Dropdown
- **Location**: `frontend/src/components/NotificationDropdown.jsx`
- Shows latest 10 notifications
- "Mark all as read" button
- Link to full notification center
- Empty state when no notifications
- Unread count display

### 3. Notification Item Component
- **Location**: `frontend/src/components/NotificationItem.jsx`
- Individual notification display with:
  - User avatar or notification type icon
  - Formatted message with actor name
  - Time ago display (using date-fns)
  - Read/unread indicator
  - Image preview for relevant notifications
  - Click to mark as read

### 4. Notification Center
- **Location**: `frontend/src/components/NotificationCenter.jsx`
- Full-page notification management
- Filter by type (all, likes, comments, follows, mentions, shares, replies)
- Infinite scroll with pagination
- Mark all as read functionality
- Clear all notifications with confirmation
- Empty state for each filter
- Loading states

### 5. Notification Preferences
- **Location**: `frontend/src/components/NotificationPreferences.jsx`
- Sound notifications toggle
- Desktop notifications permission request
- Do Not Disturb mode
- Individual notification type toggles:
  - Likes on posts
  - Comments on posts
  - New followers
  - Mentions in posts
  - Shares of posts
  - Replies to comments
- Preferences saved to localStorage

### 6. Notification Context
- **Location**: `frontend/src/context/NotificationContext.jsx`
- Global notification state management
- WebSocket integration for real-time updates
- Functions:
  - `markAsRead(notificationId)` - Mark single notification as read
  - `markAllAsRead()` - Mark all notifications as read
  - `deleteNotification(notificationId)` - Delete single notification
  - `clearAll()` - Clear all notifications
  - `updatePreferences(newPreferences)` - Update notification preferences
  - `refreshNotifications()` - Reload notifications from API
- Document title updates with unread count
- Toast notifications for new notifications
- Sound playback on new notifications
- Desktop browser notifications

### 7. Notification Sound Utilities
- **Location**: `frontend/src/utils/notificationSound.js`
- Web Audio API implementation for pleasant notification sounds
- Customizable volume control
- Mobile vibration support (PWA)
- Alternative audio file playback method
- Combined feedback (sound + vibration)

### 8. Custom Hooks
- **Location**: `frontend/src/hooks/useNotifications.js`
- `useNotifications()` - Access full notification context
- `useUnreadCount()` - Get unread count only
- `useNotificationPreferences()` - Access preferences and updater
- `useNotificationActions()` - Access notification actions

### 9. API Integration
- **Location**: `frontend/src/api/endpoints.js`
- Notification endpoints:
  - `GET /notifications` - Fetch notifications with pagination
  - `PUT /notifications/:id/read` - Mark single as read
  - `PUT /notifications/read-all` - Mark all as read
  - `DELETE /notifications/:id` - Delete single notification
  - `DELETE /notifications/clear-all` - Clear all notifications

## Integration Points

### Navbar Integration
- **File**: `frontend/src/components/Navbar.jsx`
- Replaced static notification link with `NotificationBell` component
- Real-time badge counter visible in navbar

### App Routes
- **File**: `frontend/src/App.jsx`
- Added routes:
  - `/notifications` - Notification Center
  - `/notifications/preferences` - Notification Preferences
- Lazy loaded for performance

### Main Entry Point
- **File**: `frontend/src/main.jsx`
- Wrapped app with `NotificationProvider`
- Placed inside `SocketProvider` for WebSocket access

## Dependencies Used

### Existing Dependencies
- `react-hot-toast` - Toast notifications
- `@iconify/react` - Icons
- `react-router-dom` - Routing
- `date-fns` - Date formatting
- `socket.io-client` - WebSocket (already implemented)

### No New Dependencies Required
All features implemented using existing dependencies from previous issues.

## WebSocket Events

### Listening For
- `notification` - Receives new notification objects
  ```javascript
  {
    id: string,
    type: 'like' | 'comment' | 'follow' | 'mention' | 'share' | 'reply',
    message: string,
    actor: { name: string, avatar: string },
    link: string,
    preview: string (optional),
    read: boolean,
    createdAt: timestamp,
    silent: boolean (optional)
  }
  ```

## Notification Types

1. **Like** - When someone likes your post
2. **Comment** - When someone comments on your post  
3. **Follow** - When someone follows you
4. **Mention** - When someone mentions you in a post/comment
5. **Share** - When someone shares your post
6. **Reply** - When someone replies to your comment

## User Preferences Stored in localStorage

```javascript
{
  soundEnabled: boolean,
  desktopEnabled: boolean,
  doNotDisturb: boolean,
  types: {
    like: boolean,
    comment: boolean,
    follow: boolean,
    mention: boolean,
    share: boolean,
    reply: boolean
  }
}
```

## Browser Notification Permissions

The system requests browser notification permission when user enables desktop notifications in preferences:
- **Default**: Shows "Enable" button to request permission
- **Granted**: Toggle works normally
- **Denied**: Toggle disabled with warning message

## Document Title Updates

Unread count automatically updates the document title:
- No unread: "College Media"
- With unread: "(5) College Media"

## Testing Checklist

- [ ] Notification bell displays in navbar
- [ ] Badge counter updates on new notifications
- [ ] Dropdown opens/closes correctly
- [ ] Click outside closes dropdown
- [ ] Real-time notifications arrive via WebSocket
- [ ] Toast notifications display
- [ ] Sound plays on new notification
- [ ] Desktop notifications work (if permission granted)
- [ ] Mark as read updates UI and badge
- [ ] Mark all as read works
- [ ] Notification center loads with pagination
- [ ] Filters work correctly
- [ ] Clear all with confirmation works
- [ ] Preferences save to localStorage
- [ ] Do Not Disturb blocks notifications
- [ ] Notification type filters work
- [ ] Sound toggle works
- [ ] Desktop notification permission request works
- [ ] Document title updates with unread count
- [ ] Mobile vibration works (PWA)
- [ ] Empty states display correctly
- [ ] Loading states display correctly

## Backend Requirements

The backend needs to implement these endpoints:

### GET /notifications
```javascript
// Query params: page, limit, type
// Response:
{
  notifications: [...],
  unreadCount: number,
  total: number,
  page: number
}
```

### PUT /notifications/:id/read
```javascript
// Marks notification as read
// Response: { success: true }
```

### PUT /notifications/read-all
```javascript
// Marks all notifications as read
// Response: { success: true }
```

### DELETE /notifications/:id
```javascript
// Deletes single notification
// Response: { success: true }
```

### DELETE /notifications/clear-all
```javascript
// Deletes all notifications
// Response: { success: true }
```

### WebSocket Events
Backend should emit `notification` event to user's socket when:
- Someone likes their post
- Someone comments on their post
- Someone follows them
- Someone mentions them
- Someone shares their post
- Someone replies to their comment

## Files Created/Modified

### Created (9 files)
1. `frontend/src/context/NotificationContext.jsx`
2. `frontend/src/hooks/useNotifications.js`
3. `frontend/src/utils/notificationSound.js`
4. `frontend/src/components/NotificationBell.jsx`
5. `frontend/src/components/NotificationDropdown.jsx`
6. `frontend/src/components/NotificationItem.jsx`
7. `frontend/src/components/NotificationCenter.jsx`
8. `frontend/src/components/NotificationPreferences.jsx`
9. `NOTIFICATIONS.md` (this file)

### Modified (4 files)
1. `frontend/src/components/Navbar.jsx` - Added NotificationBell
2. `frontend/src/App.jsx` - Added routes for notification pages
3. `frontend/src/main.jsx` - Added NotificationProvider
4. `frontend/src/api/endpoints.js` - Added clearAll endpoint

**Total: 13 files**

## Benefits

✅ **Real-time user engagement** - Instant notification delivery  
✅ **Improved user retention** - Users stay informed of interactions  
✅ **Professional UX** - Badge counters, animations, sounds  
✅ **Customizable** - User preferences for all notification types  
✅ **Accessible** - Keyboard navigation, screen reader support  
✅ **Performance optimized** - Lazy loading, pagination, caching  
✅ **PWA ready** - Desktop notifications, vibration support  
✅ **Mobile friendly** - Responsive design, touch optimized  

## Future Enhancements

- [ ] Email notification digest
- [ ] Notification grouping (e.g., "John and 5 others liked your post")
- [ ] Rich notification previews
- [ ] Notification scheduling
- [ ] Push notification service worker
- [ ] Notification analytics
- [ ] Notification search
- [ ] Notification archiving
- [ ] Custom notification sounds per type

## Related Issues

- Issue #5: WebSocket Implementation (dependency)
- Issue #250: API Error Handling (dependency)
- Issue #259: Notifications System (this issue)

---

**Implementation Status**: ✅ Complete  
**Ready for Testing**: Yes  
**Ready for PR**: Yes
