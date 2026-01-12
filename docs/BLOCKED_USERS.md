# Blocked Users Feature Documentation

## Table of Contents
1. [Overview](#overview)
2. [Feature Objectives](#feature-objectives)
3. [Architecture Overview](#architecture-overview)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [User Interface](#user-interface)
9. [User Flow](#user-flow)
10. [Security Considerations](#security-considerations)
11. [Error Handling](#error-handling)
12. [Testing Guidelines](#testing-guidelines)
13. [Performance Considerations](#performance-considerations)
14. [Future Enhancements](#future-enhancements)
15. [Troubleshooting](#troubleshooting)

---

## Overview

The Blocked Users feature allows users to block and unblock other users on the College Media platform. When a user is blocked, they are prevented from interacting with the blocking user, including following them, viewing their content, or sending messages. This feature provides users with control over their social interactions and enhances privacy and safety.

### Key Features
- **Block Users**: Users can block other users to prevent unwanted interactions
- **Unblock Users**: Users can unblock previously blocked users
- **View Blocked List**: Users can view a list of all blocked accounts
- **Check Block Status**: Programmatically check if a specific user is blocked
- **Automatic Relationship Removal**: Blocking removes follower/following relationships
- **Self-Block Prevention**: Users cannot block themselves
- **Bi-directional Protection**: Blocked users are also removed from the blocker's relationships

### Technology Stack
- **Backend**: Node.js, Express.js, MongoDB/Mongoose, Mock Database
- **Frontend**: React, React Hooks (useState, useEffect)
- **API Communication**: Axios via centralized API client
- **Styling**: Tailwind CSS with dark mode support

---

## Feature Objectives

### Primary Goals
1. **User Safety**: Protect users from harassment and unwanted interactions
2. **Privacy Control**: Give users control over who can interact with them
3. **Relationship Management**: Automatically clean up social connections
4. **User Experience**: Provide intuitive interface for managing blocked users
5. **Data Integrity**: Ensure blocked relationships are properly maintained

### Business Value
- **User Safety**: Reduces harassment and improves platform safety
- **User Retention**: Users feel safer and more in control
- **Compliance**: Aligns with platform safety best practices
- **Moderation**: Reduces need for admin intervention in conflicts
- **Trust**: Builds user trust in platform safety features

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Settings Page                                                │
│       │                                                       │
│       ├──> BlockedUsersModal Component                       │
│       │         │                                             │
│       │         ├──> State Management (useState)             │
│       │         ├──> API Calls (useEffect)                   │
│       │         └──> UI Rendering (User List)                │
│       │                                                       │
│       └──> API Endpoints Layer                               │
│                 │                                             │
│                 ├──> usersApi.getBlockedUsers()              │
│                 ├──> usersApi.blockUser(userId)              │
│                 ├──> usersApi.unblockUser(userId)            │
│                 └──> usersApi.isUserBlocked(userId)          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Layer                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Express Router (/api/users)                                 │
│       │                                                       │
│       ├──> GET /blocked                                      │
│       │         │                                             │
│       │         ├──> JWT Verification                        │
│       │         ├──> User Lookup with Population             │
│       │         └──> Return Blocked Users List               │
│       │                                                       │
│       ├──> POST /:userId/block                               │
│       │         │                                             │
│       │         ├──> JWT Verification                        │
│       │         ├──> Self-Block Validation                   │
│       │         ├──> Block User + Remove Relationships       │
│       │         └──> Return Success                          │
│       │                                                       │
│       ├──> DELETE /:userId/block                             │
│       │         │                                             │
│       │         ├──> JWT Verification                        │
│       │         ├──> Unblock User                            │
│       │         └──> Return Success                          │
│       │                                                       │
│       └──> GET /:userId/is-blocked                           │
│                 │                                             │
│                 ├──> JWT Verification                        │
│                 ├──> Check Block Status                      │
│                 └──> Return Boolean Result                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  MongoDB (Production) / Mock DB (Development)                │
│                                                               │
│  User Collection/Store                                       │
│       │                                                       │
│       ├──> blockedUsers: [ObjectId]                          │
│       ├──> followers: [ObjectId]                             │
│       └──> following: [ObjectId]                             │
│                                                               │
│  User Methods:                                               │
│       ├──> blockUser(userIdToBlock)                          │
│       ├──> unblockUser(userIdToUnblock)                      │
│       └──> isUserBlocked(userId)                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Viewing Blocked Users (GET)
```
User → Settings Page → Click "Blocked Users" 
    → BlockedUsersModal Opens
    → useEffect Hook Triggers
    → usersApi.getBlockedUsers()
    → GET /api/users/blocked
    → JWT Verification
    → Database Query with Population
    → Return Blocked Users Array
    → Update Component State
    → Render User List
```

#### Blocking a User (POST)
```
User → Profile/User Page → Click "Block User"
    → Confirm Action
    → usersApi.blockUser(userId)
    → POST /api/users/:userId/block
    → JWT Verification
    → Validate (not self-block)
    → Add to blockedUsers Array
    → Remove from followers/following
    → Remove blocker from target's followers/following
    → Save Changes
    → Return Success
    → Update UI
```

#### Unblocking a User (DELETE)
```
User → Blocked Users Modal → Click "Unblock"
    → usersApi.unblockUser(userId)
    → DELETE /api/users/:userId/block
    → JWT Verification
    → Remove from blockedUsers Array
    → Save Changes
    → Return Success
    → Remove from Local State
    → Update UI
```

---

## Backend Implementation

### File Structure
```
backend/
├── models/
│   └── User.js                    # User model with blockedUsers field
├── routes/
│   └── users.js                   # Blocked users routes
└── mockdb/
    └── userDB.js                  # Mock database with block functions
```

### User Model Extensions

#### Schema Addition

**Location**: `backend/models/User.js`

```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields
  
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // ... other fields
});
```

**Field Description**:
- `blockedUsers`: Array of User ObjectIds representing blocked accounts
- References the User model for population
- Default: Empty array

#### Model Methods

**1. blockUser(userIdToBlock)**

**Purpose**: Block a user and clean up relationships

**Implementation**:
```javascript
userSchema.methods.blockUser = async function(userIdToBlock) {
  if (!this.blockedUsers.includes(userIdToBlock)) {
    this.blockedUsers.push(userIdToBlock);
    
    // Also remove from followers/following if exists
    this.followers = this.followers.filter(id => id.toString() !== userIdToBlock.toString());
    this.following = this.following.filter(id => id.toString() !== userIdToBlock.toString());
    
    return this.save();
  }
  return this;
};
```

**Parameters**:
- `userIdToBlock` (String/ObjectId): ID of user to block

**Returns**: Updated user document

**Side Effects**:
- Adds user to blockedUsers array
- Removes user from followers array
- Removes user from following array

---

**2. unblockUser(userIdToUnblock)**

**Purpose**: Remove a user from the blocked list

**Implementation**:
```javascript
userSchema.methods.unblockUser = async function(userIdToUnblock) {
  this.blockedUsers = this.blockedUsers.filter(id => id.toString() !== userIdToUnblock.toString());
  return this.save();
};
```

**Parameters**:
- `userIdToUnblock` (String/ObjectId): ID of user to unblock

**Returns**: Updated user document

---

**3. isUserBlocked(userId)**

**Purpose**: Check if a specific user is blocked

**Implementation**:
```javascript
userSchema.methods.isUserBlocked = function(userId) {
  return this.blockedUsers.some(id => id.toString() === userId.toString());
};
```

**Parameters**:
- `userId` (String/ObjectId): ID of user to check

**Returns**: Boolean indicating block status

---

### Mock Database Implementation

**Location**: `backend/mockdb/userDB.js`

#### blockUser(userId, userIdToBlock)

```javascript
const blockUser = (userId, userIdToBlock) => {
  const users = readUsers();
  const userIndex = users.findIndex(user => user._id === userId);
  
  if (userIndex === -1) {
    return null;
  }
  
  // Initialize blockedUsers array if it doesn't exist
  if (!users[userIndex].blockedUsers) {
    users[userIndex].blockedUsers = [];
  }
  
  // Add to blocked list if not already blocked
  if (!users[userIndex].blockedUsers.includes(userIdToBlock)) {
    users[userIndex].blockedUsers.push(userIdToBlock);
    
    // Remove from followers/following if exists
    if (users[userIndex].followers) {
      users[userIndex].followers = users[userIndex].followers.filter(id => id !== userIdToBlock);
    }
    if (users[userIndex].following) {
      users[userIndex].following = users[userIndex].following.filter(id => id !== userIdToBlock);
    }
    
    users[userIndex].updatedAt = new Date().toISOString();
    writeUsers(users);
  }
  
  return users[userIndex];
};
```

#### unblockUser(userId, userIdToUnblock)

```javascript
const unblockUser = (userId, userIdToUnblock) => {
  const users = readUsers();
  const userIndex = users.findIndex(user => user._id === userId);
  
  if (userIndex === -1) {
    return null;
  }
  
  // Initialize blockedUsers array if it doesn't exist
  if (!users[userIndex].blockedUsers) {
    users[userIndex].blockedUsers = [];
  }
  
  // Remove from blocked list
  users[userIndex].blockedUsers = users[userIndex].blockedUsers.filter(id => id !== userIdToUnblock);
  users[userIndex].updatedAt = new Date().toISOString();
  
  writeUsers(users);
  
  return users[userIndex];
};
```

#### isUserBlocked(userId, targetUserId)

```javascript
const isUserBlocked = (userId, targetUserId) => {
  const user = findById(userId);
  
  if (!user || !user.blockedUsers) {
    return false;
  }
  
  return user.blockedUsers.includes(targetUserId);
};
```

---

### Route Handlers

**Location**: `backend/routes/users.js`

#### GET /api/users/blocked

**Purpose**: Get list of blocked users with their profile information

**Authentication**: Required (JWT Token)

**Implementation**:
```javascript
router.get('/blocked', verifyToken, async (req, res, next) => {
  try {
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    let blockedUsers = [];

    if (useMongoDB) {
      const user = await UserMongo.findById(req.userId)
        .populate('blockedUsers', 'username email profilePicture firstName lastName')
        .select('blockedUsers');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      blockedUsers = user.blockedUsers || [];
    } else {
      const user = UserMock.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      // Get blocked users details
      if (user.blockedUsers && user.blockedUsers.length > 0) {
        blockedUsers = user.blockedUsers.map(userId => {
          const blockedUser = UserMock.findById(userId);
          if (blockedUser) {
            return {
              _id: blockedUser._id,
              username: blockedUser.username,
              email: blockedUser.email,
              profilePicture: blockedUser.profilePicture,
              firstName: blockedUser.firstName,
              lastName: blockedUser.lastName
            };
          }
          return null;
        }).filter(user => user !== null);
      }
    }

    res.json({
      success: true,
      data: blockedUsers,
      message: 'Blocked users retrieved successfully'
    });
  } catch (error) {
    console.error('Get blocked users error:', error);
    next(error);
  }
});
```

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "user123",
      "username": "johndoe",
      "email": "john@example.com",
      "profilePicture": "https://example.com/pic.jpg",
      "firstName": "John",
      "lastName": "Doe"
    }
  ],
  "message": "Blocked users retrieved successfully"
}
```

**Error Responses**:
- `401`: Unauthorized (No or invalid token)
- `404`: User not found
- `500`: Server error

---

#### POST /api/users/:userId/block

**Purpose**: Block a specific user

**Authentication**: Required (JWT Token)

**Parameters**:
- `userId` (URL param): ID of user to block

**Validation**:
- Cannot block yourself
- Target user must exist

**Implementation**:
```javascript
router.post('/:userId/block', verifyToken, async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate: Cannot block yourself
    if (userId === req.userId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'You cannot block yourself'
      });
    }

    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    if (useMongoDB) {
      // Check if target user exists
      const targetUser = await UserMongo.findById(userId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      // Get current user and block the target user
      const currentUser = await UserMongo.findById(req.userId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Current user not found'
        });
      }

      await currentUser.blockUser(userId);

      // Also remove current user from target user's followers/following
      await UserMongo.findByIdAndUpdate(userId, {
        $pull: {
          followers: req.userId,
          following: req.userId
        }
      });

      res.json({
        success: true,
        data: null,
        message: 'User blocked successfully'
      });
    } else {
      // Mock DB implementation
      const targetUser = UserMock.findById(userId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      const result = UserMock.blockUser(req.userId, userId);
      if (!result) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Failed to block user'
        });
      }

      // Also remove current user from target user's followers/following
      const targetUserData = UserMock.findById(userId);
      if (targetUserData.followers) {
        targetUserData.followers = targetUserData.followers.filter(id => id !== req.userId);
      }
      if (targetUserData.following) {
        targetUserData.following = targetUserData.following.filter(id => id !== req.userId);
      }
      UserMock.updateOne({ _id: userId }, targetUserData);

      res.json({
        success: true,
        data: null,
        message: 'User blocked successfully'
      });
    }
  } catch (error) {
    console.error('Block user error:', error);
    next(error);
  }
});
```

**Response Format**:
```json
{
  "success": true,
  "data": null,
  "message": "User blocked successfully"
}
```

**Error Responses**:
- `400`: Bad Request (Attempting to block self)
- `401`: Unauthorized
- `404`: User not found
- `500`: Server error

---

#### DELETE /api/users/:userId/block

**Purpose**: Unblock a previously blocked user

**Authentication**: Required (JWT Token)

**Parameters**:
- `userId` (URL param): ID of user to unblock

**Implementation**:
```javascript
router.delete('/:userId/block', verifyToken, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    if (useMongoDB) {
      const currentUser = await UserMongo.findById(req.userId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Current user not found'
        });
      }

      await currentUser.unblockUser(userId);

      res.json({
        success: true,
        data: null,
        message: 'User unblocked successfully'
      });
    } else {
      const result = UserMock.unblockUser(req.userId, userId);
      if (!result) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Failed to unblock user'
        });
      }

      res.json({
        success: true,
        data: null,
        message: 'User unblocked successfully'
      });
    }
  } catch (error) {
    console.error('Unblock user error:', error);
    next(error);
  }
});
```

**Response Format**:
```json
{
  "success": true,
  "data": null,
  "message": "User unblocked successfully"
}
```

**Error Responses**:
- `401`: Unauthorized
- `404`: User not found
- `500`: Server error

---

#### GET /api/users/:userId/is-blocked

**Purpose**: Check if a specific user is blocked

**Authentication**: Required (JWT Token)

**Parameters**:
- `userId` (URL param): ID of user to check

**Implementation**:
```javascript
router.get('/:userId/is-blocked', verifyToken, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    let isBlocked = false;

    if (useMongoDB) {
      const currentUser = await UserMongo.findById(req.userId).select('blockedUsers');
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      isBlocked = currentUser.isUserBlocked(userId);
    } else {
      isBlocked = UserMock.isUserBlocked(req.userId, userId);
    }

    res.json({
      success: true,
      data: { isBlocked },
      message: isBlocked ? 'User is blocked' : 'User is not blocked'
    });
  } catch (error) {
    console.error('Check if user is blocked error:', error);
    next(error);
  }
});
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "isBlocked": true
  },
  "message": "User is blocked"
}
```

**Error Responses**:
- `401`: Unauthorized
- `404`: User not found
- `500`: Server error

---

## Frontend Implementation

### File Structure
```
frontend/
├── src/
│   ├── components/
│   │   └── BlockedUsersModal.jsx
│   ├── pages/
│   │   └── Settings.jsx
│   └── api/
│       └── endpoints.js
```

### Component: BlockedUsersModal

**Location**: `frontend/src/components/BlockedUsersModal.jsx`

**Purpose**: Display and manage blocked users in a modal dialog

**Props**:
- `isOpen` (Boolean): Controls modal visibility
- `onClose` (Function): Callback to close the modal

**State Management**:
```javascript
const [blockedUsers, setBlockedUsers] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [unblockingUserId, setUnblockingUserId] = useState(null);
```

**Key Functions**:

1. **fetchBlockedUsers()**: Load blocked users from backend
```javascript
const fetchBlockedUsers = async () => {
  setLoading(true);
  setError("");
  try {
    const response = await usersApi.getBlockedUsers();
    if (response.data.success) {
      setBlockedUsers(response.data.data);
    }
  } catch (err) {
    console.error("Failed to fetch blocked users:", err);
    setError("Failed to load blocked users");
  } finally {
    setLoading(false);
  }
};
```

2. **handleUnblock()**: Unblock a user
```javascript
const handleUnblock = async (userId) => {
  setUnblockingUserId(userId);
  setError("");
  try {
    const response = await usersApi.unblockUser(userId);
    if (response.data.success) {
      // Remove from local state
      setBlockedUsers((prev) => prev.filter((user) => user._id !== userId));
    }
  } catch (err) {
    console.error("Failed to unblock user:", err);
    setError("Failed to unblock user. Please try again.");
  } finally {
    setUnblockingUserId(null);
  }
};
```

**UI Elements**:
- Modal overlay with backdrop blur
- Close button (X icon)
- Header with title and description
- Loading spinner during fetch
- Empty state when no users are blocked
- User cards with:
  - Profile picture or initial avatar
  - Full name (if available) or username
  - Username with @ prefix
  - Unblock button
- Error message display (red banner)
- Close button at bottom

**Visual States**:

1. **Loading State**
   - Displays centered spinner
   - Prevents interaction

2. **Empty State**
   - Shows 🚫 emoji
   - "No blocked users" message
   - Friendly subtitle

3. **Error State**
   - Red banner with error message
   - User can retry or close

4. **Unblocking State**
   - Button shows "Unblocking..."
   - Button disabled during operation
   - Specific to each user

---

### API Integration

**Location**: `frontend/src/api/endpoints.js`

**New Methods Added to usersApi**:

```javascript
export const usersApi = {
  // ... existing methods
  
  getBlockedUsers: () => 
    apiClient.get('/users/blocked'),
  
  blockUser: (userId) => 
    apiClient.post(`/users/${userId}/block`),
  
  unblockUser: (userId) => 
    apiClient.delete(`/users/${userId}/block`),
  
  isUserBlocked: (userId) => 
    apiClient.get(`/users/${userId}/is-blocked`),
};
```

**Usage Examples**:

```javascript
// Get blocked users
const response = await usersApi.getBlockedUsers();
const blockedUsers = response.data.data;

