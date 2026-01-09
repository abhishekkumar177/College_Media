# 🔌 College Media API Reference

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api/v1`  
**Status:** Living Document (Updated as backend is implemented)  
**Last Updated:** January 2026  

This comprehensive API reference documents all backend endpoints for College Media, a social media platform for college communities. It includes detailed specifications for authentication, user management, content sharing, social interactions, messaging, and real-time features.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Posts](#posts)
- [Comments](#comments)
- [Follow System](#follow-system)
- [Messages](#messages)
- [Notifications](#notifications)
- [Search](#search)
- [WebSocket Events](#websocket-events)
- [Integration Guide](#integration-guide)
- [Error Codes](#error-codes)
- [Rate Limits](#rate-limits)
- [Security Headers](#security-headers)
- [Edge Cases](#edge-cases)

## 🔐 Authentication

All API endpoints (except registration and login) require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Tokens expire after 15 minutes. Use refresh tokens to obtain new access tokens.

### Register User

**Endpoint:** `POST /auth/register`  
**Description:** Create a new user account  
**Auth Required:** No  
**Rate Limit:** 10 requests per hour per IP  

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "username": "john_doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Errors:**
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Username or email already exists
- `429 Too Many Requests`: Rate limit exceeded

### Login

**Endpoint:** `POST /auth/login`  
**Description:** Authenticate user and return tokens  
**Auth Required:** No  
**Rate Limit:** 5 requests per minute per IP  

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "username": "john_doe",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Errors:**
- `400 Bad Request`: Invalid credentials
- `401 Unauthorized`: Account disabled
- `429 Too Many Requests`: Rate limit exceeded

### Refresh Token

**Endpoint:** `POST /auth/refresh`  
**Description:** Obtain new access token using refresh token  
**Auth Required:** No  
**Rate Limit:** 10 requests per minute per user  

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
- `400 Bad Request`: Invalid refresh token
- `401 Unauthorized`: Refresh token expired

## 👥 Users

### Get User Profile

**Endpoint:** `GET /users/{user_id}`  
**Description:** Retrieve user profile information  
**Auth Required:** Yes  
**Rate Limit:** 100 requests per minute per user  

**Path Parameters:**
- `user_id` (UUID): User ID  

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "username": "john_doe",
    "first_name": "John",
    "last_name": "Doe",
    "bio": "College student | Photography enthusiast",
    "profile_picture_url": "https://s3.amazonaws.com/...",
    "profile_banner_url": "https://s3.amazonaws.com/...",
    "follower_count": 1250,
    "following_count": 450,
    "post_count": 87,
    "is_verified": false,
    "is_private": false,
    "is_following": true,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/v1/users/uuid-123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Errors:**
- `404 Not Found`: User not found
- `403 Forbidden`: Private profile, not following

### Update User Profile

**Endpoint:** `PUT /users/{user_id}`  
**Description:** Update user profile information  
**Auth Required:** Yes (own profile only)  
**Rate Limit:** 20 requests per minute per user  

**Request Body:**
```json
{
  "bio": "Updated bio",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "username": "john_doe",
    "first_name": "John",
    "last_name": "Doe",
    "bio": "Updated bio",
    "updated_at": "2025-01-15T11:00:00Z"
  }
}
```

**Errors:**
- `400 Bad Request`: Invalid input data
- `403 Forbidden`: Not authorized to update this profile

### Upload Profile Picture

**Endpoint:** `POST /users/{user_id}/profile-picture`  
**Description:** Upload profile picture  
**Auth Required:** Yes (own profile only)  
**Rate Limit:** 5 requests per minute per user  
**Content-Type:** multipart/form-data  

**Form Data:**
- `file`: Image file (max 5MB, formats: JPEG, PNG, WebP)  

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profile_picture_url": "https://s3.amazonaws.com/..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/users/uuid-123/profile-picture \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "file=@profile.jpg"
```

**Errors:**
- `400 Bad Request`: Invalid file format or size
- `413 Payload Too Large`: File exceeds 5MB limit

