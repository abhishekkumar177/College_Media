# Profile Visibility Feature Documentation

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

The Profile Visibility feature allows users to control who can view their profile on the College Media platform. Users can choose from three visibility levels: Public, Followers Only, or Private. This feature provides granular privacy control and enhances user safety by limiting profile access based on user preferences.

### Key Features
- **Three Visibility Levels**: Public, Followers Only, Private
- **Instant Updates**: Auto-save on selection with optimistic UI updates
- **Visual Feedback**: Loading states, success messages, and error handling
- **Dark Mode Support**: Fully compatible with light and dark themes
- **Persistent Settings**: Stored in database and synced across sessions

### Technology Stack
- **Backend**: Node.js, Express.js, MongoDB/Mongoose, Mock Database
- **Frontend**: React, React Hooks (useState, useEffect)
- **API Communication**: Axios via centralized API client
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Component-level state with optimistic updates

---

## Feature Objectives

### Primary Goals
1. **Privacy Control**: Give users control over profile visibility
2. **User Safety**: Protect users from unwanted profile views
3. **Ease of Use**: Simple, intuitive interface for changing settings
4. **Real-time Updates**: Instant feedback without page reload
5. **Consistent Experience**: Sync settings across all devices

### Business Value
- **User Trust**: Users feel safer with privacy controls
- **Engagement**: Users more likely to share when they control visibility
- **Compliance**: Aligns with privacy best practices
- **Retention**: Privacy features increase user satisfaction
- **Platform Safety**: Reduces harassment and unwanted interactions

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
│       ├──> ProfileVisibilityModal Component                  │
│       │         │                                             │
│       │         ├──> State Management (useState)             │
│       │         │         - profileVisibility                │
│       │         │         - loading                          │
│       │         │         - savingOption                     │
│       │         │         - error/success messages           │
│       │         │                                             │
│       │         ├──> API Calls (useEffect)                   │
│       │         │         - fetchProfileVisibility()         │
│       │         │         - handleOptionSelect()             │
│       │         │                                             │
│       │         └──> UI Rendering                            │
│       │                   - Three option cards               │
│       │                   - Loading/Success/Error states     │
│       │                   - Optimistic updates               │
│       │                                                       │
│       └──> API Endpoints Layer                               │
│                 │                                             │
│                 ├──> accountApi.getProfileVisibility()       │
│                 └──> accountApi.updateProfileVisibility()    │
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
│       ├──> GET /profile-visibility                           │
│       │         │                                             │
│       │         ├──> JWT Verification                        │
│       │         ├──> User Lookup                             │
│       │         └──> Return Current Setting                  │
│       │                                                       │
│       └──> PUT /profile-visibility                           │
│                 │                                             │
│                 ├──> JWT Verification                        │
│                 ├──> Validate Input (public/followers/private)│
│                 ├──> Update User Document                    │
│                 └──> Return Success with New Setting         │
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
│       └──> profileVisibility: String                         │
│                 enum: ['public', 'followers', 'private']     │
│                 default: 'public'                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Viewing Current Setting (GET)
```
User → Settings Page → Click "Who can see your profile"
    → ProfileVisibilityModal Opens
    → useEffect Hook Triggers
    → accountApi.getProfileVisibility()
    → GET /api/account/profile-visibility
    → JWT Verification
    → Database Query
    → Return profileVisibility
    → Update Component State
    → Render Selected Option
```

#### Updating Setting (PUT)
```
User → Profile Visibility Modal → Click Option (e.g., "Private")
    → handleOptionSelect("private")
    → Optimistic UI Update (instant)
    → accountApi.updateProfileVisibility({ profileVisibility: "private" })
    → PUT /api/account/profile-visibility
    → JWT Verification
    → Validate Input
    → Update Database
    → Return Success
    → Show Success Message
    → (If Error: Revert UI to Previous State)
```

---

## Backend Implementation

