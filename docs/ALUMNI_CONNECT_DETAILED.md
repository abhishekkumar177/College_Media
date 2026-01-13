# Alumni Connect - Comprehensive Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Design](#database-design)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [API Documentation](#api-documentation)
7. [Error Troubleshooting Guide](#error-troubleshooting-guide)
8. [Setup and Configuration](#setup-and-configuration)
9. [Usage Guide](#usage-guide)
10. [Best Practices](#best-practices)
11. [Future Enhancements](#future-enhancements)

---

## Overview

### What is Alumni Connect?

Alumni Connect is a comprehensive networking platform designed to connect college alumni with current students and fellow graduates. The platform facilitates professional networking, mentorship opportunities, career guidance, and collaborative opportunities within the alumni community.

### Key Features

1. **Alumni Profiles**
   - Comprehensive profile creation with education and work details
   - Skills showcase and achievements listing
   - Social media integration (LinkedIn, Twitter, GitHub, Website)
   - Privacy controls (Public, Alumni-only, Private)

2. **Networking**
   - Search and discover alumni by graduation year, company, location, skills
   - Send connection requests with personalized messages
   - Accept/reject connection requests
   - View connection network

3. **Mentorship Program**
   - Alumni can offer mentorship in specific areas
   - Students can find mentors based on expertise
   - Structured mentorship area tagging

4. **Job Opportunities**
   - Alumni can indicate hiring opportunities
   - Job seekers can identify potential employers
   - Network-based recruitment

5. **Statistics Dashboard**
   - Total alumni count
   - Active mentors count
   - Hiring alumni count
   - Real-time analytics

### Technology Stack

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Express-validator for input validation
- Redis for rate limiting

**Frontend:**
- React 19.2.3
- React Router v7 for navigation
- Axios for API requests
- Tailwind CSS for styling
- Lucide React for icons
- React Hot Toast for notifications

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ AlumniConnect│  │ Create Modal │  │  Alumni Card │      │
│  │    Page      │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                   │
│                  ┌────────▼────────┐                         │
│                  │ Alumni Service  │                         │
│                  │  (API Wrapper)  │                         │
│                  └────────┬────────┘                         │
└───────────────────────────┼──────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   API Gateway   │
                   │  (Interceptors) │
                   └────────┬────────┘
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                  Backend Layer                                │
│                  ┌────────▼────────┐                         │
│                  │  Alumni Routes  │                         │
│                  │  /api/alumni/*  │                         │
│                  └────────┬────────┘                         │
│                           │                                   │
│         ┌─────────────────┼─────────────────┐                │
│         │                 │                 │                │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐         │
│  │    Auth     │  │ Validation  │  │   Alumni    │         │
│  │ Middleware  │  │ Middleware  │  │ Middleware  │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         └─────────────────┼─────────────────┘                │
│                  ┌────────▼────────┐                         │
│                  │     Alumni      │                         │
│                  │   Controller    │                         │
│                  └────────┬────────┘                         │
│                           │                                   │
│         ┌─────────────────┼─────────────────┐                │
│         │                 │                 │                │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐         │
│  │   Alumni    │  │   Alumni    │  │   Alumni    │         │
│  │   Model     │  │ Connection  │  │   Event     │         │
│  │             │  │   Model     │  │   Model     │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
└─────────┼─────────────────┼─────────────────┼────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                   ┌────────▼────────┐
                   │    MongoDB      │
                   │    Database     │
                   └─────────────────┘
```

### Data Flow

1. **Profile Creation Flow**
   ```
   User fills form → Form validation → API request → 
   Auth check → Data validation → Database insert → 
   Response → Update UI → Show success toast
   ```

2. **Alumni Search Flow**
   ```
   User enters search query → Debounced API call → 
   Apply filters → Database query → Populate user data → 
   Return results → Render alumni cards
   ```

3. **Connection Request Flow**
   ```
   User clicks connect → Send request with message → 
   Create connection document → Update both users → 
   Send notification → Update UI
   ```

---

## Database Design

### Alumni Schema

```javascript
{
  user: ObjectId (ref: 'User'),      // Reference to User model
  graduationYear: Number,             // 1900-2035 range
  degree: String,                     // e.g., "B.Tech", "M.S."
  major: String,                      // e.g., "Computer Science"
  
  // Current Work
  currentCompany: String,
  currentPosition: String,
  industry: String,
  
  // Location
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: [Number]             // [longitude, latitude]
  },
  
  // Profile Details
  bio: String (max 500 chars),
  skills: [String],                   // Array of skills
  achievements: [String],             // Array of achievements
  
  // Work Experience
  workExperience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  
  // Mentorship
  mentorshipAvailable: Boolean,
  mentorshipAreas: [String],
  
  // Opportunities
  lookingForOpportunities: Boolean,
  willingToHire: Boolean,
  
  // Social Media
  socialMedia: {
    linkedin: String (URL),
    twitter: String (URL),
    github: String (URL),
    website: String (URL)
  },
  
  // Privacy
  visibility: String,                 // 'public', 'alumni-only', 'private'
  verified: Boolean,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `user` (unique)
- `graduationYear`
- `currentCompany`
- `skills`
- `location.coordinates` (2dsphere for geo queries)
- Compound index: `{graduationYear: 1, major: 1}`

### AlumniConnection Schema

```javascript
{
  requester: ObjectId (ref: 'Alumni'),
  recipient: ObjectId (ref: 'Alumni'),
  status: String,                     // 'pending', 'accepted', 'rejected'
  message: String (max 300 chars),    // Connection request message
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound unique: `{requester: 1, recipient: 1}`
- `recipient` (for finding incoming requests)
- `requester` (for finding sent requests)

### AlumniEvent Schema

```javascript
{
  title: String,
  description: String,
  organizer: ObjectId (ref: 'Alumni'),
  eventType: String,                  // 'networking', 'workshop', etc.
  startDate: Date,
  endDate: Date,
  
  location: {
    type: String,                     // 'virtual', 'physical', 'hybrid'
    address: String,
    city: String,
    state: String,
    country: String,
    virtualLink: String
  },
  
  capacity: Number,
  attendees: [{
    alumni: ObjectId (ref: 'Alumni'),
    registeredAt: Date,
    attended: Boolean
  }],
  
  tags: [String],
  imageUrl: String,
  status: String,                     // 'draft', 'published', 'cancelled', 'completed'
  registrationDeadline: Date,
  isPublic: Boolean,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Backend Implementation

### Project Structure

```
backend/
├── controllers/
│   └── alumniController.js          # Business logic
├── middleware/
│   ├── authMiddleware.js            # JWT authentication
│   └── alumniMiddleware.js          # Alumni-specific checks
├── models/
│   ├── Alumni.js                    # Alumni schema
│   ├── AlumniConnection.js          # Connection schema
│   └── AlumniEvent.js               # Event schema
├── routes/
│   └── alumni.js                    # API route definitions
└── server.js                        # Entry point
```

### Controllers

#### alumniController.js

**Key Functions:**

1. **createAlumniProfile**
   ```javascript
   // Creates a new alumni profile
   // Validates: graduation year, degree, major
   // Checks: User doesn't already have an alumni profile
   // Returns: Created alumni profile with populated user data
   ```

2. **getAlumniProfile**
   ```javascript
   // Retrieves alumni profile by ID or current user
   // Implements visibility checks:
   //   - Public: Visible to all
   //   - Alumni-only: Visible to verified alumni
   //   - Private: Visible only to owner
   // Returns: Alumni profile with user data
   ```

3. **updateAlumniProfile**
   ```javascript
   // Updates alumni profile
   // Whitelist approach: Only allowed fields can be updated
   // Validates: All input data
   // Returns: Updated profile
   ```

4. **searchAlumni**
   ```javascript
   // Search with multiple filters:
   //   - graduationYear
   //   - major
   //   - company
   //   - location
   //   - skills
   //   - mentorshipAvailable
   //   - willingToHire
   // Pagination: page, limit parameters
   // Returns: Array of matching alumni with total count
   ```

5. **sendConnectionRequest**
   ```javascript
   // Creates connection request
   // Validates: Not connecting to self
   // Checks: No existing connection
   // Prevents: Duplicate requests
   // Returns: Created connection
   ```

6. **respondToConnection**
   ```javascript
   // Accept or reject connection request
   // Validates: User is the recipient
   // Updates: Connection status
   // Returns: Updated connection
   ```

7. **getMyConnections**
   ```javascript
   // Gets all user's connections
   // Filters: By status (accepted/pending)
   // Populates: Full user and alumni data
   // Returns: Array of connections
   ```

8. **createEvent**
   ```javascript
   // Creates alumni event
   // Validates: Date ranges, capacity
   // Sets: Organizer as current user
   // Returns: Created event
   ```

9. **getEvents**
   ```javascript
   // List events with filters:
   //   - eventType
   //   - status
   //   - date ranges
   // Pagination support
   // Returns: Events with attendee counts
   ```

10. **registerForEvent**
    ```javascript
    // Registers user for event
    // Checks: Event capacity
    // Validates: Not already registered
    // Returns: Updated event
    ```

11. **getAlumniStats**
    ```javascript
    // Aggregation queries for statistics
    // Calculates:
    //   - Total alumni count
    //   - Mentors available
    //   - Alumni willing to hire
    //   - Top companies
    //   - Top skills
    // Returns: Statistics object
    ```

### Middleware

#### authMiddleware.js

```javascript
const protect = async (req, res, next) => {
  // Extract JWT from Authorization header
  // Verify token signature
  // Decode token payload
  // Load user from database
  // Attach user to request object
  // Handle: TokenExpiredError, JsonWebTokenError
}
```

**Key Fix Applied:**
```javascript
// Support both 'userId' and 'id' in JWT payload
const userId = decoded.userId || decoded.id;
```

#### alumniMiddleware.js

```javascript
const requireAlumniProfile = async (req, res, next) => {
  // Check if user has alumni profile
  // Load alumni profile
  // Attach to request
}

const requireVerifiedAlumni = async (req, res, next) => {
  // Ensure alumni is verified
  // Used for sensitive operations
}

const isEventOrganizer = async (req, res, next) => {
  // Verify user is event organizer
  // Used for event management operations
}
```

### Routes

#### alumni.js

```javascript
// Profile routes
POST   /api/alumni/profile              # Create profile
GET    /api/alumni/profile/:id?         # Get profile
PUT    /api/alumni/profile              # Update profile

// Search
GET    /api/alumni/search               # Search alumni

// Connections
POST   /api/alumni/connections/request  # Send request
PUT    /api/alumni/connections/:id      # Respond to request
GET    /api/alumni/connections          # List connections

// Events
POST   /api/alumni/events               # Create event
GET    /api/alumni/events               # List events
POST   /api/alumni/events/:id/register  # Register for event

// Statistics
GET    /api/alumni/stats                # Get statistics
```

**Validation Rules:**

```javascript
// Profile creation
body('graduationYear')
  .isInt({ min: 1900, max: new Date().getFullYear() + 10 })
body('degree').notEmpty()
body('major').notEmpty()
body('bio').optional().isLength({ max: 500 })
body('visibility').optional().isIn(['public', 'alumni-only', 'private'])

// Connection request
body('recipientId').notEmpty()
body('message').optional().isLength({ max: 300 })

// Event creation
body('title').notEmpty()
body('eventType').isIn(['networking', 'workshop', 'reunion', 'webinar', 'career-fair', 'social', 'other'])
body('startDate').isISO8601()
body('endDate').isISO8601()
```

---

## Frontend Implementation

### Component Structure

```
frontend/src/
├── components/
│   └── CreateAlumniProfileModal.jsx   # Profile creation modal
├── pages/
│   └── AlumniConnect.jsx              # Main alumni page
├── services/
│   └── alumniService.js               # API service layer
└── utils/
    └── tokenManager.js                # JWT token management
```

### Components

#### AlumniConnect.jsx

**State Management:**

```javascript
const [searchQuery, setSearchQuery] = useState('');
const [selectedFilter, setSelectedFilter] = useState('all');
const [alumni, setAlumni] = useState([]);
const [stats, setStats] = useState({
  totalAlumni: 0,
  mentorsAvailable: 0,
  hiringAlumni: 0
});
const [loading, setLoading] = useState(true);
const [connecting, setConnecting] = useState({});
const [showCreateModal, setShowCreateModal] = useState(false);
```

**Key Features:**

1. **Search with Debouncing**
   ```javascript
   useEffect(() => {
     const timer = setTimeout(() => {
       if (searchQuery || selectedFilter !== 'all') {
         loadAlumniData();
       }
     }, 500);  // 500ms debounce
     
     return () => clearTimeout(timer);
   }, [searchQuery, selectedFilter]);
   ```

2. **Filter Implementation**
   ```javascript
   const filters = {
     page: 1,
     limit: 20
   };
   
   if (selectedFilter === 'available') {
     filters.mentorshipAvailable = true;
   }
   
   if (searchQuery) {
     filters.company = searchQuery;
   }
   ```

3. **Connection Request**
   ```javascript
   const handleConnect = async (alumniId, alumniName) => {
     setConnecting(prev => ({ ...prev, [alumniId]: true }));
     
     try {
       await sendConnectionRequest(recipientUserId, message);
       toast.success(`Connection request sent to ${alumniName}!`);
     } catch (error) {
       toast.error(error.response?.data?.message);
     } finally {
       setConnecting(prev => ({ ...prev, [alumniId]: false }));
     }
   };
   ```

4. **Stats Display**
   ```javascript
   const statsDisplay = [
     { 
       icon: Users, 
       label: 'Total Alumni', 
       value: stats.totalAlumni.toLocaleString(),
       color: 'text-blue-600'
     },
     { 
       icon: TrendingUp, 
       label: 'Active Mentors', 
       value: stats.mentorsAvailable,
       color: 'text-green-600'
     },
     { 
       icon: Award, 
       label: 'Willing to Hire', 
       value: stats.hiringAlumni,
       color: 'text-purple-600'
     }
   ];
   ```

#### CreateAlumniProfileModal.jsx

**Form Structure:**

```javascript
const [formData, setFormData] = useState({
  // Education
  graduationYear: '',
  degree: '',
  major: '',
  
  // Work
  currentCompany: '',
  currentPosition: '',
  industry: '',
  
  // Location
  location: {
    city: '',
    state: '',
    country: ''
  },
  
  // Profile
  bio: '',
  skills: [],
  
  // Mentorship
  mentorshipAvailable: false,
  mentorshipAreas: [],
  
  // Opportunities
  lookingForOpportunities: false,
  willingToHire: false,
  
  // Social
  socialMedia: {
    linkedin: '',
    twitter: '',
    github: '',
    website: ''
  },
  
  // Privacy
  visibility: 'public'
});
```

**Dynamic Field Handling:**

```javascript
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  
  if (name.includes('.')) {
    // Handle nested objects like location.city
    const [parent, child] = name.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  } else {
    // Handle regular fields
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }
};
```

**Array Management:**

```javascript
// Add skill
const addSkill = () => {
  if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, skillInput.trim()]
    }));
    setSkillInput('');
  }
};

// Remove skill
const removeSkill = (skill) => {
  setFormData(prev => ({
    ...prev,
    skills: prev.skills.filter(s => s !== skill)
  }));
};
```

**Form Submission:**

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await createAlumniProfile(formData);
    toast.success('Alumni profile created successfully!');
    onSuccess?.();  // Reload alumni list
    onClose();      // Close modal
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create profile');
  } finally {
    setLoading(false);
  }
};
```

### Services

#### alumniService.js

```javascript
import api from './api';

// Profile Management
export const createAlumniProfile = async (profileData) => {
  const response = await api.post('/alumni/profile', profileData);
  return response.data;
};

export const getAlumniProfile = async (userId = null) => {
  const endpoint = userId ? `/alumni/profile/${userId}` : '/alumni/profile';
  const response = await api.get(endpoint);
  return response.data;
};

export const updateAlumniProfile = async (updateData) => {
  const response = await api.put('/alumni/profile', updateData);
  return response.data;
};

// Search
export const searchAlumni = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });
  
  const response = await api.get(`/alumni/search?${params.toString()}`);
  return response.data;
};

// Connections
export const sendConnectionRequest = async (recipientId, message) => {
  const response = await api.post('/alumni/connections/request', {
    recipientId,
    message
  });
  return response.data;
};

export const respondToConnection = async (connectionId, status) => {
  const response = await api.put(`/alumni/connections/${connectionId}`, {
    status
  });
  return response.data;
};

export const getMyConnections = async (status = null) => {
  const params = status ? `?status=${status}` : '';
  const response = await api.get(`/alumni/connections${params}`);
  return response.data;
};

// Statistics
export const getAlumniStats = async () => {
  const response = await api.get('/alumni/stats');
  return response.data;
};
```

### API Client Configuration

#### tokenManager.js

```javascript
const TOKEN_KEY = 'token';  // Must match AuthContext

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

export const clearTokens = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};
```

---

## API Documentation

### Authentication

All API endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Endpoints

#### 1. Create Alumni Profile

**Endpoint:** `POST /api/alumni/profile`

**Request Body:**
```json
{
  "graduationYear": 2020,
  "degree": "B.Tech",
  "major": "Computer Science",
  "currentCompany": "Google",
  "currentPosition": "Software Engineer",
  "industry": "Technology",
  "location": {
    "city": "San Francisco",
    "state": "California",
    "country": "USA"
  },
  "bio": "Passionate software engineer with 4 years of experience...",
  "skills": ["JavaScript", "React", "Node.js"],
  "mentorshipAvailable": true,
  "mentorshipAreas": ["Web Development", "Career Guidance"],
  "lookingForOpportunities": false,
  "willingToHire": true,
  "socialMedia": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe"
  },
  "visibility": "public"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": {
      "_id": "507f191e810c19729de860ea",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePicture": "https://..."
    },
    "graduationYear": 2020,
    "degree": "B.Tech",
    // ... other fields
    "createdAt": "2026-01-13T10:30:00Z",
    "updatedAt": "2026-01-13T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Invalid or missing token
- `409 Conflict` - Profile already exists

#### 2. Get Alumni Profile

**Endpoint:** `GET /api/alumni/profile/:id?`

**Parameters:**
- `id` (optional) - Alumni ID. If not provided, returns current user's profile

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": {
      "_id": "507f191e810c19729de860ea",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePicture": "https://..."
    },
    "graduationYear": 2020,
    "degree": "B.Tech",
    "major": "Computer Science",
    // ... other fields
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Profile is private
- `404 Not Found` - Profile doesn't exist

#### 3. Search Alumni

**Endpoint:** `GET /api/alumni/search`

**Query Parameters:**
```
?graduationYear=2020
&major=Computer Science
&company=Google
&location=San Francisco
&skill=React
&mentorshipAvailable=true
&willingToHire=true
&page=1
&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user": {
        "name": "John Doe",
        "profilePicture": "https://..."
      },
      "graduationYear": 2020,
      "currentCompany": "Google",
      "currentPosition": "Software Engineer",
      "skills": ["JavaScript", "React"],
      "mentorshipAvailable": true
    },
    // ... more results
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### 4. Send Connection Request

**Endpoint:** `POST /api/alumni/connections/request`

**Request Body:**
```json
{
  "recipientId": "507f191e810c19729de860ea",
  "message": "Hi! I'd love to connect and learn from your experience."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "requester": "507f191e810c19729de860eb",
    "recipient": "507f191e810c19729de860ea",
    "status": "pending",
    "message": "Hi! I'd love to connect...",
    "createdAt": "2026-01-13T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Cannot connect to self or duplicate request
- `404 Not Found` - Recipient not found

#### 5. Get Alumni Statistics

**Endpoint:** `GET /api/alumni/stats`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalAlumni": 1250,
    "mentorsAvailable": 87,
    "hiringAlumni": 45,
    "topCompanies": [
      { "company": "Google", "count": 45 },
      { "company": "Microsoft", "count": 38 }
    ],
    "topSkills": [
      { "skill": "JavaScript", "count": 320 },
      { "skill": "Python", "count": 285 }
    ]
  }
}
```

---

## Error Troubleshooting Guide

### Critical Errors Encountered and Solutions

#### Error 1: Redirect Loop to Login Page

**Symptom:**
```
User is authenticated but keeps getting redirected to /login page
Redirect happens after ~2 seconds of loading Alumni Connect page
```

**Root Causes:**
1. Settings API endpoint missing (`/api/account/settings` returned 404)
2. SettingsContext interpreting 404 as authentication failure
3. Alumni route not wrapped in ProtectedRoute
4. Token key mismatch between tokenManager and AuthContext

**Investigation Steps:**
```javascript
// Console showed:
GET http://localhost:5000/api/account/settings 404 (Not Found)
Failed to fetch settings: ApiError: The requested resource was not found
ProtectedRoute: User authenticated, rendering protected content
```

**Solutions Applied:**

1. **Created Missing Settings Endpoint**
   ```javascript
   // backend/routes/account.js
   router.get('/settings', verifyToken, async (req, res) => {
     try {
       const user = await User.findById(req.userId).select('settings');
       const settings = user.settings || {
         fontSize: 'medium',
         theme: 'auto',
         notifications: { email: true, push: true }
       };
       res.json({ success: true, data: settings });
     } catch (error) {
       res.status(500).json({ success: false, message: 'Error fetching settings' });
     }
   });
   ```

2. **Fixed SettingsContext Error Handling**
   ```javascript
   // frontend/src/context/SettingsContext.jsx
   catch (error) {
     // Only logout on 401, not 404
     if (error.response?.status === 404) {
       console.log('Settings endpoint not available');
       return;
     }
     if (error.response?.status === 401) {
       logout();
     }
   }
   ```

3. **Moved Alumni Route to Protected Section**
   ```javascript
   // frontend/src/routes/AppRoutes.jsx
   // BEFORE (Wrong - public route):
   <Route path="alumni-connect" element={<AlumniConnect />} />
   
   // AFTER (Correct - protected route):
   <Route path="/*" element={<ProtectedRoute>...</ProtectedRoute>}>
     <Route path="alumni-connect" element={<AlumniConnect />} />
   </Route>
   ```

4. **Fixed Token Key Mismatch**
   ```javascript
   // BEFORE:
   const TOKEN_KEY = 'auth_token';  // tokenManager.js
   localStorage.setItem('token', token);  // AuthContext.jsx
   
   // AFTER (Both use 'token'):
   const TOKEN_KEY = 'token';  // tokenManager.js
   localStorage.setItem('token', token);  // AuthContext.jsx
   ```

**Verification:**
```javascript
// Check token in console:
console.log('Token:', localStorage.getItem('token'));

// Should see in network tab:
GET /api/account/settings 200 OK
GET /api/alumni/search 200 OK
GET /api/alumni/stats 200 OK
```

#### Error 2: 401 Unauthorized on Alumni Endpoints

**Symptom:**
```
GET /api/alumni/search 401 (Unauthorized)
GET /api/alumni/stats 401 (Unauthorized)
API Error: {message: "Not authorized, no token"}
```

**Root Cause:**
JWT token signed with `userId` but protect middleware looking for `id`:

```javascript
// Token payload (auth.js):
jwt.sign({ userId: user._id, sessionId }, JWT_SECRET)

// Middleware expecting (authMiddleware.js):
const decoded = jwt.verify(token, JWT_SECRET);
req.user = await User.findById(decoded.id);  // ❌ undefined
```

**Solution:**
```javascript
// backend/middleware/authMiddleware.js
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Support both 'userId' and 'id' for backwards compatibility
    const userId = decoded.userId || decoded.id;
    
    req.user = await User.findById(userId).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
```

**Testing:**
```bash
# Decode JWT to verify payload
curl http://localhost:5000/api/alumni/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return 200 OK with stats
```

#### Error 3: React Hooks Error in AccessibilityContext

**Symptom:**
```
Error: Invalid hook call. Hooks can only be called inside the body of a function component
Cannot read properties of null (reading 'useState')
```

**Root Cause:**
React 19 doesn't require default React import for hooks-only files:

```javascript
// BEFORE (Wrong in React 19):
import React, { useState, useEffect } from 'react';

// AFTER (Correct):
import { useState, useEffect } from 'react';
```

**Solution:**
```javascript
// frontend/src/context/AccessibilityContext.jsx
- import React, { createContext, useState, useEffect } from 'react';
+ import { createContext, useState, useEffect } from 'react';

// frontend/src/pages/Login.jsx
- import React, { useState } from "react";
+ import { useState } from "react";
```

#### Error 4: Service Worker Error - limitCacheSize Not Defined

**Symptom:**
```
service-worker.js:78 Uncaught ReferenceError: limitCacheSize is not defined
    at fetch event listener
```

**Root Cause:**
Function called before definition in service worker.

**Solution:**
```javascript
// frontend/public/service-worker.js
// Define BEFORE using
const limitCacheSize = (cacheName, maxItems) => {
  caches.open(cacheName).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxItems));
      }
    });
  });
};

// Now can use it in fetch event
self.addEventListener('fetch', (event) => {
  // ... caching logic ...
  limitCacheSize('api-cache', 50);
});
```

#### Error 5: Vite WebSocket HMR Connection Failed

**Symptom:**
```
[vite] failed to connect to websocket.
[vite] connecting...
WebSocket connection failed
```

**Root Cause:**
Vite HMR trying to connect to wrong port or protocol.

**Solution:**
```javascript
// frontend/vite.config.js
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
      clientPort: 5173
    }
  }
});
```

**Clear Cache and Restart:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

#### Error 6: CSS Conflicts in CreateAlumniProfileModal

**Symptom:**
```
Warning: 'block' applies the same CSS properties as 'flex'
Warning: 'flex' applies the same CSS properties as 'block'
```

**Root Cause:**
Both `block` and `flex` display properties in same className:

```javascript
// BEFORE:
<label className="block text-sm font-medium mb-2  items-center gap-2">

// AFTER:
<label className="flex items-center gap-2 text-sm font-medium mb-2">
```

**Solution:**
Remove conflicting `block` class when using `flex`.

### Common Debugging Techniques

#### 1. Check Authentication State

```javascript
// In browser console:
localStorage.getItem('token')  // Should return JWT
JSON.parse(atob(localStorage.getItem('token').split('.')[1]))  // Decode payload
```

#### 2. Verify API Responses

```bash
# Test endpoints directly
curl http://localhost:5000/api/alumni/stats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### 3. Monitor Network Requests

```javascript
// In DevTools > Network tab, filter by:
- /api/alumni/*  (Alumni requests)
- Status: 401, 404, 500 (Errors)
- Method: GET, POST, PUT (Different operations)
```

#### 4. Add Strategic Logging

```javascript
// Backend logging:
console.log('📤 Request:', req.method, req.url);
console.log('🔑 Token:', req.headers.authorization?.split(' ')[1]?.slice(0, 20));
console.log('👤 User:', req.user?._id);

// Frontend logging:
console.log('🔐 Auth state:', { user: !!user, loading });
console.log('📡 API call:', method, url, data);
console.log('✅ Response:', response.status, response.data);
```

#### 5. React DevTools Inspection

```javascript
// Install React DevTools
// Inspect component state:
Components > AlumniConnect > hooks
  - useState(searchQuery): ""
  - useState(alumni): []
  - useState(loading): false
```

---

## Setup and Configuration

### Prerequisites

- Node.js 16+ and npm 8+
- MongoDB 5.0+
- Redis (optional, for rate limiting)

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/your-repo/college-media.git
cd college-media
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

**Environment Variables:**

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/college_media
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college_media

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=7d

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS
FRONTEND_URL=http://localhost:5173
```

#### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env
```

**Environment Variables:**

```env
# API
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000

# Environment
VITE_APP_ENV=development
```

#### 4. Database Setup

```bash
# Start MongoDB
mongod --dbpath /path/to/data

# Or using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:5.0

# Create indexes
mongosh
> use college_media
> db.alumnis.createIndex({ user: 1 }, { unique: true })
> db.alumnis.createIndex({ graduationYear: 1 })
> db.alumnis.createIndex({ "location.coordinates": "2dsphere" })
```

#### 5. Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Server running on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev
# App running on http://localhost:5173
```

### Verification

```bash
# Test backend
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}

# Test frontend
open http://localhost:5173
# Should see College Media homepage
```

---

## Usage Guide

### For Students/Alumni

#### 1. Creating Alumni Profile

1. Navigate to Alumni Connect page
2. Click "Create Alumni Profile" button
3. Fill in required information:
   - Graduation year
   - Degree (e.g., B.Tech, M.S.)
   - Major (e.g., Computer Science)
4. Add optional information:
   - Current job details
   - Location
   - Bio (max 500 characters)
   - Skills (add tags)
   - Mentorship availability
   - Social media links
5. Set profile visibility:
   - Public: Everyone can see
   - Alumni-only: Only verified alumni
   - Private: Only you
6. Click "Create Profile"

#### 2. Searching for Alumni

1. Use search bar to search by:
   - Name
   - Company
   - Position
   - Location
2. Apply filters:
   - "All Alumni": Show everyone
   - "Available Now": Mentors available
3. View results in card grid

#### 3. Connecting with Alumni

1. Find alumni profile
2. Click "Connect" button
3. Default message sent automatically
4. Wait for acceptance
5. Once accepted, view in "My Connections"

#### 4. Viewing Statistics

Dashboard shows:
- Total alumni count
- Active mentors
- Alumni willing to hire

### For Administrators

#### Monitoring Alumni Activity

```javascript
// Get all alumni profiles
GET /api/alumni/search?limit=1000

// Get connection statistics
db.alumniconnections.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Get top companies
db.alumnis.aggregate([
  { $group: { _id: "$currentCompany", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
])
```

#### Moderating Profiles

```javascript
// Verify alumni profile
db.alumnis.updateOne(
  { _id: ObjectId("...") },
  { $set: { verified: true } }
)

// Bulk verify by graduation year
db.alumnis.updateMany(
  { graduationYear: 2020 },
  { $set: { verified: true } }
)
```

---

## Best Practices

### Backend

1. **Always validate input**
   ```javascript
   body('email').isEmail().normalizeEmail(),
   body('graduationYear').isInt({ min: 1900, max: 2035 })
   ```

2. **Use pagination for large datasets**
   ```javascript
   const page = parseInt(req.query.page) || 1;
   const limit = Math.min(parseInt(req.query.limit) || 20, 100);
   const skip = (page - 1) * limit;
   ```

3. **Populate selectively**
   ```javascript
   .populate('user', 'name email profilePicture')  // Only needed fields
   ```

4. **Handle errors consistently**
   ```javascript
   try {
     // ... operation
   } catch (error) {
     console.error('Operation failed:', error);
     res.status(500).json({ 
       success: false, 
       message: 'Operation failed',
       error: process.env.NODE_ENV === 'development' ? error.message : undefined
     });
   }
   ```

### Frontend

1. **Debounce search inputs**
   ```javascript
   useEffect(() => {
     const timer = setTimeout(() => search(), 500);
     return () => clearTimeout(timer);
   }, [searchQuery]);
   ```

2. **Show loading states**
   ```javascript
   {loading ? <Spinner /> : <DataDisplay data={data} />}
   ```

3. **Handle errors gracefully**
   ```javascript
   catch (error) {
     const message = error.response?.data?.message || 'Operation failed';
     toast.error(message);
   }
   ```

4. **Optimize re-renders**
   ```javascript
   const memoizedValue = useMemo(() => computeExpensive(data), [data]);
   ```

### Security

1. **Never expose sensitive data**
   ```javascript
   .select('-password -resetToken -twoFactorSecret')
   ```

2. **Validate on both client and server**
3. **Use HTTPS in production**
4. **Implement rate limiting**
5. **Sanitize user inputs**

---

## Future Enhancements

### Phase 1: Enhanced Features

1. **Advanced Search**
   - Geo-location based search
   - Full-text search with Elasticsearch
   - Saved searches
   - Search alerts

2. **Messaging System**
   - Direct messaging between connections
   - Group chats
   - File sharing
   - Video calls integration

3. **Event Management**
   - Virtual event support
   - Calendar integration
   - RSVP tracking
   - Post-event feedback

### Phase 2: Analytics

1. **Profile Analytics**
   - Profile views
   - Connection growth
   - Engagement metrics

2. **Network Insights**
   - Connection recommendations
   - Network visualization
   - Industry trends

3. **Admin Dashboard**
   - User growth charts
   - Engagement metrics
   - Popular skills/companies

### Phase 3: Integrations

1. **Job Board Integration**
   - Post job opportunities
   - Apply through platform
   - Application tracking

2. **Learning Resources**
   - Course recommendations
   - Skill development paths
   - Certification tracking

3. **Social Media**
   - Share achievements
   - LinkedIn sync
   - Twitter integration

---

## Conclusion

The Alumni Connect feature provides a robust platform for alumni networking, mentorship, and career opportunities. This documentation covers:

- Complete architecture and design
- Detailed implementation guide
- Comprehensive error troubleshooting
- API documentation
- Setup instructions
- Best practices

For questions or issues:
- GitHub Issues: https://github.com/your-repo/issues
- Email: support@collegemedia.com
- Documentation: https://docs.collegemedia.com

**Version:** 1.0.0  
**Last Updated:** January 13, 2026  
**Contributors:** Development Team
