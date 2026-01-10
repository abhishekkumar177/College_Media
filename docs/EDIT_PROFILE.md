# Edit Profile Feature Documentation

## Overview
The Edit Profile feature allows authenticated users to update their profile information, including personal details, bio, contact information, privacy settings, and profile picture.

## Architecture

### Component Structure
```
EditProfile.jsx (Main Component)
  ├── AuthContext (Authentication & State Management)
  ├── Profile Picture Upload
  ├── Basic Information Form
  ├── Contact Information
  ├── Privacy Settings
  └── Form Submission
```

### File Locations
- **Component**: `frontend/src/pages/EditProfile.jsx`
- **Context**: `frontend/src/context/AuthContext.jsx`
- **Profile Display**: `frontend/src/pages/Profile.jsx`
- **Backend Routes**: `backend/routes/users.js`
- **Backend Model**: `backend/models/User.js`

---

## Features

### 1. Profile Picture Management
- **Upload**: Support for JPG, PNG, and GIF formats (max 5MB)
- **Preview**: Live preview of selected image before upload
- **Remove**: Option to delete existing profile picture
- **Validation**: Client-side file type and size validation

### 2. Editable Fields

#### Basic Information
- **First Name**: User's first name
- **Last Name**: User's last name
- **Username**: Unique identifier (auto-populated, read-only in current implementation)
- **Bio**: Multi-line text area (max 500 characters)

#### Contact Information
- **Email**: User's email address
- **Phone**: Contact number (optional)
- **Website**: Personal website URL (optional)

#### Personal Details
- **Gender**: Dropdown selection (Male, Female, Other, Prefer not to say)

#### Privacy Settings
- **Private Account**: Toggle to make profile private
- **Show Activity Status**: Toggle to show/hide online status

---

## Technical Implementation

### 1. State Management with AuthContext

The EditProfile component integrates deeply with `AuthContext` for authentication and state management:

```javascript
const { user, token, updateUserProfile, uploadProfilePicture } = useAuth();
```

#### AuthContext Methods Used

**`updateUserProfile(profileData)`**
- **Purpose**: Updates user profile information
- **Parameters**: Object containing profile fields
- **Returns**: `{ success: boolean, data?: object, message?: string }`
- **Side Effects**: Updates `user` state in AuthContext on success

**`uploadProfilePicture(imageFile)`**
- **Purpose**: Uploads/updates profile picture
- **Parameters**: File object from input
- **Returns**: `{ success: boolean, data?: { profilePicture: string }, message?: string }`
- **Side Effects**: Updates user's `profilePicture` in AuthContext

### 2. Form State Management

```javascript
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  username: '',
  bio: '',
  website: '',
  email: '',
  phone: '',
  gender: '',
  isPrivate: false,
  showActivityStatus: true,
});
```

**Data Population**: Form is automatically populated from `user` object in AuthContext via `useEffect`:

```javascript
useEffect(() => {
  if (user) {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
      bio: user.bio || '',
      website: user.website || '',
      email: user.email || '',
      phone: user.phone || '',
      gender: user.gender || '',
      isPrivate: user.isPrivate || false,
      showActivityStatus: user.showActivityStatus !== false,
    });
    
    if (user.profilePicture) {
      setProfileImage(user.profilePicture);
    }
  }
}, [user]);
```

### 3. Profile Picture Upload Flow

#### Client-Side Process
1. User selects image file
2. Validation checks (file type, size)
3. File preview using FileReader API
4. Image stored in local state
5. Upload triggered on button click
6. FormData created and sent to backend
7. Success: Preview updated, success message shown
8. Error: Error message displayed

#### Code Implementation
```javascript
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // File size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // File type validation
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    setImageFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

const handleImageUpload = async () => {
  if (!imageFile) return;
  
  const result = await uploadProfilePicture(imageFile);
  
  if (result.success) {
    setMessage('Profile picture updated successfully!');
    setImageFile(null);
  } else {
    setError(result.message || 'Failed to upload image');
  }
};
```

### 4. Form Submission Flow

#### Client-Side Process
1. Form validation (prevents empty submissions)
2. Loading state activated
3. All form fields sent to `updateUserProfile`
4. Backend processes update
5. AuthContext state updated with new user data
6. Success: Message shown, redirect to profile after 1.5s
7. Error: Error message displayed

