# Notification Preferences Feature Documentation

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

The Notification Preferences feature allows users to customize their notification settings across the College Media platform. Users can control which types of notifications they receive through different channels (email and push notifications) and for different types of activities (likes, comments, follows).

### Key Features
- **Granular Control**: Users can toggle individual notification types on/off
- **Multi-Channel Support**: Separate controls for email and push notifications
- **Activity-Based Preferences**: Control notifications for likes, comments, and follows
- **Real-Time Updates**: Changes are saved immediately to the backend
- **Persistent Storage**: Preferences are stored in the database and persist across sessions
- **User-Friendly Interface**: Intuitive modal interface with toggle switches
- **Responsive Design**: Works seamlessly on all device sizes

### Technology Stack
- **Backend**: Node.js, Express.js, MongoDB/Mongoose, Mock Database
- **Frontend**: React, React Hooks (useState, useEffect)
- **API Communication**: Axios via centralized API client
- **Styling**: Tailwind CSS with dark mode support

---

## Feature Objectives

### Primary Goals
1. **User Control**: Give users complete control over their notification experience
2. **Reduce Noise**: Allow users to filter out unwanted notifications
3. **Channel Flexibility**: Enable users to choose their preferred notification channels
4. **Privacy**: Respect user preferences for communication
5. **Engagement**: Improve user engagement by allowing personalized notification settings

### Business Value
- **User Satisfaction**: Reduces notification fatigue and improves user experience
- **Retention**: Users are more likely to stay engaged when they control notifications
- **Compliance**: Aligns with best practices for user communication preferences
- **Flexibility**: Supports future expansion of notification types and channels

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
│       ├──> NotificationPreferencesModal Component            │
│       │         │                                             │
│       │         ├──> State Management (useState)             │
│       │         ├──> API Calls (useEffect)                   │
│       │         └──> UI Rendering (Toggle Switches)          │
│       │                                                       │
│       └──> API Endpoints Layer                               │
│                 │                                             │
│                 └──> accountApi.getNotificationPreferences() │
│                      accountApi.updateNotificationPreferences()│
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Layer                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Express Router (/api/account)                               │
│       │                                                       │
│       ├──> GET /notification-preferences                     │
│       │         │                                             │
│       │         ├──> JWT Verification                        │
│       │         ├──> User Lookup                             │
│       │         └──> Return Preferences                      │
│       │                                                       │
│       └──> PUT /notification-preferences                     │
│                 │                                             │
│                 ├──> JWT Verification                        │
│                 ├──> Validation                              │
│                 ├──> Update Database                         │
│                 └──> Return Updated Preferences              │
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
│       └──> notificationSettings {                            │
│                 email: Boolean                                │
│                 push: Boolean                                 │
│                 likes: Boolean                                │
│                 comments: Boolean                             │
│                 follows: Boolean                              │
│            }                                                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Fetching Preferences (GET)
```
User → Settings Page → Click "Notification Preferences" 
    → NotificationPreferencesModal Opens
    → useEffect Hook Triggers
    → accountApi.getNotificationPreferences()
    → GET /api/account/notification-preferences
    → JWT Verification
    → Database Query
    → Return Preferences
    → Update Component State
    → Render UI with Current Settings
```

#### Updating Preferences (PUT)
```
User → Toggle Switch
    → Update Local State
    → Click "Save Preferences"
    → accountApi.updateNotificationPreferences(preferences)
    → PUT /api/account/notification-preferences
    → JWT Verification
    → Validate Input
    → Update Database
    → Return Success Response
    → Display Success Message
    → Auto-dismiss after 3 seconds
```

---

## Backend Implementation

### File Structure
```
backend/
├── routes/
│   └── account.js                 # Notification preference routes
├── models/
│   └── User.js                    # User model with notificationSettings
└── mockdb/
    └── userDB.js                  # Mock database for development
```

### Route Handlers

#### GET /api/account/notification-preferences

**Purpose**: Retrieve the current user's notification preferences

**Authentication**: Required (JWT Token)