// Block a user
await usersApi.blockUser('user123');

// Unblock a user
await usersApi.unblockUser('user123');

// Check if user is blocked
const { data } = await usersApi.isUserBlocked('user123');
const isBlocked = data.data.isBlocked;
```

---

### Settings Page Integration

**Location**: `frontend/src/pages/Settings.jsx`

**Changes Made**:

1. **Import Statement**:
```javascript
import BlockedUsersModal from "../components/BlockedUsersModal";
```

2. **State Management**:
```javascript
const [showBlockedUsers, setShowBlockedUsers] = useState(false);
```

3. **Menu Item**:
```javascript
{
  icon: "🚫",
  label: "Blocked Users",
  description: "Manage blocked accounts",
  type: "link",
  onClick: () => setShowBlockedUsers(true),
}
```

4. **Modal Component**:
```javascript
<BlockedUsersModal
  isOpen={showBlockedUsers}
  onClose={() => setShowBlockedUsers(false)}
/>
```

---

## API Reference

### Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/blocked` | Required | Get list of blocked users |
| POST | `/api/users/:userId/block` | Required | Block a specific user |
| DELETE | `/api/users/:userId/block` | Required | Unblock a specific user |
| GET | `/api/users/:userId/is-blocked` | Required | Check if user is blocked |