### File Structure
```
backend/
├── models/
│   └── User.js                    # User model with profileVisibility field
└── routes/
    └── account.js                 # Profile visibility routes
```

### User Model Extensions

#### Schema Addition

**Location**: `backend/models/User.js`

```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields
  
  settings: {
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  profileVisibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  
  // ... other fields
});
```

**Field Description**:
- `profileVisibility`: String field with enum constraint
- Allowed values: `'public'`, `'followers'`, `'private'`
- Default: `'public'`
- Required: No (uses default)

**Validation**:
- Mongoose enforces enum constraint automatically
- Invalid values are rejected at database level
- Additional route-level validation for better error messages

---

### Route Handlers

**Location**: `backend/routes/account.js`

#### GET /api/account/profile-visibility

**Purpose**: Retrieve user's current profile visibility setting

**Authentication**: Required (JWT Token)

**Implementation**:
```javascript
router.get('/profile-visibility', verifyToken, async (req, res) => {
  try {
    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    let user;
    if (useMongoDB) {
      user = await UserMongo.findById(req.userId).select('profileVisibility');
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
      data: {
        profileVisibility: user.profileVisibility || 'public'
      },
      message: 'Profile visibility retrieved successfully'
    });
  } catch (error) {
    console.error('Get profile visibility error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error retrieving profile visibility'
    });
  }
});
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "profileVisibility": "public"
  },
  "message": "Profile visibility retrieved successfully"
}
```

**Error Responses**:
- `401`: Unauthorized (No or invalid token)
- `404`: User not found
- `500`: Server error

---

#### PUT /api/account/profile-visibility

**Purpose**: Update user's profile visibility setting

**Authentication**: Required (JWT Token)

**Request Body**:
```json
{
  "profileVisibility": "followers"
}
```

**Validation**:
- `profileVisibility` must be one of: `'public'`, `'followers'`, `'private'`
- Returns 400 error for invalid values

**Implementation**:
```javascript
router.put('/profile-visibility', verifyToken, async (req, res) => {
  try {
    const { profileVisibility } = req.body;

    // Validate profileVisibility value
    const validOptions = ['public', 'followers', 'private'];
    if (!profileVisibility || !validOptions.includes(profileVisibility)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Invalid profile visibility. Must be one of: ${validOptions.join(', ')}`
      });
    }

    const dbConnection = req.app.get('dbConnection');
    const useMongoDB = dbConnection?.useMongoDB;

    let user;
    if (useMongoDB) {
      user = await UserMongo.findByIdAndUpdate(
        req.userId,
        { profileVisibility },
        { new: true }
      ).select('profileVisibility');
    } else {
      user = await UserMock.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
      }

      user.profileVisibility = profileVisibility;
      user.updatedAt = new Date().toISOString();
      const updated = await UserMock.updateOne({ _id: req.userId }, user);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          data: null,
          message: 'Failed to update profile visibility'
        });
      }
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
      data: {
        profileVisibility: user.profileVisibility
      },
      message: 'Profile visibility updated successfully'
    });
  } catch (error) {
    console.error('Update profile visibility error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error updating profile visibility'
    });
  }
});
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "profileVisibility": "followers"
  },
  "message": "Profile visibility updated successfully"
}
```

**Error Responses**:
- `400`: Bad Request (Invalid visibility option)
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
│   │   └── ProfileVisibilityModal.jsx
│   ├── pages/
│   │   └── Settings.jsx
│   └── api/
│       └── endpoints.js
```

### Component: ProfileVisibilityModal

**Location**: `frontend/src/components/ProfileVisibilityModal.jsx`

**Purpose**: Modal dialog for selecting profile visibility

**Props**:
- `isOpen` (Boolean): Controls modal visibility
- `onClose` (Function): Callback to close the modal

**State Management**:
```javascript
const [profileVisibility, setProfileVisibility] = useState("public");
const [loading, setLoading] = useState(false);
const [savingOption, setSavingOption] = useState(null);
const [error, setError] = useState("");
const [successMessage, setSuccessMessage] = useState("");
```