**Implementation**:
```javascript
router.get('/notification-preferences', verifyToken, async (req, res) => {
  try {
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    // Get user
    let user;
    if (useMongoDB) {
      user = await UserMongo.findById(req.userId).select('notificationSettings');
    } else {
      user = await UserMock.findById(req.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.notificationSettings || {
        email: true,
        push: true,
        likes: true,
        comments: true,
        follows: true
      },
      message: 'Notification preferences retrieved successfully'
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error retrieving notification preferences'
    });
  }
});
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "email": true,
    "push": true,
    "likes": true,
    "comments": false,
    "follows": true
  },
  "message": "Notification preferences retrieved successfully"
}
```

**Error Responses**:
- `401`: Unauthorized (No or invalid token)
- `404`: User not found
- `500`: Server error

---

#### PUT /api/account/notification-preferences

**Purpose**: Update the current user's notification preferences

**Authentication**: Required (JWT Token)

**Request Body**:
```json
{
  "email": true,
  "push": false,
  "likes": true,
  "comments": false,
  "follows": true
}
```

**Implementation**:
```javascript
router.put('/notification-preferences', verifyToken, async (req, res) => {
  try {
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    const { email, push, likes, comments, follows } = req.body;

    // Build the update object
    const notificationSettings = {};
    if (typeof email === 'boolean') notificationSettings.email = email;
    if (typeof push === 'boolean') notificationSettings.push = push;
    if (typeof likes === 'boolean') notificationSettings.likes = likes;
    if (typeof comments === 'boolean') notificationSettings.comments = comments;
    if (typeof follows === 'boolean') notificationSettings.follows = follows;

    // Update user
    let user;
    if (useMongoDB) {
      user = await UserMongo.findByIdAndUpdate(
        req.userId,
        { 
          $set: { 
            'notificationSettings.email': notificationSettings.email !== undefined ? notificationSettings.email : undefined,
            'notificationSettings.push': notificationSettings.push !== undefined ? notificationSettings.push : undefined,
            'notificationSettings.likes': notificationSettings.likes !== undefined ? notificationSettings.likes : undefined,
            'notificationSettings.comments': notificationSettings.comments !== undefined ? notificationSettings.comments : undefined,
            'notificationSettings.follows': notificationSettings.follows !== undefined ? notificationSettings.follows : undefined
          }
        },
        { new: true }
      ).select('notificationSettings');
    } else {
      user = await UserMock.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }
      
      // Initialize notificationSettings if it doesn't exist
      if (!user.notificationSettings) {
        user.notificationSettings = {
          email: true,
          push: true,
          likes: true,
          comments: true,
          follows: true
        };
      }

      // Update notification settings
      Object.keys(notificationSettings).forEach(key => {
        user.notificationSettings[key] = notificationSettings[key];
      });

      await UserMock.updateOne(req.userId, user);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: useMongoDB ? user.notificationSettings : user.notificationSettings,
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error updating notification preferences'
    });
  }
});
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "email": true,
    "push": false,
    "likes": true,
    "comments": false,
    "follows": true
  },
  "message": "Notification preferences updated successfully"
}
```

**Error Responses**:
- `401`: Unauthorized (No or invalid token)
- `404`: User not found
- `500`: Server error

---

### Database Schema Integration

The notification preferences are stored within the User model:

```javascript
// User Schema (models/User.js)
const userSchema = new mongoose.Schema({
  // ... other fields
  
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    likes: {
      type: Boolean,
      default: true
    },
    comments: {
      type: Boolean,
      default: true
    },
    follows: {
      type: Boolean,
      default: true
    }
  },
  
  // ... other fields
}, {
  timestamps: true
});
```

**Field Descriptions**:
- `email`: Controls whether user receives email notifications
- `push`: Controls whether user receives push/browser notifications
- `likes`: Controls notifications when posts are liked
- `comments`: Controls notifications when posts receive comments
- `follows`: Controls notifications when gaining new followers

**Default Values**: All notification types are enabled by default (`true`)

---

## Frontend Implementation

### File Structure
```
frontend/
├── src/
│   ├── components/
│   │   └── NotificationPreferencesModal.jsx
│   ├── pages/
│   │   └── Settings.jsx
│   └── api/
│       └── endpoints.js
```

### Component: NotificationPreferencesModal

**Location**: `frontend/src/components/NotificationPreferencesModal.jsx`