### Detailed API Specifications

#### GET /api/users/blocked

**Description**: Retrieves list of all blocked users with profile information

**Authentication**: JWT Token (Bearer)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**: None

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "user123",
      "username": "johndoe",
      "email": "john@example.com",
      "profilePicture": "https://example.com/pic.jpg",
      "firstName": "John",
      "lastName": "Doe"
    },
    {
      "_id": "user456",
      "username": "janedoe",
      "email": "jane@example.com",
      "profilePicture": null,
      "firstName": "Jane",
      "lastName": "Doe"
    }
  ],
  "message": "Blocked users retrieved successfully"
}
```

**Error Responses**:

```json
// 401 Unauthorized
{
  "success": false,
  "data": null,
  "message": "Access denied. No token provided."
}

// 404 Not Found
{
  "success": false,
  "data": null,
  "message": "User not found"
}

// 500 Internal Server Error
{
  "success": false,
  "data": null,
  "message": "Server error"
}
```

---

#### POST /api/users/:userId/block

**Description**: Block a specific user

**Authentication**: JWT Token (Bearer)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `userId` (required): ID of user to block

**Request Body**: None

**Response**: 200 OK
```json
{
  "success": true,
  "data": null,
  "message": "User blocked successfully"
}
```

**Error Responses**:

```json
// 400 Bad Request (Self-block attempt)
{
  "success": false,
  "data": null,
  "message": "You cannot block yourself"
}