### Search Users

**Endpoint:** `GET /users/search`  
**Description:** Search for users by username or name  
**Auth Required:** Yes  
**Rate Limit:** 50 requests per minute per user  

**Query Parameters:**
- `q` (string): Search query (required)
- `limit` (int): Results per page (default: 20, max: 100)
- `offset` (int): Pagination offset (default: 0)  

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "username": "john_doe",
      "first_name": "John",
      "last_name": "Doe",
      "profile_picture_url": "https://...",
      "is_following": false
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

## 📝 Posts

### Create Post

**Endpoint:** `POST /posts`  
**Description:** Create a new post with media  
**Auth Required:** Yes  
**Rate Limit:** 10 requests per minute per user  
**Content-Type:** multipart/form-data  

**Form Data:**
- `caption` (string): Post caption (max 2200 chars)
- `media` (file[]): Media files (max 10 files, 50MB total)
- `hashtags` (string[]): Array of hashtags  

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-456",
    "user_id": "uuid-123",
    "caption": "Beautiful sunset at campus! 🌅 #nature #college",
    "media": [
      {
        "id": "uuid-789",
        "media_url": "https://s3.amazonaws.com/...",
        "media_type": "image",
        "width": 1920,
        "height": 1080,
        "file_size": 2048576
      }
    ],
    "hashtags": ["nature", "college"],
    "like_count": 0,
    "comment_count": 0,
    "is_liked": false,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/posts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "caption=Beautiful sunset!" \
  -F "media=@sunset.jpg" \
  -F 'hashtags=["nature","sunset"]'
```

**Errors:**
- `400 Bad Request`: Invalid caption or media
- `413 Payload Too Large`: Media exceeds size limits
- `422 Unprocessable Entity`: Unsupported media format

### Get Feed

**Endpoint:** `GET /posts/feed`  
**Description:** Get user's personalized feed  
**Auth Required:** Yes  
**Rate Limit:** 100 requests per minute per user  

**Query Parameters:**
- `limit` (int): Posts per page (default: 20, max: 50)
- `offset` (int): Pagination offset (default: 0)  

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-456",
      "user": {
        "id": "uuid-123",
        "username": "john_doe",
        "profile_picture_url": "https://..."
      },
      "caption": "Beautiful sunset at campus! 🌅",
      "media": [
        {
          "media_url": "https://s3.amazonaws.com/...",
          "media_type": "image",
          "width": 1920,
          "height": 1080
        }
      ],
      "hashtags": ["nature", "college"],
      "like_count": 245,
      "comment_count": 18,
      "is_liked": true,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5000,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

### Get Post Details

**Endpoint:** `GET /posts/{post_id}`  
**Description:** Get detailed post information with comments  
**Auth Required:** Yes  
**Rate Limit:** 200 requests per minute per user  

**Path Parameters:**
- `post_id` (UUID): Post ID  

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-456",
    "user": { /* user object */ },
    "caption": "Beautiful sunset...",
    "media": [ /* media array */ ],
    "hashtags": ["nature"],
    "like_count": 245,
    "comment_count": 18,
    "is_liked": true,
    "comments": [
      {
        "id": "uuid-789",
        "user": { /* user object */ },
        "content": "Amazing!",
        "like_count": 5,
        "is_liked": false,
        "created_at": "2025-01-15T10:35:00Z"
      }
    ],
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Update Post

**Endpoint:** `PUT /posts/{post_id}`  
**Description:** Update post caption  
**Auth Required:** Yes (own post only)  
**Rate Limit:** 20 requests per minute per user  

**Request Body:**
```json
{
  "caption": "Updated caption"
}
```

### Delete Post

**Endpoint:** `DELETE /posts/{post_id}`  
**Description:** Delete a post  
**Auth Required:** Yes (own post only)  
**Rate Limit:** 10 requests per minute per user  

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

### Like Post

**Endpoint:** `POST /posts/{post_id}/like`  
**Description:** Like a post  
**Auth Required:** Yes  
**Rate Limit:** 300 requests per minute per user  

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "post_id": "uuid-456",
    "like_count": 246,
    "is_liked": true
  }
}
```