**Purpose**: Display and manage notification preferences in a modal dialog

**Props**:
- `isOpen` (Boolean): Controls modal visibility
- `onClose` (Function): Callback to close the modal

**State Management**:
```javascript
const [preferences, setPreferences] = useState({
  email: true,
  push: true,
  likes: true,
  comments: true,
  follows: true,
});
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [successMessage, setSuccessMessage] = useState("");
```

**Key Functions**:

1. **fetchPreferences()**: Load current preferences from backend
```javascript
const fetchPreferences = async () => {
  setLoading(true);
  setError("");
  try {
    const response = await accountApi.getNotificationPreferences();
    if (response.data.success) {
      setPreferences(response.data.data);
    }
  } catch (err) {
    console.error("Failed to fetch notification preferences:", err);
    setError("Failed to load preferences");
  } finally {
    setLoading(false);
  }
};
```

2. **handleToggle()**: Toggle individual preference
```javascript
const handleToggle = (key) => {
  setPreferences((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
  setSuccessMessage("");
};
```

3. **handleSave()**: Save preferences to backend
```javascript
const handleSave = async () => {
  setSaving(true);
  setError("");
  setSuccessMessage("");
  try {
    const response = await accountApi.updateNotificationPreferences(preferences);
    if (response.data.success) {
      setSuccessMessage("Preferences saved successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  } catch (err) {
    console.error("Failed to update notification preferences:", err);
    setError("Failed to save preferences. Please try again.");
  } finally {
    setSaving(false);
  }
};
```

**UI Elements**:
- Modal overlay with backdrop blur
- Close button (X icon)
- Header with title and description
- Five toggle switches for different notification types
- Error message display (red)
- Success message display (green)
- Cancel and Save buttons

**Notification Options**:
```javascript
const notificationOptions = [
  {
    key: "email",
    icon: "📧",
    title: "Email Notifications",
    description: "Receive notifications via email",
  },
  {
    key: "push",
    icon: "🔔",
    title: "Push Notifications",
    description: "Receive push notifications in your browser",
  },
  {
    key: "likes",
    icon: "❤️",
    title: "Likes",
    description: "Get notified when someone likes your posts",
  },
  {
    key: "comments",
    icon: "💬",
    title: "Comments",
    description: "Get notified when someone comments on your posts",
  },
  {
    key: "follows",
    icon: "👥",
    title: "New Followers",
    description: "Get notified when someone follows you",
  },
];
```

---

### API Integration

**Location**: `frontend/src/api/endpoints.js`

**New Methods Added to accountApi**:

```javascript
export const accountApi = {
  // ... existing methods
  
  getNotificationPreferences: () => 
    apiClient.get('/account/notification-preferences'),
  
  updateNotificationPreferences: (data) => 
    apiClient.put('/account/notification-preferences', data),
};
```

**Usage Example**:
```javascript
// Get preferences
const response = await accountApi.getNotificationPreferences();
const preferences = response.data.data;

// Update preferences
const updatedData = {
  email: true,
  push: false,
  likes: true,
  comments: false,
  follows: true
};
const response = await accountApi.updateNotificationPreferences(updatedData);
```

---

### Settings Page Integration

**Location**: `frontend/src/pages/Settings.jsx`

**Changes Made**:

1. **Import Statement**:
```javascript
import NotificationPreferencesModal from "../components/NotificationPreferencesModal";
```

2. **State Management**:
```javascript
const [showNotificationPreferences, setShowNotificationPreferences] = useState(false);
```

3. **Menu Item**:
```javascript
{
  icon: "📱",
  label: "Notification Preferences",
  description: "Customize what you get notified about",
  type: "link",
  onClick: () => setShowNotificationPreferences(true),
}
```

4. **Modal Component**:
```javascript
<NotificationPreferencesModal
  isOpen={showNotificationPreferences}
  onClose={() => setShowNotificationPreferences(false)}
/>
```

---

## API Reference

### Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/account/notification-preferences` | Required | Get user's notification preferences |
| PUT | `/api/account/notification-preferences` | Required | Update notification preferences |

### GET /api/account/notification-preferences

**Description**: Retrieves the authenticated user's notification preferences