// 401 Unauthorized
{
  "success": false,
  "data": null,
  "message": "Access denied. No token provided."
}

// 404 Not Found
{
  "success": false,
  "data": null,
  "message": "User not found"
}

// 500 Internal Server Error
{
  "success": false,
  "data": null,
  "message": "Server error"
}
```

---

#### DELETE /api/users/:userId/block

**Description**: Unblock a previously blocked user

**Authentication**: JWT Token (Bearer)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `userId` (required): ID of user to unblock

**Request Body**: None

**Response**: 200 OK
```json
{
  "success": true,
  "data": null,
  "message": "User unblocked successfully"
}
```

**Error Responses**:

```json
// 401 Unauthorized
{
  "success": false,
  "data": null,
  "message": "Access denied. No token provided."
}

// 404 Not Found
{
  "success": false,
  "data": null,
  "message": "Failed to unblock user"
}

// 500 Internal Server Error
{
  "success": false,
  "data": null,
  "message": "Server error"
}
```

---

#### GET /api/users/:userId/is-blocked

**Description**: Check if a specific user is blocked

**Authentication**: JWT Token (Bearer)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `userId` (required): ID of user to check

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "isBlocked": true
  },
  "message": "User is blocked"
}
```

**Error Responses**:

```json
// 401 Unauthorized
{
  "success": false,
  "data": null,
  "message": "Access denied. No token provided."
}

// 404 Not Found
{
  "success": false,
  "data": null,
  "message": "User not found"
}

// 500 Internal Server Error
{
  "success": false,
  "data": null,
  "message": "Server error"
}
```

