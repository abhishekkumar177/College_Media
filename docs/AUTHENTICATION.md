# Authentication - Login & Signup

## Overview

The College Media platform implements a comprehensive authentication system with JWT-based token authentication, allowing users to register new accounts and securely log in to access the platform.

## Features

### Signup
- 📝 **Complete User Profiles** - Username, first name, last name, email, password
- 🔐 **Secure Password Storage** - bcrypt hashing with 10 salt rounds
- ✅ **Input Validation** - Server-side and client-side validation
- 🚫 **Duplicate Prevention** - Email and username uniqueness checks
- 🎨 **Social Signup UI** - Google/Facebook buttons (UI only)
- 📱 **Responsive Design** - Mobile-friendly forms

### Login
- 🔑 **Email/Password Authentication** - Secure credential verification
- 👁️ **Password Visibility Toggle** - Show/hide password option
- 💾 **Remember Me** - Option to persist login session
- 🔗 **Forgot Password Link** - Easy password recovery access
- 🎨 **Social Login UI** - Google/Facebook buttons (UI only)
- 🔄 **Automatic Redirect** - Navigate to home after successful login

### Common Features
- 🔒 **JWT Token Management** - 7-day token expiration
- 💾 **LocalStorage Persistence** - Token and user data stored locally
- 🎯 **Error Handling** - Clear error messages with toast notifications
- ⚡ **Loading States** - Visual feedback during API calls
- 🎨 **Modern UI/UX** - Gradient backgrounds, rounded corners, shadows

## User Flows

### Signup Flow
```
Landing Page → Click "Sign up" → Signup Form → Fill Details → Submit → 
Backend Validation → Create User → Generate JWT → Store Token → 
Redirect to /home
```

### Login Flow
```
Landing Page → Click "Log In" → Login Form → Enter Credentials → Submit → 
Backend Validation → Verify Password → Generate JWT → Store Token → 
Redirect to /home
```

## Technical Implementation

### File Structure

```
backend/
├── routes/
│   └── auth.js              # Authentication endpoints
├── models/
│   └── User.js              # MongoDB user schema
├── mockdb/
│   ├── userDB.js           # File-based user storage
│   └── users.json          # User data file
└── middleware/
    └── validationMiddleware.js  # Input validation

frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx       # Login page component
│   │   └── Signup.jsx      # Signup page component
│   └── services/
│       └── authService.js  # API integration
```

## Backend Implementation

### API Endpoints

#### 1. User Registration

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@college.edu",
  "firstName": "John",
  "lastName": "Doe",
  "password": "securePassword123"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@college.edu",
    "firstName": "John",
    "lastName": "Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "data": null,
  "message": "User with this email or username already exists"
}
```

**Validation Rules:**
- Username: Required, alphanumeric
- Email: Required, valid email format, college domain preferred
- Password: Required, minimum 6 characters
- First Name: Required
- Last Name: Required

**Implementation:**
```javascript
router.post('/register', validateRegister, checkValidation, async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;
  
  // Check for existing user
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }] 
  });
  
  if (existingUser) {
    return res.status(400).json({ 
      success: false,
      message: 'User with this email or username already exists' 
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    firstName,
    lastName
  });

  await newUser.save();

  // Generate JWT token
  const token = jwt.sign(
    { userId: newUser._id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    data: { ...user, token },
    message: 'User registered successfully'
  });
});
```

#### 2. User Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@college.edu",
  "password": "securePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@college.edu",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": "https://...",
    "bio": "Computer Science Student",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "data": null,
  "message": "Invalid credentials"
}
```

**Implementation:**
```javascript
router.post('/login', validateLogin, checkValidation, async (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid credentials' 
    });
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid credentials' 
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    data: { ...user, token },
    message: 'Login successful'
  });
});
```

### Database Schema

#### MongoDB User Model

```javascript
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  bio: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

#### File-Based Storage (Mock DB)

```javascript
// mockdb/userDB.js
const users = require('./users.json');