**Authentication**: JWT Token (Bearer)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "email": true,
    "push": true,
    "likes": true,
    "comments": true,
    "follows": true
  },
  "message": "Notification preferences retrieved successfully"
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
  "message": "Error retrieving notification preferences"
}
```

---

### PUT /api/account/notification-preferences

**Description**: Updates the authenticated user's notification preferences

**Authentication**: JWT Token (Bearer)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": true,
  "push": false,
  "likes": true,
  "comments": false,
  "follows": true
}
```

**Note**: All fields are optional. Only included fields will be updated.

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "email": true,
    "push": false,
    "likes": true,
    "comments": false,
    "follows": true
  },
  "message": "Notification preferences updated successfully"
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
  "message": "Error updating notification preferences"
}
```

---

## Database Schema

### User Collection

The `notificationSettings` object is embedded within the User document:

```javascript
{
  _id: ObjectId("..."),
  username: "johndoe",
  email: "john@example.com",
  // ... other user fields
  
  notificationSettings: {
    email: true,      // Boolean - Email notifications enabled/disabled
    push: true,       // Boolean - Push notifications enabled/disabled
    likes: true,      // Boolean - Like notifications enabled/disabled
    comments: true,   // Boolean - Comment notifications enabled/disabled
    follows: true     // Boolean - Follow notifications enabled/disabled
  },
  
  createdAt: ISODate("2026-01-01T00:00:00.000Z"),
  updatedAt: ISODate("2026-01-11T00:00:00.000Z")
}
```

### Field Constraints

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| email | Boolean | No | true | Email notification toggle |
| push | Boolean | No | true | Push notification toggle |
| likes | Boolean | No | true | Like notification toggle |
| comments | Boolean | No | true | Comment notification toggle |
| follows | Boolean | No | true | Follow notification toggle |

### Indexes

No additional indexes required for notification settings as they're queried as part of the user document.

---

## User Interface

### Settings Page Entry Point

The notification preferences feature is accessed from the Settings page under the "Notifications" section:

```
Settings Page
  └── Notifications Section
       ├── Email Notifications (Toggle)
       ├── Push Notifications (Toggle)
       └── Notification Preferences (Link) ← Opens modal
```

### Modal Interface

**Components**:

1. **Header**
   - Title: "Notification Preferences"
   - Description: "Customize what you get notified about"
   - Close button (X)

2. **Preference List**
   - 5 preference items, each with:
     - Icon (emoji)
     - Title
     - Description
     - Toggle switch

3. **Footer**
   - Cancel button
   - Save Preferences button

### Visual States

1. **Loading State**
   - Displays spinner while fetching preferences
   - Disables interaction

2. **Error State**
   - Red banner with error message
   - "Failed to load preferences"
   - "Failed to save preferences"

3. **Success State**
   - Green banner with success message
   - "Preferences saved successfully!"
   - Auto-dismisses after 3 seconds

4. **Saving State**
   - Save button shows "Saving..."
   - Button disabled during save

### Responsive Design

- **Desktop**: Modal centered, max-width 2xl (672px)
- **Tablet**: Modal adapts to smaller width
- **Mobile**: Modal takes most of viewport width with margins

### Dark Mode Support

All UI elements support dark mode:
- Background: `bg-white dark:bg-gray-800`
- Text: `text-gray-900 dark:text-white`
- Borders: `border-gray-200 dark:border-gray-700`
- Toggle: `bg-blue-600` (active), `bg-gray-200 dark:bg-gray-600` (inactive)

---

## User Flow

### Opening Preferences

```
1. User navigates to Settings page
2. User scrolls to "Notifications" section
3. User clicks "Notification Preferences"
4. Modal opens with loading spinner
5. API fetches current preferences
6. Toggle switches populate with current values
7. User can interact with preferences
```

### Modifying Preferences

```
1. User toggles one or more preferences
2. Local state updates immediately (optimistic UI)
3. Toggle switches reflect new state
4. Changes are not saved yet (requires explicit save)
```

### Saving Preferences

```
1. User clicks "Save Preferences" button
2. Button changes to "Saving..." and disables
3. API call sends updated preferences to backend
4. Backend validates and updates database
5. Success response received
6. Green success banner appears
7. Button returns to normal state
8. Success message auto-dismisses after 3 seconds
9. User can continue editing or close modal
```

### Canceling Changes

```
1. User clicks "Cancel" button or X icon
2. Modal closes without saving
3. Changes are discarded
4. If user reopens modal, original values are fetched again
```

### Error Handling

```
1. If fetch fails:
   - Error message displayed
   - Preferences remain at default or previous values
   