---

## Database Schema

### User Collection

The `blockedUsers` array is embedded within the User document:

```javascript
{
  _id: ObjectId("..."),
  username: "johndoe",
  email: "john@example.com",
  // ... other user fields
  
  followers: [
    ObjectId("user456"),
    ObjectId("user789")
  ],
  following: [
    ObjectId("user123"),
    ObjectId("user456")
  ],
  blockedUsers: [
    ObjectId("user999"),  // Blocked user IDs
    ObjectId("user888")
  ],
  
  createdAt: ISODate("2026-01-01T00:00:00.000Z"),
  updatedAt: ISODate("2026-01-11T00:00:00.000Z")
}
```

### Field Constraints

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| blockedUsers | Array of ObjectId | No | [] | Array of blocked user IDs |

### Indexes

**Recommended Indexes**:
```javascript
// Index for efficient blocked user lookups
db.users.createIndex({ "blockedUsers": 1 });

// Compound index for common queries
db.users.createIndex({ "_id": 1, "blockedUsers": 1 });
```

### Relationships

When a user blocks another user:
1. Target user ID added to `blockedUsers` array
2. Target user removed from `followers` array (if present)
3. Target user removed from `following` array (if present)
4. Current user removed from target user's `followers` array
5. Current user removed from target user's `following` array

---

## User Interface

### Settings Page Entry Point

The blocked users feature is accessed from the Settings page under "Privacy & Safety":

```
Settings Page
  └── Privacy & Safety Section
       ├── Post Privacy (Select)
       ├── Story Privacy (Select)
       ├── Blocked Users (Link) ← Opens modal
       └── Who can see your profile (Link)
```

### Modal Interface

**Components**:

1. **Header**
   - Title: "Blocked Users"
   - Description: "Manage accounts you have blocked"
   - Close button (X)

2. **User List** (when users exist)
   - User cards with:
     - Profile picture (or avatar with initial)
     - Full name
     - Username (@username)
     - Unblock button

3. **Empty State** (when no blocked users)
   - 🚫 Emoji icon
   - "No blocked users" message
   - "You haven't blocked anyone yet" subtitle

4. **Footer**
   - Close button

### Visual States

1. **Loading State**
   - Centered spinner animation
   - Gray color scheme
   - "Loading..." implied

2. **Populated State**
   - Scrollable list of user cards
   - Hover effects on cards
   - Active unblock buttons

3. **Empty State**
   - Centered content
   - Large emoji
   - Muted text colors

4. **Error State**
   - Red error banner at top
   - Error message text
   - List still visible (if previously loaded)

5. **Unblocking State**
   - Specific button shows "Unblocking..."
   - Button disabled
   - Other buttons remain active

### Responsive Design

- **Desktop**: Modal 672px max width, centered
- **Tablet**: Modal adapts to smaller width
- **Mobile**: Modal fills most of viewport with margins
- **Height**: Max 90vh with scroll for overflow

### Dark Mode Support

All UI elements support dark mode:
- Background: `bg-white dark:bg-gray-800`
- Text: `text-gray-900 dark:text-white`
- Borders: `border-gray-200 dark:border-gray-700`
- Hover: `hover:bg-gray-50 dark:hover:bg-gray-700/50`
- Buttons: `bg-blue-600 hover:bg-blue-700`

---

## User Flow

### Viewing Blocked Users

```
1. User navigates to Settings page
2. User scrolls to "Privacy & Safety" section
3. User clicks "Blocked Users"
4. Modal opens with loading spinner
5. API fetches blocked users list
6. List populates with user cards
7. User can scroll through list
8. User can unblock or close modal
```

### Blocking a User (from profile)

