# College Media API Reference

## Overview

The College Media API is a RESTful API for the College Media social platform. It provides endpoints for user authentication, profile management, posts, messaging, live streaming, and more.

## Base URL

- Development: `http://localhost:5000`
- Production: `https://api.collegemedia.com`

## Authentication

All API requests require JWT authentication via Bearer token in the Authorization header.

```
Authorization: Bearer <your_jwt_token>
```

### Obtaining a Token

Use the `/api/auth/login` endpoint to authenticate and receive a JWT token.

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits vary by endpoint:
- Authentication endpoints: 5 requests per 15 minutes
- General API endpoints: 100 requests per 15 minutes
- Search endpoints: 30 requests per minute
- Admin endpoints: 50 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Response Format

All responses follow a consistent format:

```json
{
  "success": true|false,
  "data": {},
  "message": "Response message"
}
```

## Error Codes

- `400` - Bad Request: Invalid input data
- `401` - Unauthorized: Missing or invalid authentication
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error

## Endpoints

### Authentication

#### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id"
  }
}
```

**Error Responses:**
- `400`: User already exists or invalid data

#### POST /api/auth/login

Authenticate user credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here"
  }
}
```

**Response (200) - 2FA Required:**
```json
{
  "success": true,
  "requiresTwoFactor": true,
  "userId": "user_id"
}
```

**Error Responses:**
- `400`: Invalid credentials

#### POST /api/auth/2fa/setup

Generate 2FA setup QR code.

**Headers:** Authorization required

**Response (200):**
```json
{
  "success": true,
  "secret": "base32_secret",
  "qrCodeUrl": "otpauth://totp/..."
}
```

#### POST /api/auth/2fa/enable

Enable 2FA after verification.

**Headers:** Authorization required

**Request Body:**
```json
{
  "secret": "base32_secret",
  "token": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "2FA enabled successfully",
  "backupCodes": ["code1", "code2", ...]
}
```

#### POST /api/auth/2fa/disable

Disable 2FA.

**Headers:** Authorization required

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "2FA disabled"
}
```

#### POST /api/auth/2fa/verify-login

Complete login with 2FA.

**Request Body:**
```json
{
  "userId": "user_id",
  "token": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "2FA login successful",
  "data": {
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/logout

Logout current session.

**Headers:** Authorization required

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Users

#### GET /api/users/profile

Get current user profile.

**Headers:** Authorization required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Computer Science student",
    "profilePicture": "url",
    "role": "student",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/users/profile

Update user profile.

**Headers:** Authorization required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

#### POST /api/users/profile-picture

Upload profile picture.

**Headers:** Authorization required

**Content-Type:** multipart/form-data

**Form Data:**
- `profilePicture`: Image file

**Response (200):**
```json
{
  "success": true,
  "message": "Profile picture updated successfully",
  "data": {
    "profilePictureUrl": "url"
  }
}
```

#### GET /api/users/profile/:username

Get user profile by username.

**Headers:** Authorization required

**Parameters:**
- `username`: Username of the user

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "posts": [ ... ],
    "stats": { ... }
  }
}
```

#### GET /api/users/profile/:username/posts

Get user's posts.

**Headers:** Authorization required

**Parameters:**
- `username`: Username of the user
- `page`: Page number (optional)
- `limit`: Items per page (optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [ ... ],
    "pagination": { ... }
  }
}
```

#### PUT /api/users/profile/settings

Update user settings.

**Headers:** Authorization required

**Request Body:**
```json
{
  "setting": "value"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

#### GET /api/users/profile/stats

Get user statistics.

**Headers:** Authorization required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "postsCount": 10,
    "followersCount": 50,
    "followingCount": 30
  }
}
```

#### DELETE /api/users/profile-picture

Delete profile picture.

**Headers:** Authorization required

**Response (200):**
```json
{
  "success": true,
  "message": "Profile picture deleted successfully"
}
```

#### GET /api/users/

Get all users (Admin only).

**Headers:** Authorization required