**State Variables**:
- `profileVisibility`: Current selected option
- `loading`: True while fetching initial data
- `savingOption`: Which option is currently being saved (shows spinner)
- `error`: Error message to display
- `successMessage`: Success message after save

---

**Key Functions**:

1. **fetchProfileVisibility()**: Load current setting from backend

```javascript
const fetchProfileVisibility = async () => {
  setLoading(true);
  setError("");
  try {
    const response = await accountApi.getProfileVisibility();
    if (response.success) {
      setProfileVisibility(response.data.profileVisibility);
    }
  } catch (err) {
    console.error("Failed to fetch profile visibility:", err);
    setError("Failed to load profile visibility settings");
  } finally {
    setLoading(false);
  }
};
```

2. **handleOptionSelect()**: Save selected option with optimistic update

```javascript
const handleOptionSelect = async (newVisibility) => {
  if (newVisibility === profileVisibility || savingOption) return;
  
  const previousVisibility = profileVisibility;
  setSavingOption(newVisibility);
  setProfileVisibility(newVisibility); // Optimistic update
  setError("");
  setSuccessMessage("");
  
  try {
    const response = await accountApi.updateProfileVisibility({
      profileVisibility: newVisibility,
    });
    
    if (response && response.success) {
      setSuccessMessage("Profile visibility updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } else {
      // Revert on API error
      setProfileVisibility(previousVisibility);
      setError(response?.message || "Failed to update profile visibility.");
    }
  } catch (err) {
    console.error("Failed to update profile visibility:", err);
    // Revert on network error
    setProfileVisibility(previousVisibility);
    setError(err.message || "Failed to update profile visibility. Please try again.");
  } finally {
    setSavingOption(null);
  }
};
```

**Optimistic Updates**:
- UI updates immediately when option is clicked
- If API call fails, reverts to previous state
- Provides instant feedback while maintaining data integrity

---

**UI Elements**:
- **Header**: Title, description, close button
- **Option Cards** (3):
  - 🌍 Public - Anyone can view your profile
  - 👥 Followers Only - Only followers can view
  - 🔒 Private - Only you can view
- **Visual Indicators**:
  - Blue border and background for selected option
  - Checkmark icon for current selection
  - Spinner for option being saved
- **Messages**:
  - Success banner (green) - Shows for 3 seconds
  - Error banner (red) - Persists until dismissed
- **Privacy Note**: Info box explaining impact
- **Done Button**: Close modal

**Visual States**:

1. **Loading State** (Initial fetch)
   - Centered spinner
   - No option cards shown

2. **Idle State** (Ready for selection)
   - All options clickable
   - Current selection highlighted

3. **Saving State** (Updating)
   - Spinner on selected option
   - All options disabled

4. **Success State** (After save)
   - Green success message
   - New option highlighted
   - Auto-dismiss after 3s

5. **Error State** (Save failed)
   - Red error message
   - Reverted to previous selection
   - All options re-enabled

---

### API Integration

**Location**: `frontend/src/api/endpoints.js`

**New Methods Added to accountApi**:

```javascript
export const accountApi = {
  // ... existing methods
  
  getProfileVisibility: () => 
    apiClient.get('/account/profile-visibility'),
  
  updateProfileVisibility: (data) => 
    apiClient.put('/account/profile-visibility', data),
};
```

**API Client Behavior**:
- Automatically unwraps `response.data`
- Returns direct data object: `{ success, data, message }`
- Handles authentication headers
- Provides error transformation

**Usage Examples**:

```javascript
// Get current visibility
const response = await accountApi.getProfileVisibility();
const currentVisibility = response.data.profileVisibility;

// Update visibility
await accountApi.updateProfileVisibility({ 
  profileVisibility: 'followers' 
});
```

---

### Settings Page Integration

**Location**: `frontend/src/pages/Settings.jsx`

**Changes Made**:

1. **Import Statement**:
```javascript
import ProfileVisibilityModal from "../components/ProfileVisibilityModal";
```

2. **State Management**:
```javascript
const [showProfileVisibility, setShowProfileVisibility] = useState(false);
```

3. **Menu Item** (Privacy & Safety section):
```javascript
{
  icon: "👁️",
  label: "Who can see your profile",
  description: "Control profile visibility",
  type: "link",
  onClick: () => setShowProfileVisibility(true),
}
```

4. **Modal Component**:
```javascript
<ProfileVisibilityModal
  isOpen={showProfileVisibility}
  onClose={() => setShowProfileVisibility(false)}
/>
```

---

## API Reference

### Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/account/profile-visibility` | Required | Get current setting |
| PUT | `/api/account/profile-visibility` | Required | Update setting |

### Detailed API Specifications

#### GET /api/account/profile-visibility

**Description**: Retrieves user's current profile visibility setting

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
  "data": {
    "profileVisibility": "public"
  },
  "message": "Profile visibility retrieved successfully"
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
  "message": "Error retrieving profile visibility"
}
```

---

#### PUT /api/account/profile-visibility

**Description**: Updates user's profile visibility setting

**Authentication**: JWT Token (Bearer)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "profileVisibility": "followers"
}
```

**Validation Rules**:
- `profileVisibility` is required
- Must be one of: `"public"`, `"followers"`, `"private"`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "profileVisibility": "followers"
  },
  "message": "Profile visibility updated successfully"
}
```

**Error Responses**:

```json
// 400 Bad Request (Invalid value)
{
  "success": false,
  "data": null,
  "message": "Invalid profile visibility. Must be one of: public, followers, private"
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
  "message": "Error updating profile visibility"
}
```

---

## Database Schema

### User Collection

The `profileVisibility` field is embedded within the User document:

```javascript
{
  _id: ObjectId("..."),
  username: "johndoe",
  email: "john@example.com",
  // ... other user fields
  
  settings: {
    fontSize: "medium",
    theme: "auto"
  },
  profileVisibility: "public",  // New field
  
  createdAt: ISODate("2026-01-01T00:00:00.000Z"),
  updatedAt: ISODate("2026-01-11T00:00:00.000Z")
}
```

### Field Constraints

| Field | Type | Required | Default | Enum Values |
|-------|------|----------|---------|-------------|
| profileVisibility | String | No | 'public' | ['public', 'followers', 'private'] |

### Indexes

**Recommended Indexes**:
```javascript
// Index for filtering by visibility
db.users.createIndex({ "profileVisibility": 1 });

// Compound index for common queries
db.users.createIndex({ "_id": 1, "profileVisibility": 1 });
```

### Migration

For existing users without `profileVisibility` field:

```javascript
// MongoDB migration
db.users.updateMany(
  { profileVisibility: { $exists: false } },
  { $set: { profileVisibility: "public" } }
);
```

---

## User Interface

### Settings Page Entry Point

The profile visibility feature is accessed from the Settings page under "Privacy & Safety":

```
Settings Page
  └── Privacy & Safety Section
       ├── Post Privacy (Select)
       ├── Story Privacy (Select)
       ├── Blocked Users (Link)
       └── Who can see your profile (Link) ← Opens modal