```
1. User visits another user's profile
2. User clicks "Block User" option
3. Confirmation dialog appears
4. User confirms block action
5. API call to block user
6. Success message displayed
7. User removed from followers/following
8. Profile UI updates (blocked state)
```

### Unblocking a User

```
1. User opens Blocked Users modal
2. User finds user to unblock
3. User clicks "Unblock" button
4. Button shows "Unblocking..."
5. API call to unblock user
6. User removed from local list
7. List updates immediately
8. Success (silent, via UI update)
```

---

## Security Considerations

### Authentication & Authorization

1. **JWT Verification**
   - All endpoints require valid JWT token
   - Token verified via `verifyToken` middleware
   - User ID extracted from token, not request body

2. **User Isolation**
   - Users can only manage their own blocked list
   - Cannot view other users' blocked lists
   - User ID from JWT determines ownership

3. **Action Validation**
   - Self-block prevention (400 error)
   - Target user existence validation
   - Idempotent operations (blocking already-blocked user is safe)

### Input Validation

1. **User ID Validation**
   - User IDs validated as valid MongoDB ObjectIds (or mock IDs)
   - Non-existent users return 404
   - Malformed IDs handled gracefully

2. **Data Integrity**
   - Blocked users array initialized if missing
   - Duplicate prevention on block
   - Clean removal on unblock

### Privacy Protection

1. **Block Status Privacy**
   - Blocked users don't know they're blocked
   - No notification sent on block/unblock
   - Only blocker can see their blocked list

2. **Relationship Cleanup**
   - Automatic removal from followers/following
   - Bi-directional relationship cleanup
   - Prevents interaction tracking

### Database Security

1. **Mongoose Protection**
   - Schema validation ensures array type
   - Population only returns safe fields
   - No password or sensitive data exposed

2. **Query Protection**
   - Uses authenticated user ID only
   - No user-controlled query parameters in critical operations
   - Population limits fields returned

---

## Error Handling

### Backend Error Handling

**Common Errors**:

1. **Authentication Errors (401)**
```javascript
{
  success: false,
  data: null,
  message: 'Access denied. No token provided.'
}
```

2. **Validation Errors (400)**
```javascript
{
  success: false,
  data: null,
  message: 'You cannot block yourself'
}
```

3. **Not Found Errors (404)**
```javascript
{
  success: false,
  data: null,
  message: 'User not found'
}
```

4. **Server Errors (500)**
```javascript
{
  success: false,
  data: null,
  message: 'Server error'
}
```

### Frontend Error Handling

1. **Network Errors**
```javascript
try {
  const response = await usersApi.getBlockedUsers();
} catch (err) {
  setError("Failed to load blocked users");
}
```

2. **API Errors**
```javascript
if (response.data.success) {
  setBlockedUsers(response.data.data);
} else {
  setError(response.data.message);
}
```

3. **User Feedback**
- Display error messages in red banner
- Maintain list if previously loaded
- Allow retry without page reload

---

## Testing Guidelines

### Backend Testing

#### Unit Tests

1. **User Model Methods**
```javascript
describe('User Model - Block Methods', () => {
  it('should add user to blockedUsers array', async () => {
    const user = await User.findById(userId);
    await user.blockUser(targetUserId);
    
    expect(user.blockedUsers).toContain(targetUserId);
  });
  
  it('should remove user from followers when blocking', async () => {
    const user = await User.findById(userId);
    user.followers = [targetUserId];
    await user.blockUser(targetUserId);
    
    expect(user.followers).not.toContain(targetUserId);
  });
  
  it('should check if user is blocked correctly', () => {
    const user = new User({ blockedUsers: [targetUserId] });
    
    expect(user.isUserBlocked(targetUserId)).toBe(true);
    expect(user.isUserBlocked('otherId')).toBe(false);
  });
});
```

2. **Route Tests**
```javascript
describe('GET /api/users/blocked', () => {
  it('should return blocked users list for authenticated user', async () => {
    const response = await request(app)
      .get('/api/users/blocked')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  it('should return 401 for unauthenticated requests', async () => {
    const response = await request(app)
      .get('/api/users/blocked');
    
    expect(response.status).toBe(401);
  });
});

describe('POST /api/users/:userId/block', () => {
  it('should block user successfully', async () => {
    const response = await request(app)
      .post(`/api/users/${targetUserId}/block`)
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User blocked successfully');
  });
  
  it('should prevent self-blocking', async () => {
    const response = await request(app)
      .post(`/api/users/${currentUserId}/block`)
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('cannot block yourself');
  });
  
  it('should return 404 for non-existent user', async () => {
    const response = await request(app)
      .post('/api/users/invalidId/block')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(404);
  });
});
```

### Frontend Testing

#### Component Tests

