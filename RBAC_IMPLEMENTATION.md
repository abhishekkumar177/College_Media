# Role-Based Access Control (RBAC) Implementation

**Issue #882** | Complete RBAC system with granular permissions and hierarchical roles

## 📋 Overview

This implementation replaces simple "admin" boolean checks with a robust, granular permission system. It enables dynamic roles (e.g., Moderator, Department Head, Student Leader) with specific capability scopes and hierarchical permission management.

## 🎯 Features

### Core Capabilities
- ✅ **Granular Permissions**: Fine-grained control with `resource:action` format
- ✅ **Hierarchical Roles**: Role levels determine management capabilities (0-100)
- ✅ **Permission Inheritance**: Roles can inherit from parent roles
- ✅ **Scope Control**: Permissions have scopes (own, department, all)
- ✅ **System Roles**: Protected roles that cannot be deleted
- ✅ **Dynamic Assignment**: Assign/revoke roles at runtime
- ✅ **UI Permission Gates**: Conditional rendering based on permissions
- ✅ **Admin Dashboard**: Visual role and permission management

### Security Features
- Role level hierarchy prevents privilege escalation
- Permission validation on every request
- System roles are protected from deletion/modification
- JWT-based authentication with permission caching
- Rate limiting on all role management endpoints

## 🏗️ Architecture

### Backend Structure

```
backend/
├── models/
│   ├── Permission.js      # Permission model with resource:action format
│   ├── Role.js            # Role model with hierarchical levels
│   └── User.js            # Updated with role reference
├── middleware/
│   └── checkPermission.js # Permission checking middleware
├── controllers/
│   └── roleController.js  # Role management endpoints
└── routes/
    └── roles.js           # Role API routes
```

### Frontend Structure

```
frontend/src/
├── context/
│   └── PermissionContext.tsx    # Permission state management
├── components/auth/
│   └── PermissionGate.tsx       # Conditional rendering component
├── pages/admin/
│   ├── RoleManager.tsx          # Role management dashboard
│   └── RoleManager.css          # Dashboard styling
└── hooks/
    └── usePermission.ts         # Permission hook
```

## 📊 Database Models

### Permission Model

```javascript
{
  name: "post:create",                    // Unique permission identifier
  displayName: "Create Posts",            // Human-readable name
  description: "Create new posts",        // Detailed description
  resource: "post",                       // Resource type (post, user, event, etc.)
  action: "create",                       // Action (create, read, update, delete, etc.)
  scope: "own",                           // Scope (own, department, all)
  category: "content",                    // Category for grouping
  isActive: true                          // Active status
}
```

### Role Model

```javascript
{
  name: "moderator",                      // Unique role identifier
  displayName: "Moderator",               // Human-readable name
  description: "Content moderator...",    // Role description
  permissions: [ObjectId],                // Array of permission IDs
  level: 40,                              // Hierarchical level (0-100)
  inheritsFrom: [ObjectId],               // Parent roles
  isSystemRole: true,                     // Protected system role
  color: "#50c878",                       // UI color code
  icon: "🛡️",                             // Display icon
  maxUsers: null                          // User limit (null = unlimited)
}
```

### User Model Update

```javascript
{
  // ... existing fields
  role: ObjectId,                         // Reference to Role model
  legacyRole: "user"                      // Deprecated field for backward compatibility
}
```

## 🔑 Permission System

### Permission Format

Permissions follow the `resource:action:scope` format:

```
post:create:own        # Create own posts
post:moderate:all      # Moderate any post
user:manage:all        # Manage all users
event:update:own       # Update own events
```

### Permission Categories

1. **Content**: post, event, comment operations
2. **User Management**: user profile operations
3. **Moderation**: report handling, content moderation
4. **Administration**: role management, system settings
5. **Analytics**: view and export analytics
6. **System**: system-wide management

### Default Permissions

**27 default permissions** covering:
- Posts: create, read, update, delete, moderate
- Users: read, update, delete, manage
- Events: create, read, update, delete, moderate
- Comments: create, update, delete, moderate
- Reports: create, read, manage
- Roles: read, manage
- Analytics: view_all, export
- System: manage

## 👥 Default Roles

### 1. User (Level 10)
- Basic content creation and interaction
- View public content
- Manage own profile
- Create reports

### 2. Student Leader (Level 30)
- All user permissions
- Event management capabilities
- Moderate own organization's events
- Enhanced visibility