module.exports = {
  create: async (userData) => {
    // Check for duplicates
    const existingUser = users.find(
      u => u.email === userData.email || u.username === userData.username
    );
    
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create new user
    const newUser = {
      id: generateId(),
      ...userData,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await fs.writeFile('./users.json', JSON.stringify(users, null, 2));
    
    return newUser;
  },

  findByEmail: async (email) => {
    return users.find(u => u.email === email);
  }
};
```

### Validation Middleware

```javascript
const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};
```

## Frontend Implementation

### Signup Page Component

**File:** `frontend/src/pages/Signup.jsx`

#### Key Features

**State Management:**
```javascript
const [formData, setFormData] = useState({
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  confirmPassword: "",
});
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [loading, setLoading] = useState(false);
```

**Form Validation:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Client-side validation
  if (formData.password !== formData.confirmPassword) {
    toast.error("Passwords don't match!");
    return;
  }

  if (formData.password.length < 6) {
    toast.error("Password must be at least 6 characters long");
    return;
  }

  // API call
  const { confirmPassword, ...registerData } = formData;
  const response = await authAPI.register(registerData);
  
  if (response.success) {
    toast.success(response.message);
    navigate("/home");
  }
};
```

**Form Fields:**
- Username (alphanumeric, unique)
- First Name
- Last Name
- Email (college email preferred)
- Password (min 6 characters, visibility toggle)
- Confirm Password (must match)
- Terms & Conditions checkbox

**UI Components:**
- Gradient background
- White card with rounded corners
- Icon inputs (User, Mail, Lock icons)
- Password strength indicator (future enhancement)
- Social signup buttons (Google/Facebook)
- Link to login page

### Login Page Component

**File:** `frontend/src/pages/Login.jsx`

#### Key Features

**State Management:**
```javascript
const [formData, setFormData] = useState({
  email: "",
  password: "",
});
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
```

**Authentication:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const response = await authAPI.login(formData);
    
    if (response.success) {
      toast.success(response.message || "Login successful!");
      navigate("/home");
    } else {
      toast.error(response.message || "Login failed");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};
```

**Form Fields:**
- Email
- Password (visibility toggle)
- Remember me checkbox
- Forgot password link

**UI Components:**
- Gradient background
- White card with rounded corners
- Icon inputs (Mail, Lock icons)
- Show/hide password toggle
- Social login buttons (Google/Facebook)
- Link to signup page

### Auth Service

**File:** `frontend/src/services/authService.js`

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check authentication status
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
```

## Routing Configuration

### Frontend Routes

**File:** `frontend/src/App.jsx`

```javascript
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  
  {/* Protected Routes */}
  <Route path="/home/*" element={<ProtectedRoute><Home /></ProtectedRoute>}>
    <Route path="" element={<Feed />} />
    <Route path="profile" element={<Profile />} />
    {/* ... more routes */}
  </Route>
</Routes>
```

### Protected Route Component (Future Enhancement)

```javascript
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
```

## Security Features

### Password Security

**Hashing:**
- bcrypt with 10 salt rounds
- Never store plain text passwords
- Hash generated during registration

```javascript
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

**Verification:**
```javascript
const isMatch = await bcrypt.compare(password, user.password);
```

### JWT Token Security

**Token Structure:**
```javascript
{
  "userId": "507f1f77bcf86cd799439011",
  "iat": 1704835200,  // Issued at
  "exp": 1705440000   // Expires in 7 days
}
```

**Token Generation:**
```javascript
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Token Verification:**
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Input Validation

**Client-Side:**
- HTML5 validation (required, email, minlength)
- Custom validation (password match, strength)
- Real-time feedback

**Server-Side:**
- express-validator middleware
- Sanitization (trim, normalize)
- Type checking
- Length constraints

### Security Best Practices

1. ✅ **Password Requirements** - Minimum 6 characters (consider increasing to 8+)
2. ✅ **Unique Constraints** - Email and username uniqueness
3. ✅ **Error Messages** - Generic "Invalid credentials" to prevent user enumeration
4. ✅ **HTTPS Only** - All authentication endpoints should use HTTPS in production
5. ✅ **Token Expiration** - 7-day JWT expiration
6. ✅ **LocalStorage** - Token stored in localStorage (consider httpOnly cookies for production)

## Testing

### Manual Testing

#### Signup Flow Test

1. **Navigate to Signup:**
   - Go to `http://localhost:5173/signup`
   - Verify page loads correctly

2. **Form Validation:**
   - Try submitting empty form → Should show validation errors
   - Enter mismatched passwords → Should show error
   - Enter short password (< 6 chars) → Should show error

3. **Successful Signup:**
   - Fill all fields with valid data
   - Click "Create Account"
   - Should show success toast
   - Should redirect to `/home`
   - Check localStorage for token and user data

4. **Duplicate Prevention:**
   - Try signing up with same email/username
   - Should show error message