2. If save fails:
   - Red error banner appears
   - User can retry saving
   - Previous valid state preserved
```

---

## Security Considerations

### Authentication & Authorization

1. **JWT Verification**
   - All endpoints require valid JWT token
   - Token verified via `verifyToken` middleware
   - User ID extracted from token, not request body

2. **User Isolation**
   - Users can only view/modify their own preferences
   - User ID from JWT determines whose preferences to fetch/update
   - No way to access another user's preferences

### Input Validation

1. **Type Checking**
   - All preference values validated as boolean
   - Non-boolean values ignored
   - Prevents injection attacks

2. **Partial Updates**
   - Only provided fields are updated
   - Missing fields don't overwrite existing values
   - Prevents accidental data loss

### Data Privacy

1. **No Sensitive Data**
   - Preferences contain no personally identifiable information
   - Safe to store and transmit

2. **HTTPS Required**
   - All API calls should use HTTPS in production
   - Prevents man-in-the-middle attacks

### Database Security

1. **Mongoose Protection**
   - Mongoose schema validation prevents invalid data
   - Default values ensure data integrity

2. **Query Protection**
   - Uses findById with authenticated user ID
   - No user-controlled query parameters

---

## Error Handling

### Backend Error Handling

**Common Errors**:

1. **Authentication Errors (401)**
```javascript
// No token provided
{
  success: false,
  data: null,
  message: 'Access denied. No token provided.'
}