#### Code Implementation
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setMessage('');

  try {
    const result = await updateUserProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      bio: formData.bio,
      website: formData.website,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      isPrivate: formData.isPrivate,
      showActivityStatus: formData.showActivityStatus,
    });
    
    if (result.success) {
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } else {
      throw new Error(result.message || 'Failed to update profile');
    }
  } catch (err) {
    setError(err.message || 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};
```

---

## API Integration

### Backend Endpoints

#### 1. Update Profile - `PUT /api/users/profile`

**Purpose**: Update user profile information

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "john_doe",
  "bio": "Computer Science Student",
  "website": "https://johndoe.com",
  "email": "john@college.edu",
  "phone": "+1234567890",
  "gender": "Male",
  "isPrivate": false,
  "showActivityStatus": true
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "username": "john_doe",
    "email": "john@college.edu",
    "bio": "Computer Science Student",
    "website": "https://johndoe.com",
    "phone": "+1234567890",
    "gender": "Male",
    "isPrivate": false,
    "showActivityStatus": true,
    "profilePicture": "http://localhost:5000/uploads/profile.jpg",
    "createdAt": "2026-01-10T12:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

**Error Response** (400/401/404):
```json
{
  "success": false,
  "data": null,
  "message": "Error description"
}
```

#### 2. Upload Profile Picture - `POST /api/users/profile-picture`

**Purpose**: Upload or update profile picture

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body** (FormData):
```
profilePicture: <File>
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "profilePicture": "http://localhost:5000/uploads/1736518401234.jpg"
  },
  "message": "Profile picture updated successfully"
}
```

**Error Responses**:
- **400**: No file provided / Invalid file type
- **401**: Invalid token / No token provided
- **413**: File too large (>5MB)

#### 3. Delete Profile Picture - `DELETE /api/users/profile-picture`

**Purpose**: Remove current profile picture

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "data": null,
  "message": "Profile picture removed successfully"
}
```

---

## Authentication & Security

### 1. Route Protection
- EditProfile route wrapped in `ProtectedRoute` component
- Redirects to `/landing` if user not authenticated
- Loading state shown while checking authentication

```javascript
<Route
  path="edit-profile"
  element={
    <ProtectedRoute>
      <LazyWrapper>
        <EditProfile />
      </LazyWrapper>
    </ProtectedRoute>
  }
/>
```

### 2. Token Management
- JWT token extracted from AuthContext
- Token sent in Authorization header: `Bearer <token>`
- Automatic token validation on backend via `verifyToken` middleware
- Invalid/expired tokens return 400/401 errors

### 3. Backend Validation
```javascript
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      data: null,
      message: 'Invalid token.'
    });
  }
};
```

---

## User Experience Features

### 1. Loading States
- **Profile Data Loading**: Skeleton/spinner while fetching user data
- **Form Submission**: Button disabled with loading spinner during save
- **Image Upload**: Loading indicator during file upload

### 2. Success/Error Messages
- **Success Messages**: Green notification with checkmark icon
- **Error Messages**: Red notification with alert icon
- **Auto-dismiss**: Success messages auto-navigate after 1.5s

### 3. Dark Mode Support
All UI elements fully support dark mode:
- Input fields: `bg-white dark:bg-gray-800`
- Text: `text-gray-900 dark:text-white`
- Borders: `border-gray-200 dark:border-gray-700`
- Hover states: Adapted for dark backgrounds

### 4. Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Touch-friendly buttons and inputs
- Optimized image preview sizes

---

## Profile Display Integration

The Profile page (`frontend/src/pages/Profile.jsx`) automatically reflects changes:

### Data Synchronization
```javascript
const { user } = useAuth();

const displayUser = user || {
  // Fallback mock data if user not loaded
};
```

### Real-time Updates
1. User edits profile and saves
2. `updateUserProfile` updates AuthContext state: `setUser(data.data)`
3. Profile component re-renders automatically (React reactivity)
4. Changes appear immediately without page reload

### Displayed Fields
- Profile picture (with avatar fallback)
- Username
- Full name (firstName + lastName)
- Bio (with line breaks preserved)
- Email (clickable mailto: link)
- Website (if provided)
- User stats (posts, followers, following)

---

## Error Handling

### Client-Side Validation
1. **Profile Picture**:
   - Max size: 5MB
   - Allowed types: image/jpeg, image/png, image/gif
   - Error shown for invalid files

2. **Bio**:
   - Max length: 500 characters
   - Character counter displayed

3. **Form Fields**:
   - Required fields validated on submit
   - Email format validation (HTML5)

### Backend Validation
Located in `backend/middleware/validationMiddleware.js`:

```javascript
validateProfileUpdate = [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),
  // ... more validations
];
```