### 3. Moderator (Level 40)
- Content moderation across platform
- Manage reports
- Moderate posts, events, comments
- View moderation analytics

### 4. Department Head (Level 60)
- Department-wide management
- User profile management
- Department analytics
- All moderator capabilities

### 5. Administrator (Level 100)
- Full system access
- Role and permission management
- System settings
- All permissions

## 🛡️ Middleware Usage

### Basic Permission Check

```javascript
// Require single permission
router.post('/posts',
  checkPermission('post:create'),
  postController.createPost
);

// Require any of multiple permissions
router.put('/posts/:id',
  checkPermission(['post:update', 'post:moderate']),
  postController.updatePost
);

// Require all permissions
router.delete('/posts/:id',
  checkPermission(['post:delete', 'post:moderate'], { requireAll: true }),
  postController.deletePost
);
```

### With Ownership Check

```javascript
// Check ownership + permission
router.put('/posts/:id',
  checkPermission('post:update', {
    checkOwnership: true,
    getResourceOwnerId: async (req) => {
      const post = await Post.findById(req.params.id);
      return post?.author;
    }
  }),
  postController.updatePost
);
```

### Role Level Check

```javascript
// Require minimum role level
router.get('/admin/analytics',
  checkRoleLevel(60),  // Department Head and above
  analyticsController.getAnalytics
);
```

### Load Permissions

```javascript
// Load permissions without enforcing (for conditional logic)
router.get('/posts',
  loadPermissions,
  (req, res) => {
    // req.userPermissions available
    // req.userRole available
  }
);
```

## 🎨 Frontend Usage

### PermissionGate Component

```tsx
// Single permission
<PermissionGate permission="post:create">
  <CreatePostButton />
</PermissionGate>

// Multiple permissions (ANY)
<PermissionGate permission={["post:update", "post:moderate"]}>
  <EditButton />
</PermissionGate>

// Multiple permissions (ALL required)
<PermissionGate permission={["post:update", "post:delete"]} requireAll>
  <AdminPanel />
</PermissionGate>

// Role level check
<PermissionGate minRoleLevel={40}>
  <ModeratorDashboard />
</PermissionGate>

// With fallback
<PermissionGate 
  permission="post:create" 
  fallback={<div>Access Denied</div>} 
  showFallback
>
  <CreatePostButton />
</PermissionGate>
```

### usePermission Hook

```tsx
import { usePermission } from '../hooks/usePermission';

function MyComponent() {
  const { 
    role,                    // Current user's role object
    permissions,             // Array of permission strings
    hasPermission,           // Check permission function
    hasRoleLevel,            // Check role level function
    canManageRole,           // Check management capability
    refreshPermissions       // Refresh permissions
  } = usePermission();

  const canCreate = hasPermission('post:create');
  const canModerate = hasPermission(['post:moderate', 'user:moderate']);
  const isAdmin = hasRoleLevel(100);
  const canManageUser = canManageRole(targetUserRoleLevel);

  return (
    <div>
      {canCreate && <CreateButton />}
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

## 📡 API Endpoints

### Role Management

```http
GET    /api/roles                     # Get all roles
GET    /api/roles/:roleId             # Get role by ID
POST   /api/roles                     # Create new role
PUT    /api/roles/:roleId             # Update role
DELETE /api/roles/:roleId             # Delete role
POST   /api/roles/assign              # Assign role to user
GET    /api/roles/:roleId/users       # Get users with role
POST   /api/roles/seed                # Seed default roles (admin only)
```

### Permission Management

```http
GET    /api/roles/permissions         # Get all permissions
GET    /api/roles/permissions?category=moderation
GET    /api/roles/permissions?resource=post
```

### Request Examples

**Create Role:**
```json
POST /api/roles
{
  "name": "content_creator",
  "displayName": "Content Creator",
  "description": "Professional content creator role",
  "level": 25,
  "permissions": ["permissionId1", "permissionId2"],
  "color": "#9b59b6",
  "icon": "✍️",
  "maxUsers": 50
}
```

**Assign Role:**
```json
POST /api/roles/assign
{
  "userId": "userId123",
  "roleId": "roleId456"
}
```

## 🎛️ Admin Dashboard Features

The RoleManager dashboard provides:

1. **Role Cards**: Visual display of all roles with:
   - Role icon and color
   - Level, permission count, user count
   - Edit/Delete actions
   - System role badge

2. **Role Creation/Editing**: Modal form with:
   - Basic info (name, display name, description)
   - Level selection (0-100)
   - Color picker and icon selector
   - Permission checkboxes grouped by category
   - Validation and error handling

3. **Permission Management**:
   - Grouped by category for easy navigation
   - Search and filter capabilities
   - Detailed permission descriptions
   - Visual indicators for selected permissions

4. **User Management**:
   - View users assigned to each role
   - Reassign roles
   - Bulk operations

## 🔒 Security Considerations

### Privilege Escalation Prevention
- Users cannot assign roles with level ≥ their own
- Role level hierarchy strictly enforced
- System roles cannot be deleted or have core properties modified

### Permission Validation
- Every request validates permissions
- Token-based authentication required
- Rate limiting on sensitive endpoints
- Audit logging for role changes

### Best Practices
- Always use `checkPermission` middleware on protected routes
- Use `PermissionGate` for UI elements requiring permissions
- Implement scope checks for resource-level permissions
- Regularly review and audit role assignments
- Use minimum required permission level

## 🚀 Migration Guide

### From Boolean Admin to RBAC

1. **Seed Default Roles**:
```bash
POST /api/roles/seed
Authorization: Bearer <admin-token>
```

2. **Migrate Existing Users**:
```javascript
// Backend migration script
const Role = require('./models/Role');
const User = require('./models/User');