### Unlike Post

**Endpoint:** `DELETE /posts/{post_id}/like`  
**Description:** Unlike a post  
**Auth Required:** Yes  
**Rate Limit:** 300 requests per minute per user  

## 💬 Comments

### Create Comment

**Endpoint:** `POST /posts/{post_id}/comments`  
**Description:** Add a comment to a post  
**Auth Required:** Yes  
**Rate Limit:** 50 requests per minute per user  

**Request Body:**
```json
{
  "content": "Amazing photo! 📸",
  "parent_comment_id": null
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-789",
    "user": {
      "id": "uuid-123",
      "username": "john_doe",
      "profile_picture_url": "https://..."
    },
    "content": "Amazing photo! 📸",
    "like_count": 0,
    "is_liked": false,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Get Comments

**Endpoint:** `GET /posts/{post_id}/comments`  
**Description:** Get comments for a post  
**Auth Required:** Yes  
**Rate Limit:** 100 requests per minute per user  

**Query Parameters:**
- `limit` (int): Comments per page (default: 20, max: 100)
- `offset` (int): Pagination offset (default: 0)  

### Like Comment

**Endpoint:** `POST /comments/{comment_id}/like`  
**Description:** Like a comment  
**Auth Required:** Yes  
**Rate Limit:** 300 requests per minute per user  

## 👥 Follow System

### Follow User

**Endpoint:** `POST /users/{user_id}/follow`  
**Description:** Follow a user  
**Auth Required:** Yes  
**Rate Limit:** 100 requests per minute per user  

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid-456",
    "is_following": true,
    "follower_count": 1251
  }
}
```

### Unfollow User

**Endpoint:** `DELETE /users/{user_id}/follow`  
**Description:** Unfollow a user  
**Auth Required:** Yes  
**Rate Limit:** 100 requests per minute per user  

### Get Followers

**Endpoint:** `GET /users/{user_id}/followers`  
**Description:** Get user's followers  
**Auth Required:** Yes  
**Rate Limit:** 50 requests per minute per user  

**Query Parameters:**
- `limit` (int): Results per page (default: 20, max: 100)
- `offset` (int): Pagination offset (default: 0)  

## 💌 Messages

### Send Message

**Endpoint:** `POST /messages`  
**Description:** Send a direct message  
**Auth Required:** Yes  
**Rate Limit:** 30 requests per minute per user  

**Request Body:**
```json
{
  "recipient_id": "uuid-789",
  "content": "Hey! How's it going?"
}
```

### Get Conversation

**Endpoint:** `GET /messages/{recipient_id}`  
**Description:** Get message history with a user  
**Auth Required:** Yes  
**Rate Limit:** 50 requests per minute per user  

## 🔔 Notifications

### Get Notifications

**Endpoint:** `GET /notifications`  
**Description:** Get user's notifications  
**Auth Required:** Yes  
**Rate Limit:** 50 requests per minute per user  

**Query Parameters:**
- `limit` (int): Notifications per page (default: 20, max: 100)
- `offset` (int): Pagination offset (default: 0)  

### Mark as Read

**Endpoint:** `PUT /notifications/{notification_id}/read`  
**Description:** Mark notification as read  
**Auth Required:** Yes  
**Rate Limit:** 200 requests per minute per user  

## 🔍 Search

### Search Posts

**Endpoint:** `GET /search/posts`  
**Description:** Search posts by content  
**Auth Required:** Yes  
**Rate Limit:** 50 requests per minute per user  

**Query Parameters:**
- `q` (string): Search query (required)
- `limit` (int): Results per page (default: 20, max: 100)
- `offset` (int): Pagination offset (default: 0)  

### Trending Hashtags