### Error Messages
- Network errors: "Failed to fetch"
- Authentication errors: "Invalid token" / "Authentication required"
- Validation errors: Specific field errors from backend
- File errors: Size/type validation messages

---

## Database Schema

### User Model Fields (MongoDB)
```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  bio: { type: String, maxlength: 500 },
  website: String,
  phone: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  profilePicture: String,
  isPrivate: { type: Boolean, default: false },
  showActivityStatus: { type: Boolean, default: true },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    likes: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    follows: { type: Boolean, default: true }
  }
}, { timestamps: true });
```

---

## File Upload Configuration

### Multer Setup (Backend)
```javascript
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});
```

### Static File Serving
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

**Uploaded files accessible at**: `http://localhost:5000/uploads/<filename>`

---

## Testing Checklist

### Functional Testing
- [ ] Form loads with current user data
- [ ] All input fields are editable
- [ ] Profile picture preview works
- [ ] Image upload succeeds with valid file
- [ ] Image upload fails with invalid file (>5MB, non-image)
- [ ] Form submission updates all fields
- [ ] Success message appears on save
- [ ] Redirect to profile page after save
- [ ] Changes appear on profile page
- [ ] Error messages show for failed requests
- [ ] Cancel button navigates back to profile
- [ ] Dark mode styling works correctly

### Security Testing
- [ ] Unauthenticated users redirected to landing
- [ ] Invalid tokens rejected
- [ ] Users can only edit their own profile
- [ ] File type validation prevents non-images
- [ ] File size limit enforced (5MB)
- [ ] XSS protection in bio field

### Integration Testing
- [ ] AuthContext updates after profile save
- [ ] Profile page reflects changes immediately
- [ ] Token persists across page refreshes
- [ ] Logout clears user state

---

## Common Issues & Troubleshooting

### Issue: "Failed to fetch" error
**Cause**: Backend server not running or wrong port
**Solution**: 
- Ensure backend server is running on port 5000
- Check `VITE_API_BASE_URL` in frontend environment
- Verify no CORS issues

### Issue: "Invalid token" error
**Cause**: Token expired or malformed
**Solution**: 
- Log out and log in again
- Check JWT_SECRET matches between frontend/backend
- Verify token in localStorage

### Issue: Changes not appearing on profile
**Cause**: Profile page using mock data instead of AuthContext
**Solution**: 
- Verify Profile.jsx imports and uses `useAuth()`
- Check `displayUser` is set to `user` from context

### Issue: Profile picture not uploading
**Cause**: Missing uploads directory or incorrect permissions
**Solution**:
- Create `backend/uploads/` directory
- Check write permissions on directory
- Verify multer configuration

### Issue: Form fields not populating
**Cause**: useEffect dependency missing or user object null
**Solution**:
- Check `useEffect([user])` dependency array
- Verify user is loaded in AuthContext
- Check network tab for profile fetch request

---

## Performance Considerations

### 1. Image Optimization
- Client-side validation prevents large uploads
- Consider adding image compression before upload
- Lazy load profile images

### 2. Form Debouncing
- Character counter updates can be debounced
- Consider debouncing autosave for drafts

### 3. Lazy Loading
- EditProfile component lazy loaded: `lazy(() => import('./pages/EditProfile'))`
- Suspense fallback shows skeleton loader

---

## Future Enhancements

### Potential Features
1. **Image Cropping**: Allow users to crop profile pictures before upload
2. **Multiple Images**: Support for cover photos, galleries
3. **Auto-save**: Save draft changes automatically
4. **Change History**: Track profile edits with rollback option
5. **Email Verification**: Require verification for email changes
6. **Username Availability**: Real-time username availability check
7. **Social Links**: Add fields for social media profiles
8. **Profile Badges**: Display achievements, verification badges
9. **Privacy Controls**: Granular privacy settings per field
10. **Profile Preview**: See how profile appears to others

### Code Improvements
1. Extract form validation into custom hook
2. Create reusable ProfileImageUploader component
3. Implement optimistic UI updates
4. Add unit tests for form logic
5. Add E2E tests for complete flow
6. Implement proper loading skeletons
7. Add analytics tracking for profile updates

---

## Related Documentation
- [Authentication System](./AUTHENTICATION.md)
- [Backend API Reference](./API_REFERENCE.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Testing Infrastructure](./TESTING.md)

---

## Changelog

### v1.0.0 (2026-01-10)
- Initial implementation of Edit Profile feature
- Profile picture upload/delete functionality
- Full form with all user fields
- Integration with AuthContext
- Real-time profile updates
- Dark mode support
- Mobile responsive design