1. **Modal Rendering**
```javascript
describe('BlockedUsersModal', () => {
  it('should render when isOpen is true', () => {
    render(<BlockedUsersModal isOpen={true} onClose={mockClose} />);
    expect(screen.getByText('Blocked Users')).toBeInTheDocument();
  });
  
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <BlockedUsersModal isOpen={false} onClose={mockClose} />
    );
    expect(container.firstChild).toBeNull();
  });
  
  it('should show loading state initially', () => {
    render(<BlockedUsersModal isOpen={true} onClose={mockClose} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

2. **Unblock Functionality**
```javascript
it('should unblock user when button clicked', async () => {
  const mockUnblock = jest.spyOn(usersApi, 'unblockUser')
    .mockResolvedValue({ data: { success: true } });
  
  const blockedUsers = [{ _id: '123', username: 'test' }];
  render(
    <BlockedUsersModal 
      isOpen={true} 
      onClose={mockClose}
      initialUsers={blockedUsers}
    />
  );
  
  const unblockButton = screen.getByText('Unblock');
  fireEvent.click(unblockButton);
  
  await waitFor(() => {
    expect(mockUnblock).toHaveBeenCalledWith('123');
  });
});
```

3. **Empty State**
```javascript
it('should show empty state when no blocked users', async () => {
  jest.spyOn(usersApi, 'getBlockedUsers')
    .mockResolvedValue({ data: { success: true, data: [] } });
  
  render(<BlockedUsersModal isOpen={true} onClose={mockClose} />);
  
  await waitFor(() => {
    expect(screen.getByText('No blocked users')).toBeInTheDocument();
  });
});
```

### Integration Tests

```javascript
describe('Blocked Users E2E', () => {
  it('should block and unblock user through UI', async () => {
    // Navigate to user profile
    await page.goto('/profile/testuser');
    
    // Block user
    await page.click('button:has-text("Block User")');
    await page.click('button:has-text("Confirm")');
    
    // Verify blocked
    await expect(page.locator('text=User blocked')).toBeVisible();
    
    // Navigate to settings
    await page.goto('/settings');
    await page.click('text=Blocked Users');
    
    // Verify user in blocked list
    await expect(page.locator('text=@testuser')).toBeVisible();
    
    // Unblock user
    await page.click('button:has-text("Unblock")');
    
    // Verify removed from list
    await expect(page.locator('text=@testuser')).not.toBeVisible();
  });
});
```

### Manual Testing Checklist

- [ ] Modal opens when clicking "Blocked Users"
- [ ] Loading state displays while fetching
- [ ] Blocked users list displays correctly
- [ ] Profile pictures display or show initials
- [ ] User names and usernames display correctly
- [ ] Unblock button works for each user
- [ ] User removed from list after unblocking
- [ ] Empty state shows when no blocked users
- [ ] Error handling works for network failures
- [ ] Close button closes modal
- [ ] Cannot block yourself (validation)
- [ ] Blocking removes from followers/following
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Responsive on mobile devices
- [ ] Responsive on tablets
- [ ] Keyboard navigation works
- [ ] Screen reader accessible

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Modal only renders when `isOpen={true}`
   - Blocked users fetched only when modal opens
   - Reduces initial page load

2. **Optimistic Updates**
   - Remove user from list immediately on unblock
   - Revert if API call fails
   - Improves perceived performance

3. **Pagination** (Future Enhancement)
   - Currently loads all blocked users
   - Consider pagination for users with many blocks
   - Implement virtual scrolling for large lists

4. **Caching**
   - Store blocked users in component state
   - Only refetch when modal reopens
   - Consider React Query for advanced caching

### Database Performance

1. **Query Optimization**
   - Use indexed `_id` field for user lookup
   - Selective field projection in population
   - Limit populated fields to necessary data only

2. **Index Strategy**
```javascript
// Recommended indexes
db.users.createIndex({ "blockedUsers": 1 });
db.users.createIndex({ "_id": 1, "blockedUsers": 1 });
```

3. **Update Efficiency**
   - Array operations use `$push` and `$pull`
   - Atomic updates prevent race conditions
   - Minimal document writes

### Network Performance

1. **Request Size**
   - Selective field population reduces payload
   - Only necessary user fields returned
   - Typical response: ~500 bytes per blocked user

2. **Response Optimization**
   - Gzip compression recommended
   - JSON response format
   - No unnecessary nested data

---

## Future Enhancements

### Short-term Improvements

1. **Bulk Operations**
   - Select multiple users to unblock
   - "Unblock All" option with confirmation
   - Batch API requests

2. **Search/Filter**
   - Search blocked users by username
   - Filter by date blocked
   - Sort by username or block date

3. **Block Reasons** (Optional)
   - Add optional reason when blocking
   - Store block timestamp
   - Display in blocked users list

4. **Block History**
   - Track when users were blocked/unblocked
   - Show block history in admin panel
   - Analytics on blocking patterns

5. **Confirmation Dialogs**
   - Confirm before blocking
   - Confirm before unblocking
   - Prevent accidental actions

### Long-term Enhancements

1. **Advanced Privacy Controls**
   - Soft block (hide from user but don't fully block)
   - Mute (hide content without blocking)
   - Restrict (limit what they can see)

2. **Content Filtering**
   - Block user's posts from feed
   - Hide user from search results
   - Remove user from suggestions

3. **Reporting Integration**
   - Option to report when blocking
   - Link blocks to moderation system
   - Track repeat offenders

4. **Block Suggestions**
   - Suggest blocking users who harass
   - AI-powered block recommendations
   - Warn about problematic accounts

5. **Import/Export**
   - Export blocked users list
   - Import blocked users from file
   - Sync blocks across devices

6. **Block Analytics**
   - Statistics on blocking behavior
   - Trends in blocks over time
   - Platform-wide blocking metrics

---

## Troubleshooting

### Common Issues

#### Issue: Blocked users list not loading

**Symptoms**: Modal shows loading state indefinitely

**Possible Causes**:
1. Network error
2. Invalid JWT token
3. Backend server down
4. Database connection issue

**Solutions**:
```javascript
// Check browser console for errors
console.error("Failed to fetch blocked users:", err);