**Endpoint:** `GET /trending/hashtags`  
**Description:** Get trending hashtags  
**Auth Required:** Yes  
**Rate Limit:** 100 requests per minute per user  

**Query Parameters:**
- `limit` (int): Results count (default: 10, max: 50)  

## 🔄 WebSocket Events

**WebSocket URL:** `ws://localhost:5000`  
**Authentication:** Include JWT token in connection auth  

### Connection

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});
```

### Events

#### New Message
```javascript
// Receive new message
socket.on('message:new', (data) => {
  console.log('New message:', data);
  // data: { id, sender_id, recipient_id, content, created_at }
});

// Send message
socket.emit('message:send', {
  recipient_id: 'uuid-789',
  content: 'Hello!'
});
```

#### New Notification
```javascript
socket.on('notification:new', (data) => {
  console.log('New notification:', data);
  // data: { type, actor, target_type, target_id, content }
});
```

#### User Online Status
```javascript
socket.on('user:online', (data) => {
  // data: { user_id }
});

socket.on('user:offline', (data) => {
  // data: { user_id }
});
```

## 🔗 Integration Guide

### React Frontend Integration

#### Authentication Setup
```javascript
// Store tokens
localStorage.setItem('token', response.data.token);
localStorage.setItem('refresh_token', response.data.refresh_token);

// API client setup
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

// Token refresh interceptor
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      const refreshResponse = await axios.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      localStorage.setItem('token', refreshResponse.data.token);
      // Retry original request
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);
```

#### Fetching Feed
```javascript
const fetchFeed = async (page = 0) => {
  try {
    const response = await apiClient.get('/posts/feed', {
      params: { limit: 20, offset: page * 20 }
    });
    setPosts(response.data.data);
    setHasMore(response.data.pagination.has_more);
  } catch (error) {
    console.error('Failed to fetch feed:', error);
  }
};
```

#### Creating Post with Media
```javascript
const createPost = async (caption, files, hashtags) => {
  const formData = new FormData();
  formData.append('caption', caption);
  files.forEach(file => formData.append('media', file));
  formData.append('hashtags', JSON.stringify(hashtags));

  try {
    const response = await apiClient.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to create post:', error);
  }
};
```

#### WebSocket Setup
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
});

// Listen for real-time updates
socket.on('notification:new', (notification) => {
  // Update notifications state
  setNotifications(prev => [notification, ...prev]);
});

socket.on('message:new', (message) => {
  // Update messages state
  setMessages(prev => [...prev, message]);
});
```

## ❌ Error Codes

| Code | Description | Example |
|------|-------------|---------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid or expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 413 | Payload Too Large | File upload exceeds limits |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Validation failed",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

## ⏱️ Rate Limits

- **General API:** 100 requests per minute per IP
- **Authentication:** 5 login attempts per minute per IP
- **Registration:** 10 requests per hour per IP
- **File Uploads:** 5 uploads per minute per user
- **Social Actions:** 300 likes/comments per minute per user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔒 Security Headers

All responses include security headers:

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## ⚠️ Edge Cases

### Pagination
- Maximum `limit`: 100 items per request
- Default `limit`: 20 items per request
- Use `has_more` flag for infinite scrolling
- `offset` based pagination for large datasets

### Media Upload Limits
- **Single file:** 10MB maximum
- **Total upload:** 50MB per post
- **File count:** Maximum 10 files per post
- **Supported formats:** JPEG, PNG, WebP, MP4, MOV
- **Image optimization:** Automatic resizing and compression

### Private Accounts
- Followers-only content visibility
- Follow requests for private accounts
- Content filtering in search results

### Content Moderation
- Caption length: 2200 characters maximum
- Hashtag limit: 30 hashtags per post
- Message length: 1000 characters maximum
- Automatic content filtering (future implementation)

### Data Consistency
- Optimistic UI updates with rollback on failure
- Real-time synchronization across devices
- Conflict resolution for concurrent edits

---

**Note:** This document will be updated as the backend implementation progresses. Check for the latest version before integration.
