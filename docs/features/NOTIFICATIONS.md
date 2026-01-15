# 🔔 Real-time Notifications System

## Overview
Complete implementation of a real-time notifications system with WebSocket integration, badge counters, a notification center, and granular user preferences.

## Features

### 1. Notification Interface
- **Navbar Bell**: Real-time unread badge counter with pulse animation.
- **Dropdown Panel**: Shows the latest 10 notifications with "Mark all as read".
- **Notification Center**: Full-page management with filters (Likes, Comments, Mentions, System).

### 2. Notification Preferences
Users can customize their experience via the Settings page:
- **Channels**: Toggle between Email and Push notifications.
- **Granular Control**: Enable/disable specific types:
    - Likes on posts
    - Comments & Replies
    - New Followers
    - Mentions
    - Post Shares
- **Global Settings**: "Do Not Disturb" mode and Sound toggles.

## Technical Architecture

### Frontend
- **Context**: `NotificationContext.jsx` manages global state and WebSocket connections.
- **Storage**: Preferences persist via MongoDB; UI state (like open/close) uses React State.
- **Polling/Sockets**: Uses WebSockets for instant updates; falls back to polling if disconnected.

### Backend
- **Model**: `User` model includes `notificationSettings` object.
- **Endpoints**:
    - `GET /api/notifications`: Fetch paginated notifications.
    - `PUT /api/account/notification-preferences`: Update user settings.
    - `POST /api/notifications/mark-read`: Batch update read status.

### Data Model
```javascript
notificationSettings: {
  email: { type: Boolean, default: true },
  push: { type: Boolean, default: true },
  types: {
    likes: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    follows: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true }
  }
}