```

### Modal Interface

**Components**:

1. **Header**
   - Title: "Profile Visibility"
   - Description: "Control who can see your profile"
   - Close button (X)

2. **Visibility Options** (3 cards)
   - **Public**
     - Icon: 🌍
     - Label: "Public"
     - Description: "Anyone can view your profile"
   - **Followers Only**
     - Icon: 👥
     - Label: "Followers Only"
     - Description: "Only your followers can view your profile"
   - **Private**
     - Icon: 🔒
     - Label: "Private"
     - Description: "Only you can view your profile"

3. **Privacy Note Box**
   - Info icon
   - Explanation of impact

4. **Footer**
   - "Done" button

### Visual States

1. **Loading State**
   - Centered spinner animation
   - Gray color scheme
   - "Loading..." implied

2. **Idle State** (Ready for selection)
   - All options clickable
   - Current selection has:
     - Blue border (`border-blue-600`)
     - Blue background (`bg-blue-50 dark:bg-blue-900/20`)
     - Checkmark icon
   - Other options have:
     - Gray border (`border-gray-200 dark:border-gray-700`)
     - Hover effect

3. **Saving State** (Option being saved)
   - Selected option shows spinner
   - All options disabled
   - No success/error messages yet

4. **Success State** (After save)
   - Green success banner
   - Message: "Profile visibility updated successfully!"
   - Auto-dismiss after 3 seconds
   - New option highlighted

5. **Error State** (Save failed)
   - Red error banner
   - Error message displayed
   - Reverted to previous selection
   - All options re-enabled

### Responsive Design

- **Desktop**: Modal 448px max width, centered
- **Tablet**: Modal adapts with padding
- **Mobile**: Modal fills width with 1rem margins
- **Height**: Max 90vh with scroll for overflow

### Dark Mode Support

All UI elements support dark mode:
- Background: `bg-white dark:bg-gray-800`
- Text: `text-gray-900 dark:text-white`
- Borders: `border-gray-200 dark:border-gray-700`
- Hover: `hover:bg-gray-50 dark:hover:bg-gray-700`
- Selected: `bg-blue-50 dark:bg-blue-900/20`

---

## User Flow

### Opening Modal

```
1. User navigates to Settings page
2. User scrolls to "Privacy & Safety" section
3. User clicks "Who can see your profile"
4. Modal opens with loading spinner
5. API fetches current setting
6. Current option is highlighted
```

### Changing Visibility

```
1. User clicks desired option (e.g., "Private")
2. UI updates immediately (optimistic)
3. Spinner appears on selected option
4. API call sent to backend
5. On Success:
   - Success message shown (green)
   - Spinner removed
   - Checkmark appears
   - Message auto-dismisses after 3s
6. On Error:
   - UI reverts to previous selection
   - Error message shown (red)
   - User can retry
```

### Closing Modal

```
1. User clicks "Done" button or X icon
2. Modal closes
3. Settings page remains
4. Setting is persisted
```

---

## Security Considerations

### Authentication & Authorization

1. **JWT Verification**
   - All endpoints require valid JWT token
   - Token verified via `verifyToken` middleware
   - User ID extracted from token, not request body

2. **User Isolation**
   - Users can only view/modify their own settings
   - Cannot view other users' visibility settings
   - User ID from JWT determines ownership

### Input Validation

1. **Enum Validation**
   - Server validates against allowed values
   - Rejects invalid options with 400 error
   - Mongoose schema provides additional validation

2. **Type Checking**
   - Ensures `profileVisibility` is a string
   - Checks for required field presence
   - Sanitizes input automatically

### Privacy Protection

1. **Setting Privacy**
   - Visibility setting itself is private
   - Only the user can see their setting
   - No public API to query other users' settings

2. **Data Integrity**
   - Updates are atomic
   - Default value ensures all users have a setting
   - Migration handles existing users

### Database Security

1. **Mongoose Protection**
   - Schema validation ensures enum compliance
   - Field-level encryption possible for sensitive data
   - No password or sensitive data exposed

2. **Query Protection**
   - Uses authenticated user ID only
   - No user-controlled query parameters
   - Prevents data leakage

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
  message: 'Invalid profile visibility. Must be one of: public, followers, private'
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
  message: 'Error updating profile visibility'
}
```

### Frontend Error Handling

1. **Network Errors**
```javascript
try {
  const response = await accountApi.getProfileVisibility();
} catch (err) {
  setError("Failed to load profile visibility settings");
}
```

2. **API Errors**
```javascript
if (response && response.success) {
  // Success
} else {
  setError(response?.message || "Failed to update profile visibility.");
}
```