async function migrateUsers() {
  const userRole = await Role.findOne({ name: 'user' });
  const adminRole = await Role.findOne({ name: 'admin' });
  const modRole = await Role.findOne({ name: 'moderator' });

  // Migrate admins
  await User.updateMany(
    { legacyRole: 'admin' },
    { role: adminRole._id }
  );

  // Migrate moderators
  await User.updateMany(
    { legacyRole: 'moderator' },
    { role: modRole._id }
  );

  // Migrate regular users
  await User.updateMany(
    { legacyRole: 'user' },
    { role: userRole._id }
  );
}
```

3. **Update Middleware**:
Replace:
```javascript
router.post('/admin/action', requireAdmin, handler);
```

With:
```javascript
router.post('/admin/action', checkPermission('resource:manage'), handler);
```

4. **Update Frontend**:
Replace:
```tsx
{user.role === 'admin' && <AdminButton />}
```

With:
```tsx
<PermissionGate permission="resource:manage">
  <AdminButton />
</PermissionGate>
```

## 🧪 Testing

### Test Permission Middleware
```javascript
// Test successful permission check
it('should allow user with permission', async () => {
  const req = { userId: userWithPermission._id };
  await checkPermission('post:create')(req, res, next);
  expect(next).toHaveBeenCalled();
});

// Test denied permission
it('should deny user without permission', async () => {
  const req = { userId: userWithoutPermission._id };
  await checkPermission('post:moderate')(req, res, next);
  expect(res.status).toHaveBeenCalledWith(403);
});
```

### Test Permission Gate
```tsx
it('renders children when permission granted', () => {
  render(
    <PermissionProvider>
      <PermissionGate permission="post:create">
        <div>Protected Content</div>
      </PermissionGate>
    </PermissionProvider>
  );
  expect(screen.getByText('Protected Content')).toBeInTheDocument();
});
```

## 📈 Performance Optimization

- Permission caching in AuthContext
- Lazy loading of PermissionProvider
- Indexed database queries on role/permission lookups
- Efficient permission inheritance resolution
- Minimal re-renders with React.memo

## 🐛 Troubleshooting

### Common Issues

**Issue**: Permissions not loading
- **Solution**: Check AuthContext is properly set up and token is valid

**Issue**: PermissionGate not hiding content
- **Solution**: Ensure PermissionProvider wraps your app and permissions have loaded

**Issue**: Cannot create/edit roles
- **Solution**: Verify user has `role:manage` permission and role level is sufficient

**Issue**: Users not seeing updated permissions
- **Solution**: Call `refreshPermissions()` after role assignment

## 📝 TODO / Future Enhancements

- [ ] Permission templates for common role configurations
- [ ] Bulk role assignment
- [ ] Role expiration/time-based permissions
- [ ] Audit log viewer in dashboard
- [ ] Permission request/approval workflow
- [ ] Custom permission creation from UI
- [ ] Role analytics and usage statistics
- [ ] Export/import role configurations

## 📚 References

- NIST RBAC Standard: https://csrc.nist.gov/projects/role-based-access-control
- OWASP Access Control Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html

---

**Implementation Date**: January 2026  
**Issue**: #882  
**Status**: ✅ Complete and Ready for Review