// Verify token exists
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Present' : 'Missing');

// Test endpoint directly
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/users/blocked

// Check backend logs
// Look for database connection errors
```

---

#### Issue: Unblock button not working

**Symptoms**: Click "Unblock" but nothing happens

**Possible Causes**:
1. API error not displayed
2. Network timeout
3. User already unblocked
4. Permission issue

**Solutions**:
```javascript
// Check network tab in DevTools
// Look for DELETE request to /api/users/:userId/block

// Verify request payload
console.log('Unblocking user:', userId);

// Check response status
// Should be 200 with success message

// Verify user removed from state
console.log('Blocked users after unblock:', blockedUsers);
```

---

#### Issue: Cannot block a user

**Symptoms**: Block action fails with error

**Possible Causes**:
1. Attempting to block self
2. User already blocked
3. Target user doesn't exist
4. Network error

**Solutions**:
```javascript
// Check error message
// "You cannot block yourself" = self-block attempt

// Verify target user ID
console.log('Blocking user:', targetUserId);
console.log('Current user:', currentUserId);

// Check if already blocked
const { data } = await usersApi.isUserBlocked(targetUserId);
console.log('Already blocked?', data.isBlocked);
```

---

#### Issue: Empty state not showing

**Symptoms**: Blank modal when no blocked users

**Possible Causes**:
1. Conditional rendering issue
2. CSS hiding content
3. State not updating correctly

**Solutions**:
```javascript
// Check blockedUsers state
console.log('Blocked users:', blockedUsers);
console.log('Length:', blockedUsers.length);

// Verify conditional logic
{blockedUsers.length === 0 ? (
  <EmptyState />
) : (
  <UserList />
)}

// Check CSS for display issues
```

---

#### Issue: Profile pictures not displaying

**Symptoms**: Broken images or missing avatars

**Possible Causes**:
1. Invalid image URL
2. CORS issue
3. Image not uploaded
4. Fallback not working

**Solutions**:
```javascript
// Check profilePicture value
console.log('Profile picture:', user.profilePicture);

// Verify fallback logic
{user.profilePicture ? (
  <img src={user.profilePicture} alt={user.username} />
) : (
  <InitialAvatar>{user.firstName[0]}</InitialAvatar>
)}

// Test image URL directly
// Open in browser to verify accessibility
```

---

### Debug Mode

Add debugging to component:

```javascript
useEffect(() => {
  console.log('Blocked users state:', blockedUsers);
}, [blockedUsers]);

useEffect(() => {
  console.log('Loading:', loading, 'Error:', error);
}, [loading, error]);

useEffect(() => {
  console.log('Unblocking user ID:', unblockingUserId);
}, [unblockingUserId]);

useEffect(() => {
  if (isOpen) {
    console.log('Modal opened, fetching blocked users...');
  }
}, [isOpen]);
```

---

## Appendix

### Code Snippets

#### Block User from Profile Page

```javascript
const handleBlockUser = async (userId) => {
  if (window.confirm('Are you sure you want to block this user?')) {
    try {
      await usersApi.blockUser(userId);
      alert('User blocked successfully');
      // Update UI state
      setIsBlocked(true);
    } catch (error) {
      alert('Failed to block user');
    }
  }
};
```

#### Check Block Status on Page Load

```javascript
useEffect(() => {
  const checkBlockStatus = async () => {
    if (profileUserId) {
      try {
        const { data } = await usersApi.isUserBlocked(profileUserId);
        setIsBlocked(data.data.isBlocked);
      } catch (error) {
        console.error('Failed to check block status:', error);
      }
    }
  };
  
  checkBlockStatus();
}, [profileUserId]);
```

#### Middleware to Check if User is Blocked

```javascript
// Backend middleware
const checkIfBlocked = async (req, res, next) => {
  const { targetUserId } = req.params;
  
  const user = await User.findById(req.userId);
  if (user && user.isUserBlocked(targetUserId)) {
    return res.status(403).json({
      success: false,
      message: 'You have blocked this user'
    });
  }
  
  // Check if current user is blocked by target
  const targetUser = await User.findById(targetUserId);
  if (targetUser && targetUser.isUserBlocked(req.userId)) {
    return res.status(403).json({
      success: false,
      message: 'You are blocked by this user'
    });
  }
  
  next();
};
```

---

### Related Documentation

- [User Management](./USER_MANAGEMENT.md)
- [Privacy & Safety](./PRIVACY_SAFETY.md)
- [Notification Preferences](./NOTIFICATION_PREFERENCES.md)
- [API Reference](./API_REFERENCE.md)
- [User Model](./DATABASE_SCHEMA.md)

---

## Changelog

### Version 1.0.0 (January 11, 2026)
- Initial implementation
- GET, POST, DELETE endpoints for blocking/unblocking
- BlockedUsersModal component
- Integration with Settings page
- Support for MongoDB and Mock Database
- Automatic relationship cleanup
- Dark mode support
- Error handling and loading states

---

## Contributors

- Development Team
- UI/UX Design Team
- QA Testing Team

---

## License

This feature is part of the College Media platform and follows the project's licensing terms.

---

**Document Version**: 1.0.0  
**Last Updated**: January 11, 2026  
**Status**: Active  
**Maintainer**: Development Team