3. **Optimistic Update Rollback**
```javascript
const previousVisibility = profileVisibility;
setProfileVisibility(newVisibility); // Optimistic

try {
  await api.update();
} catch {
  setProfileVisibility(previousVisibility); // Revert
}
```

4. **User Feedback**
- Display error messages in red banner
- Show success messages in green banner
- Clear messages automatically
- Allow manual dismissal

---

## Testing Guidelines

### Backend Testing

#### Unit Tests

1. **Route Tests**
```javascript
describe('GET /api/account/profile-visibility', () => {
  it('should return profile visibility for authenticated user', async () => {
    const response = await request(app)
      .get('/api/account/profile-visibility')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('profileVisibility');
  });
  
  it('should return 401 for unauthenticated requests', async () => {
    const response = await request(app)
      .get('/api/account/profile-visibility');
    
    expect(response.status).toBe(401);
  });
});

describe('PUT /api/account/profile-visibility', () => {
  it('should update profile visibility successfully', async () => {
    const response = await request(app)
      .put('/api/account/profile-visibility')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ profileVisibility: 'followers' });
    
    expect(response.status).toBe(200);
    expect(response.body.data.profileVisibility).toBe('followers');
  });
  
  it('should reject invalid visibility options', async () => {
    const response = await request(app)
      .put('/api/account/profile-visibility')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ profileVisibility: 'invalid' });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid profile visibility');
  });
});
```

### Frontend Testing

#### Component Tests