**Permissions:** VIEW_USERS

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search term

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [ ... ],
    "pagination": { ... }
  }
}
```

#### DELETE /api/users/:userId

Delete user (Admin only).

**Headers:** Authorization required

**Permissions:** DELETE_USER

**Parameters:**
- `userId`: ID of user to delete

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Posts

<!-- Add posts endpoints here -->

### Messages

#### POST /api/messages/

Send a new message.

**Headers:** Authorization required

**Request Body:**
```json
{
  "receiver": "user_id",
  "content": "Message content",
  "messageType": "text",
  "attachmentUrl": "url"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "message": { ... }
  },
  "message": "Message sent successfully"
}
```

#### GET /api/messages/conversations

Get user's conversations.

**Headers:** Authorization required

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [ ... ],
    "pagination": { ... }
  }
}
```

#### GET /api/messages/conversation/:userId

Get conversation with specific user.

**Headers:** Authorization required

**Parameters:**
- `userId`: User ID

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [ ... ],
    "pagination": { ... }
  }
}
```

#### PUT /api/messages/:messageId/read

Mark message as read.

**Headers:** Authorization required

**Parameters:**
- `messageId`: Message ID

**Response (200):**
```json
{
  "success": true,
  "message": "Message marked as read"
}
```

#### DELETE /api/messages/:messageId

Delete a message.

**Headers:** Authorization required

**Parameters:**
- `messageId`: Message ID

**Response (200):**
```json
{
  "success": true,
  "message": "Message deleted"
}
```

#### GET /api/messages/unread/count

Get unread messages count.

**Headers:** Authorization required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

#### PUT /api/messages/conversation/:userId/read-all

Mark all messages in conversation as read.

**Headers:** Authorization required

**Parameters:**
- `userId`: User ID

**Response (200):**
```json
{
  "success": true,
  "message": "All messages marked as read"
}
```

### Search

#### GET /api/search/

General search.

**Headers:** Optional authorization

**Query Parameters:**
- `q`: Search query
- `type`: Search type (users, posts, etc.)
- `page`: Page number
- `limit`: Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "results": [ ... ],
    "pagination": { ... }
  }
}
```

#### GET /api/search/users

Search users.

**Headers:** Optional authorization

**Query Parameters:**
- `q`: Search query
- `page`: Page number
- `limit`: Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [ ... ],
    "pagination": { ... }
  }
}
```

#### GET /api/search/posts

Search posts.

**Headers:** Optional authorization

**Query Parameters:**
- `q`: Search query
- `page`: Page number
- `limit`: Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [ ... ],
    "pagination": { ... }
  }
}
```

#### GET /api/search/trending

Get trending topics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trending": [ ... ]
  }
}
```

#### GET /api/search/suggestions

Get search suggestions.

**Query Parameters:**
- `q`: Partial query

**Response (200):**
```json
{
  "success": true,
  "data": {
    "suggestions": [ ... ]
  }
}
```

### Notifications

#### POST /api/notifications/subscribe

Subscribe to push notifications.

**Headers:** Authorization required

**Request Body:**
```json
{
  "endpoint": "push_endpoint",
  "keys": {
    "p256dh": "key",
    "auth": "auth_key"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subscribed to notifications"
}
```

#### GET /api/notifications/

Get user notifications.

**Headers:** Authorization required

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [ ... ],
    "pagination": { ... }
  }
}
```

### Upload

#### POST /api/upload/

Upload a file.

**Headers:** Authorization required

**Content-Type:** multipart/form-data

**Form Data:**
- `file`: File to upload

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "file_url"
  }
}
```

### Resume

#### POST /api/resume/

Create a resume.

**Headers:** Authorization required

**Request Body:**
```json
{
  "title": "Resume Title",
  "content": { ... }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "resumeId": "id"
  }
}
```

#### GET /api/resume/feed

Get resume feed.

**Headers:** Authorization required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "resumes": [ ... ]
  }
}
```

#### POST /api/resume/:id/review

Review a resume.

**Headers:** Authorization required