#### Login Flow Test

1. **Navigate to Login:**
   - Go to `http://localhost:5173/login`
   - Verify page loads correctly

2. **Invalid Credentials:**
   - Enter wrong email → Should show "Invalid credentials"
   - Enter wrong password → Should show "Invalid credentials"

3. **Successful Login:**
   - Enter valid credentials
   - Click "Log In"
   - Should show success toast
   - Should redirect to `/home`
   - Check localStorage for token and user data

4. **Password Visibility:**
   - Click eye icon → Password should toggle visibility

### Automated Testing (Future)

```javascript
// Example test with Jest + React Testing Library
describe('Login Component', () => {
  it('should login successfully with valid credentials', async () => {
    render(<Login />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@college.edu' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeTruthy();
    });
  });
});
```

## Configuration

### Environment Variables

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/college_media
JWT_SECRET=your_very_secure_secret_key_here
PORT=5000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

### Production Configuration

**Backend:**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/college_media
JWT_SECRET=use_strong_random_secret_at_least_32_chars
PORT=5000
NODE_ENV=production
```

**Frontend:**
```env
VITE_API_URL=https://api.collegemedia.com/api
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "data": null,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "User already exists" | Duplicate email/username | Use different credentials |
| "Invalid credentials" | Wrong email/password | Check credentials |
| "Validation error" | Invalid input format | Fix input and retry |
| "Token expired" | JWT expired (>7 days) | Login again |
| "Network error" | Backend not running | Start backend server |

## UI/UX Design

### Color Scheme

- **Primary:** `#e8684a` (Coral/Orange)
- **Gradient:** `from-pink-50 via-purple-50 to-orange-50`
- **Text:** `#1f2937` (Dark Gray)
- **Border:** `#d1d5db` (Light Gray)
- **Background:** White cards on gradient background

### Typography

- **Headings:** Bold, 28-36px
- **Body:** Regular, 16px
- **Labels:** Medium, 14px
- **Buttons:** Semibold, 16px

### Responsive Design

- **Mobile:** Single column, full width
- **Tablet:** Centered card, max-width 500px
- **Desktop:** Centered card, max-width 500px

## Production Recommendations

### 1. Password Requirements

Strengthen password requirements:
```javascript
// Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
```

### 2. Rate Limiting

Prevent brute force attacks:
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

router.post('/login', loginLimiter, ...);
```

### 3. Email Verification

Require email verification before allowing login:
```javascript
// Add to User model
emailVerified: {
  type: Boolean,
  default: false
}

// Send verification email after signup
await sendVerificationEmail(user.email, verificationToken);
```

### 4. Two-Factor Authentication (2FA)

Add optional 2FA for enhanced security:
```javascript
// Using speakeasy for TOTP
const secret = speakeasy.generateSecret();
const token = speakeasy.totp({
  secret: secret.base32,
  encoding: 'base32'
});
```

### 5. Session Management

Implement refresh tokens:
```javascript
// Generate access token (15 min) and refresh token (7 days)
const accessToken = jwt.sign({ userId }, SECRET, { expiresIn: '15m' });
const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
```

### 6. Audit Logging

Log authentication events:
```javascript
// Log successful login
logger.info('User logged in', {
  userId: user._id,
  email: user.email,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  timestamp: new Date()
});
```

## Future Enhancements

- [ ] Email verification after signup
- [ ] Two-factor authentication (2FA)
- [ ] Social authentication (Google, Facebook OAuth)
- [ ] Password strength meter
- [ ] Account lockout after failed attempts
- [ ] Session management with refresh tokens
- [ ] "Remember me" functionality with longer tokens
- [ ] Profile completion wizard after signup
- [ ] Welcome email after registration
- [ ] Login notification emails
- [ ] Device management (view active sessions)
- [ ] Account deletion/deactivation

## Related Documentation

- [Forgot Password Flow](./FORGOT_PASSWORD.md)
- [API Reference](./API_REFERENCE.md)
- [Backend Architecture](./BACKEND_PROPOSAL.md)
- [Security Best Practices](./SECURITY.md)

## Support

For issues or questions:
- 📧 Email: support@collegemedia.com
- 💬 Slack: #auth-support
- 🐛 GitHub Issues: [Report Bug](https://github.com/collegemedia/issues)

---

**Last Updated:** January 9, 2026  
**Version:** 1.0.0  
**Author:** College Media Development Team