1. **Modal Rendering**
```javascript
describe('ProfileVisibilityModal', () => {
  it('should render when isOpen is true', () => {
    render(<ProfileVisibilityModal isOpen={true} onClose={mockClose} />);
    expect(screen.getByText('Profile Visibility')).toBeInTheDocument();
  });
  
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ProfileVisibilityModal isOpen={false} onClose={mockClose} />
    );
    expect(container.firstChild).toBeNull();
  });
  
  it('should show loading state initially', () => {
    render(<ProfileVisibilityModal isOpen={true} onClose={mockClose} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

2. **Option Selection**
```javascript
it('should update visibility when option clicked', async () => {
  const mockUpdate = jest.spyOn(accountApi, 'updateProfileVisibility')
    .mockResolvedValue({ success: true, data: { profileVisibility: 'private' } });
  
  render(<ProfileVisibilityModal isOpen={true} onClose={mockClose} />);
  
  await waitFor(() => {
    expect(screen.getByText('Private')).toBeInTheDocument();
  });
  
  fireEvent.click(screen.getByText('Private'));
  
  await waitFor(() => {
    expect(mockUpdate).toHaveBeenCalledWith({ profileVisibility: 'private' });
  });
});
```

3. **Error Handling**
```javascript
it('should show error message on failure', async () => {
  jest.spyOn(accountApi, 'updateProfileVisibility')
    .mockRejectedValue(new Error('Network error'));
  
  render(<ProfileVisibilityModal isOpen={true} onClose={mockClose} />);
  
  await waitFor(() => {
    expect(screen.getByText('Public')).toBeInTheDocument();
  });
  
  fireEvent.click(screen.getByText('Private'));
  
  await waitFor(() => {
    expect(screen.getByText(/Failed to update/)).toBeInTheDocument();
  });
});
```

### Integration Tests

```javascript
describe('Profile Visibility E2E', () => {
  it('should update visibility through UI', async () => {
    // Navigate to settings
    await page.goto('/settings');
    
    // Open modal
    await page.click('text=Who can see your profile');
    
    // Wait for modal
    await expect(page.locator('text=Profile Visibility')).toBeVisible();
    
    // Select option
    await page.click('text=Followers Only');
    
    // Verify success
    await expect(page.locator('text=updated successfully')).toBeVisible();
    
    // Verify persistence (close and reopen)
    await page.click('text=Done');
    await page.click('text=Who can see your profile');
    
    // Check selected option
    const selected = page.locator('.border-blue-600');
    await expect(selected).toContainText('Followers Only');
  });
});
```

### Manual Testing Checklist

- [ ] Modal opens when clicking menu item
- [ ] Loading state displays while fetching
- [ ] Current setting is highlighted
- [ ] All three options are clickable
- [ ] Spinner shows on selected option
- [ ] Success message appears after save
- [ ] Success message auto-dismisses
- [ ] Error handling works for network failures
- [ ] Optimistic update reverts on error
- [ ] Close button closes modal
- [ ] Setting persists across sessions
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
   - Reduces initial page load
   - Component unmounts when closed

2. **Optimistic Updates**
   - UI updates immediately on click
   - Reverts if API call fails
   - Improves perceived performance

3. **Minimal Re-renders**
   - Uses `useState` efficiently
   - No unnecessary state updates
   - Conditional rendering optimized

4. **API Efficiency**
   - Single field query on GET
   - Minimal payload on PUT
   - No unnecessary data transfer

### Database Performance

1. **Query Optimization**
   - Uses indexed `_id` field for user lookup
   - Selective field projection (`.select('profileVisibility')`)
   - Single document operation

2. **Update Efficiency**
   - Direct field update
   - Atomic operation
   - No complex transactions needed

### Network Performance

1. **Request Size**
   - GET: No payload
   - PUT: ~30 bytes payload
   - Minimal network overhead

2. **Response Optimization**
   - Gzip compression recommended
   - JSON response format
   - No unnecessary nested data

---

## Future Enhancements

### Short-term Improvements

1. **Custom Visibility Lists**
   - Allow specific users to view profile
   - Block list integration
   - Close friends list

2. **Granular Controls**
   - Separate controls for posts vs profile
   - Control followers/following list visibility
   - Hide specific profile fields

3. **Visibility Analytics**
   - Track who viewed your profile
   - View count statistics
   - Visibility change history

4. **Scheduled Visibility**
   - Time-based visibility changes
   - Auto-private during certain hours
   - Event-based triggers

5. **Profile Preview**
   - See how your profile looks to others
   - Different views for different settings
   - Test visibility before applying

### Long-term Enhancements

1. **Advanced Privacy Modes**
   - Incognito mode (hide online status)
   - Ghost mode (invisible browsing)
   - Verification-only visibility

2. **Smart Privacy Suggestions**
   - AI-powered privacy recommendations
   - Detect potential privacy risks
   - Suggest optimal settings

3. **Integration with Other Features**
   - Link with post privacy settings
   - Sync with story visibility
   - Coordinate with messaging privacy

4. **Compliance Features**
   - GDPR-compliant visibility controls
   - Age-based default settings
   - Regional privacy requirements

5. **Multi-platform Sync**
   - Sync settings across devices
   - Import/export privacy settings
   - Privacy profiles for different contexts

---

## Troubleshooting

### Common Issues

#### Issue: Modal shows "Failed to update" but API succeeds

**Symptoms**: Red error message despite successful API call

**Cause**: Frontend checking `response.data.success` instead of `response.success`

**Solution**:
```javascript
// ❌ Wrong
if (response.data.success) { ... }

// ✅ Correct (API client unwraps response)
if (response.success) { ... }
```

---

#### Issue: Selection doesn't persist

**Symptoms**: Setting reverts after page reload

**Possible Causes**:
1. API call failed silently
2. Database update didn't commit
3. GET request returning wrong data

**Solutions**:
```javascript
// Check browser console for API errors
console.log("Profile visibility response:", response);

// Verify database was updated
db.users.findOne({ _id: userId });

// Check GET endpoint returns updated value
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/account/profile-visibility
```

---

#### Issue: Optimistic update doesn't revert on error

**Symptoms**: UI shows new option even though save failed

**Cause**: Error not caught or revert logic not executed

**Solution**:
```javascript
const previousVisibility = profileVisibility;
setProfileVisibility(newVisibility);