**Parameters:**
- `id`: Resume ID

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great resume"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Review submitted"
}
```

#### POST /api/resume/generate

Generate resume using AI.

**Headers:** Authorization required

**Request Body:**
```json
{
  "data": { ... }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "generatedResume": { ... }
  }
}
```

#### POST /api/resume/enhance/:section

Enhance resume section.

**Headers:** Authorization required

**Parameters:**
- `section`: Section name

**Request Body:**
```json
{
  "content": "section content"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "enhancedContent": "enhanced content"
  }
}
```

#### GET /api/resume/my-resume

Get user's resume.

**Headers:** Authorization required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "resume": { ... }
  }
}
```

#### GET /api/resume/:id/download

Download resume.

**Headers:** Authorization required

**Parameters:**
- `id`: Resume ID

**Response (200):**
PDF file

#### POST /api/resume/ats-check

Check resume ATS compatibility.

**Headers:** Authorization required

**Request Body:**
```json
{
  "resumeContent": "resume text"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "suggestions": [ ... ]
  }
}
```

#### POST /api/resume/optimize-for-job

Optimize resume for job.

**Headers:** Authorization required

**Request Body:**
```json
{
  "resume": { ... },
  "jobDescription": "job desc"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "optimizedResume": { ... }
  }
}
```

#### POST /api/resume/extract-job-description

Extract job description from PDF.

**Headers:** Authorization required

**Content-Type:** multipart/form-data

**Form Data:**
- `jobDescriptionPdf`: PDF file

**Response (200):**
```json
{
  "success": true,
  "data": {
    "extractedText": "job description text"
  }
}
```

#### POST /api/resume/analyze-resume-for-job

Analyze resume against job.

**Headers:** Authorization required

**Content-Type:** multipart/form-data

**Form Data:**
- `resumePdf`: Resume PDF

**Request Body (additional):**
```json
{
  "jobDescription": "job desc"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "analysis": { ... }
  }
}
```

### Geo

#### GET /api/geo/posts

Get posts by location.

**Headers:** Authorization required

**Query Parameters:**
- `lat`: Latitude
- `lng`: Longitude
- `radius`: Radius in km

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [ ... ]
  }
}
```

#### GET /api/geo/users

Get users by location.

**Headers:** Authorization required

**Query Parameters:**
- `lat`: Latitude
- `lng`: Longitude
- `radius`: Radius in km

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [ ... ]
  }
}
```

#### POST /api/geo/location

Update user location.

**Headers:** Authorization required

**Request Body:**
```json
{
  "lat": 37.7749,
  "lng": -122.4194
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Location updated"
}
```

### Keys

#### POST /api/keys/upload

Upload encryption keys.

**Headers:** Authorization required

**Request Body:**
```json
{
  "keys": [ ... ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Keys uploaded"
}
```

#### GET /api/keys/fetch/:userId

Fetch user's keys.

**Headers:** Authorization required

**Parameters:**
- `userId`: User ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "keys": [ ... ]
  }
}
```

#### GET /api/keys/count

Get key count.

**Headers:** Authorization required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 10
  }
}
```

### Tutor

#### POST /api/tutor/upload

Upload document for tutoring.

**Headers:** Authorization required

**Content-Type:** multipart/form-data

**Form Data:**
- `document`: Document file

**Response (200):**
```json
{
  "success": true,
  "data": {
    "documentId": "id"
  }
}
```

#### POST /api/tutor/ask

Ask a question.

**Headers:** Authorization required

**Request Body:**
```json
{
  "question": "What is machine learning?",
  "documentId": "optional_id"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "answer": "Machine learning is..."
  }
}
```

#### GET /api/tutor/documents

Get user's documents.

**Headers:** Authorization required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "documents": [ ... ]
  }
}
```

#### DELETE /api/tutor/documents/:documentId

Delete document.

**Headers:** Authorization required

**Parameters:**
- `documentId`: Document ID

**Response (200):**
```json
{
  "success": true,
  "message": "Document deleted"
}
```

### Alumni

<!-- Add alumni endpoints here -->

### Admin

#### GET /api/admin/tasks

Get scheduled tasks.

**Headers:** Authorization required

**Permissions:** MANAGE_SETTINGS

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [ ... ]
  }
}
```