// Invalid token
{
  success: false,
  data: null,
  message: 'Invalid token.'
}
```

2. **Not Found Errors (404)**
```javascript
{
  success: false,
  data: null,
  message: 'User not found'
}
```

3. **Server Errors (500)**
```javascript
{
  success: false,
  data: null,
  message: 'Error retrieving notification preferences'
}
// or
{
  success: false,
  data: null,
  message: 'Error updating notification preferences'
}
```

### Frontend Error Handling

1. **Network Errors**
```javascript
try {
  const response = await accountApi.getNotificationPreferences();
} catch (err) {
  // Handle network failure
  setError("Failed to load preferences");
}
```

2. **API Errors**
```javascript
if (response.data.success) {
  setPreferences(response.data.data);
} else {
  setError(response.data.message);
}
```

3. **User Feedback**
- Display error messages in red banner
- Provide actionable error messages
- Allow retry without page reload

---

## Testing Guidelines

### Backend Testing

#### Unit Tests

1. **GET Endpoint Tests**
```javascript
describe('GET /api/account/notification-preferences', () => {
  it('should return preferences for authenticated user', async () => {
    const response = await request(app)
      .get('/api/account/notification-preferences')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('email');
    expect(response.body.data).toHaveProperty('push');
  });
  
  it('should return 401 for unauthenticated requests', async () => {
    const response = await request(app)
      .get('/api/account/notification-preferences');
    
    expect(response.status).toBe(401);
  });
});
```

2. **PUT Endpoint Tests**
```javascript
describe('PUT /api/account/notification-preferences', () => {
  it('should update preferences for authenticated user', async () => {
    const updates = { email: false, push: true };
    const response = await request(app)
      .put('/api/account/notification-preferences')
      .set('Authorization', `Bearer ${validToken}`)
      .send(updates);
    
    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(false);
    expect(response.body.data.push).toBe(true);
  });
  
  it('should ignore non-boolean values', async () => {
    const updates = { email: 'invalid' };
    const response = await request(app)
      .put('/api/account/notification-preferences')
      .set('Authorization', `Bearer ${validToken}`)
      .send(updates);
    
    expect(response.status).toBe(200);
    // email should not be updated
  });
});
```

### Frontend Testing

#### Component Tests

1. **Modal Rendering**
```javascript
describe('NotificationPreferencesModal', () => {
  it('should render when isOpen is true', () => {
    render(<NotificationPreferencesModal isOpen={true} onClose={mockClose} />);
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
  });
  
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <NotificationPreferencesModal isOpen={false} onClose={mockClose} />
    );
    expect(container.firstChild).toBeNull();
  });
});
```

2. **Toggle Functionality**
```javascript
it('should toggle preference when clicked', () => {
  render(<NotificationPreferencesModal isOpen={true} onClose={mockClose} />);
  
  const emailToggle = screen.getByRole('switch', { name: /email/i });
  fireEvent.click(emailToggle);
  
  // Verify state changed
});
```

3. **Save Functionality**
```javascript
it('should save preferences when save button clicked', async () => {
  const mockUpdate = jest.spyOn(accountApi, 'updateNotificationPreferences');
  
  render(<NotificationPreferencesModal isOpen={true} onClose={mockClose} />);
  
  const saveButton = screen.getByText('Save Preferences');
  fireEvent.click(saveButton);
  
  await waitFor(() => {
    expect(mockUpdate).toHaveBeenCalled();
  });
});
```

### Integration Tests

1. **End-to-End Flow**
```javascript
describe('Notification Preferences E2E', () => {
  it('should fetch, modify, and save preferences', async () => {
    // Open settings page
    await page.goto('/settings');
    
    // Click notification preferences
    await page.click('text=Notification Preferences');
    
    // Wait for modal
    await page.waitForSelector('text=Customize what you get notified about');
    
    // Toggle email notifications
    await page.click('[aria-label="Email Notifications"]');
    
    // Save
    await page.click('text=Save Preferences');
    
    // Verify success message
    await page.waitForSelector('text=Preferences saved successfully!');
  });
});
```

### Manual Testing Checklist

- [ ] Modal opens when clicking "Notification Preferences"
- [ ] Loading state displays while fetching
- [ ] Current preferences load correctly
- [ ] Toggle switches respond to clicks
- [ ] Save button triggers API call
- [ ] Success message appears after save
- [ ] Success message auto-dismisses
- [ ] Error message appears on failure
- [ ] Cancel button closes modal without saving
- [ ] Close (X) button works
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Responsive on mobile devices
- [ ] Responsive on tablets
- [ ] Works with keyboard navigation
- [ ] Screen reader accessible

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Modal component only renders when `isOpen={true}`
   - Preferences only fetched when modal opens
   - Reduces initial page load

2. **Debouncing** (Future Enhancement)
   - Currently requires explicit save
   - Could implement auto-save with debounce

3. **Caching**
   - Preferences stored in component state
   - No re-fetch on toggle (only on save)
   - Reduces API calls

4. **Selective Updates**
   - Only sends changed fields to backend (can be implemented)
   - Reduces payload size

### Database Performance

1. **Query Optimization**
   - Uses indexed `_id` field for user lookup
   - Selective field projection (`.select('notificationSettings')`)
   - Embedded document (no joins required)

2. **Update Efficiency**
   - Direct field updates using `$set`
   - No full document replacement
   - Minimal write operations

### Network Performance

1. **Request Size**
   - Small JSON payload (~100 bytes)
   - Gzip compression recommended

2. **Response Caching**
   - Could implement cache headers for GET requests
   - Invalidate on PUT

---

## Future Enhancements

### Short-term Improvements

1. **Auto-Save**
   - Save preferences automatically on toggle
   - Implement debouncing (500ms delay)
   - Show "Saving..." indicator

2. **Notification Channels Expansion**
   - SMS notifications
   - In-app notifications
   - Slack/Discord webhooks

3. **Activity Type Expansion**
   - Post shares
   - Mentions
   - Direct messages
   - Friend requests

4. **Notification Preview**
   - Show sample notification for each type
   - Help users understand what they're toggling

5. **Batch Operations**
   - "Enable All" button
   - "Disable All" button
   - "Reset to Defaults" button

### Long-term Enhancements

1. **Granular Timing Controls**
   - Quiet hours (e.g., no notifications 10 PM - 8 AM)
   - Day-specific preferences
   - Frequency limits (max X notifications per hour)

2. **Smart Notifications**
   - AI-powered priority inbox
   - Aggregate similar notifications
   - Digest mode (daily/weekly summaries)

3. **Channel-Specific Settings**
   - Different preferences for email vs push
   - Per-activity-type channel preferences

4. **Notification Templates**
   - Presets: "Minimal", "Moderate", "All"
   - Custom templates
   - Template sharing

5. **Analytics**
   - Track notification engagement
   - Suggest optimal settings based on user behavior
   - A/B testing different notification strategies

6. **Multi-Device Management**
   - Per-device notification settings
   - Device prioritization
   - Cross-device notification sync

---

## Troubleshooting

### Common Issues

#### Issue: Preferences not loading

**Symptoms**: Modal shows loading state indefinitely

**Possible Causes**:
1. Network error
2. Invalid JWT token
3. Backend server down

**Solutions**:
```javascript
// Check browser console for error
console.error("Failed to fetch notification preferences:", err);