try {
  await api.update();
} catch (err) {
  // Ensure revert happens
  setProfileVisibility(previousVisibility);
  setError(err.message);
}
```

---

#### Issue: Multiple API calls on single click

**Symptoms**: Console shows duplicate PUT requests

**Possible Causes**:
1. Double-click by user
2. Event handler attached twice
3. useEffect dependency issue

**Solutions**:
```javascript
// Prevent double-clicks
if (savingOption) return;

// Check useEffect dependencies
useEffect(() => {
  fetchData();
}, [isOpen]); // Only refetch when modal opens

// Debounce clicks (if needed)
const debouncedSelect = debounce(handleSelect, 300);
```

---

#### Issue: Modal doesn't open

**Symptoms**: Nothing happens when clicking menu item

**Possible Causes**:
1. onClick handler not attached
2. State not updated
3. Modal component not imported

**Solutions**:
```javascript
// Verify import
import ProfileVisibilityModal from "../components/ProfileVisibilityModal";

// Check state
const [showProfileVisibility, setShowProfileVisibility] = useState(false);

// Verify onClick
onClick: () => setShowProfileVisibility(true)

// Ensure modal is rendered
<ProfileVisibilityModal
  isOpen={showProfileVisibility}
  onClose={() => setShowProfileVisibility(false)}
/>
```

---

### Debug Mode

Add debugging to component:

```javascript
useEffect(() => {
  console.log('Profile visibility state:', profileVisibility);
}, [profileVisibility]);

useEffect(() => {
  console.log('Loading:', loading, 'Saving:', savingOption);
}, [loading, savingOption]);

useEffect(() => {
  console.log('Error:', error, 'Success:', successMessage);
}, [error, successMessage]);
```

---

## Appendix

### Code Snippets

#### Check Current Visibility in Code

```javascript
const checkVisibility = async () => {
  try {
    const response = await accountApi.getProfileVisibility();
    const visibility = response.data.profileVisibility;
    
    if (visibility === 'private') {
      console.log('Profile is private');
    } else if (visibility === 'followers') {
      console.log('Profile visible to followers');
    } else {
      console.log('Profile is public');
    }
  } catch (error) {
    console.error('Failed to check visibility:', error);
  }
};
```

#### Programmatically Update Visibility

```javascript
const setVisibilityToPrivate = async () => {
  try {
    await accountApi.updateProfileVisibility({
      profileVisibility: 'private'
    });
    console.log('Profile set to private');
  } catch (error) {
    console.error('Failed to update visibility:', error);
  }
};
```

#### Middleware to Check Visibility (Backend)

```javascript
const checkProfileVisibility = async (req, res, next) => {
  const { targetUserId } = req.params;
  
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Public profiles are always visible
  if (targetUser.profileVisibility === 'public') {
    return next();
  }
  
  // Private profiles only visible to self
  if (targetUser.profileVisibility === 'private') {
    if (req.userId !== targetUserId) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }
    return next();
  }
  
  // Followers-only profiles
  if (targetUser.profileVisibility === 'followers') {
    const isFollower = targetUser.followers.includes(req.userId);
    if (!isFollower && req.userId !== targetUserId) {
      return res.status(403).json({
        success: false,
        message: 'Only followers can view this profile'
      });
    }
    return next();
  }
  
  next();
};
```

---

### Related Documentation

- [Privacy & Safety](./PRIVACY_SAFETY.md)
- [Blocked Users](./BLOCKED_USERS.md)
- [Notification Preferences](./NOTIFICATION_PREFERENCES.md)
- [API Reference](./API_REFERENCE.md)
- [Settings Management](./SETTINGS.md)

---

## Changelog

### Version 1.0.0 (January 11, 2026)
- Initial implementation
- GET and PUT endpoints for profile visibility
- ProfileVisibilityModal component
- Integration with Settings page
- Support for MongoDB and Mock Database
- Optimistic UI updates
- Auto-save on selection
- Dark mode support
- Error handling and success messages
- Three visibility levels: public, followers, private

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