#### POST /api/admin/tasks/:name/trigger

Trigger a task.

**Headers:** Authorization required

**Permissions:** MANAGE_SETTINGS

**Parameters:**
- `name`: Task name

**Response (200):**
```json
{
  "success": true,
  "message": "Task triggered"
}
```

#### POST /api/admin/tasks/:name/enable

Enable a task.

**Headers:** Authorization required

**Permissions:** MANAGE_SETTINGS

**Parameters:**
- `name`: Task name

**Response (200):**
```json
{
  "success": true,
  "message": "Task enabled"
}
```

#### POST /api/admin/tasks/:name/disable

Disable a task.

**Headers:** Authorization required

**Permissions:** MANAGE_SETTINGS

**Parameters:**
- `name`: Task name

**Response (200):**
```json
{
  "success": true,
  "message": "Task disabled"
}
```

#### GET /api/admin/analytics/dashboard

Get dashboard analytics.

**Headers:** Authorization required

**Permissions:** VIEW_LOGS

**Response (200):**
```json
{
  "success": true,
  "data": {
    "analytics": { ... }
  }
}
```

#### GET /api/admin/analytics/metrics

Get system metrics.

**Headers:** Authorization required

**Permissions:** VIEW_LOGS

**Response (200):**
```json
{
  "success": true,
  "data": {
    "metrics": { ... }
  }
}
```

#### GET /api/admin/analytics/health

Get system health.

**Headers:** Authorization required

**Permissions:** VIEW_LOGS

**Response (200):**
```json
{
  "success": true,
  "data": {
    "health": { ... }
  }
}
```

#### POST /api/admin/analytics/refresh

Refresh analytics.

**Headers:** Authorization required

**Permissions:** MANAGE_SETTINGS

**Response (200):**
```json
{
  "success": true,
  "message": "Analytics refreshed"
}
```

### External

#### GET /api/external/status

Check external service status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "operational"
  }
}
```

### Credentials

#### POST /api/credentials/mint

Mint a credential (Admin only).

**Headers:** Authorization required

**Permissions:** MANAGE_USERS

**Request Body:**
```json
{
  "userId": "user_id",
  "credentialType": "achievement",
  "metadata": { ... }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "credential": { ... }
  }
}
```

#### GET /api/credentials/verify/:address

Verify credential by address.

**Headers:** Authorization required

**Parameters:**
- `address`: Blockchain address

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "credential": { ... }
  }
}
```

#### GET /api/credentials/user/:address

Get user's credentials.

**Headers:** Authorization required

**Parameters:**
- `address`: User address

**Response (200):**
```json
{
  "success": true,
  "data": {
    "credentials": [ ... ]
  }
}
```

### Streams

#### POST /api/streams/upload

Upload video stream.

**Headers:** Authorization required

**Content-Type:** multipart/form-data

**Form Data:**
- `video`: Video file

**Response (200):**
```json
{
  "success": true,
  "data": {
    "videoId": "id",
    "status": "processing"
  }
}
```

#### GET /api/streams/:videoId/status

Get video processing status.

**Headers:** Authorization required

**Parameters:**
- `videoId`: Video ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "processing|completed|failed",
    "progress": 50
  }
}
```

#### GET /api/streams/:videoId/:file

Stream video file.

**Parameters:**
- `videoId`: Video ID
- `file`: File name (e.g., "playlist.m3u8")

**Response (200):**
Video stream or playlist file

## GraphQL API

The API also provides a GraphQL endpoint at `/graphql` for more flexible queries.

<!-- Add GraphQL schema documentation here -->

## WebSocket Events

The API uses Socket.IO for real-time communication.

### Events

- `message`: New message received
- `notification`: New notification
- `live-stream-started`: Live stream started
- `live-stream-ended`: Live stream ended

<!-- Add more WebSocket documentation here -->

## SDKs and Libraries

<!-- Add information about available SDKs -->

## Changelog

<!-- Add API changelog here -->

## Support

For API support, contact support@collegemedia.com