// Verify token exists
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Present' : 'Missing');

// Test endpoint directly
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/account/notification-preferences
```

---

#### Issue: Changes not saving

**Symptoms**: Click "Save" but preferences revert on reload

**Possible Causes**:
1. API error not displayed
2. Network timeout
3. Database write failure

**Solutions**:
```javascript
// Check network tab in DevTools
// Look for 200 response status

// Verify request payload
console.log('Saving preferences:', preferences);

// Check server logs
// Backend should log update attempts
```

---

#### Issue: Toggle switches not responding

**Symptoms**: Clicking toggle has no effect

**Possible Causes**:
1. JavaScript error
2. State update issue
3. Event handler not attached

**Solutions**:
```javascript
// Check browser console for errors
// Verify handleToggle is called
const handleToggle = (key) => {
  console.log('Toggling:', key);
  setPreferences((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
};
```

---

#### Issue: Success message doesn't appear

**Symptoms**: Save completes but no confirmation shown

**Possible Causes**:
1. Success message state not updating
2. CSS hiding the message
3. Auto-dismiss timing too fast

**Solutions**:
```javascript
// Extend auto-dismiss timeout
setTimeout(() => {
  setSuccessMessage("");
}, 5000); // Increased to 5 seconds

// Check CSS for display issues
// Verify green banner is visible
```

---

#### Issue: 401 Unauthorized error

**Symptoms**: API calls fail with 401 status

**Possible Causes**:
1. Expired JWT token
2. Missing Authorization header
3. Invalid token format

**Solutions**:
```javascript
// Check token expiration
const token = localStorage.getItem('token');
const decoded = jwt_decode(token);
console.log('Token expires:', new Date(decoded.exp * 1000));

// Verify header format
// Should be: "Bearer <token>"

// Try refreshing token or re-logging in
```

---

### Debug Mode

Add debugging to component:

```javascript
useEffect(() => {
  console.log('Preferences state:', preferences);
}, [preferences]);

useEffect(() => {
  console.log('Loading:', loading, 'Saving:', saving);
}, [loading, saving]);

useEffect(() => {
  console.log('Error:', error, 'Success:', successMessage);
}, [error, successMessage]);
```

---

## Appendix

### Code Snippets

#### Backend Route Registration

```javascript
// server.js or app.js
const accountRoutes = require('./routes/account');
app.use('/api/account', accountRoutes);
```

#### API Client Configuration

```javascript
// api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### Environment Variables

**Backend** (`.env`):
```
JWT_SECRET=your_secret_key_here
MONGODB_URI=mongodb://localhost:27017/college_media
PORT=5000
```

**Frontend** (`.env`):
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

### Related Documentation

- [Authentication System](./AUTHENTICATION.md)
- [Settings Feature](./FONT_SIZE_SETTINGS.md)
- [Account Deactivation](./DEACTIVATE_ACCOUNT.md)
- [API Reference](./API_REFERENCE.md)
- [User Model](./DATABASE_SCHEMA.md)

---

## Changelog

### Version 1.0.0 (January 11, 2026)
- Initial implementation
- GET and PUT endpoints for notification preferences
- NotificationPreferencesModal component
- Integration with Settings page
- Support for 5 notification types (email, push, likes, comments, follows)
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
