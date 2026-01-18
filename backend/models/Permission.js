const mongoose = require('mongoose');

/**
 * Permission Model
 * Represents individual capabilities in the system
 * Issue #882: RBAC Implementation
 */
const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Format: resource:action (e.g., 'post:create', 'user:delete', 'event:moderate')
    match: /^[a-z]+:[a-z_]+$/,
    description: 'Permission name in format resource:action'
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    description: 'Human-readable permission name'
  },
  description: {
    type: String,
    required: true,
    description: 'Detailed description of what this permission allows'
  },
  resource: {
    type: String,
    required: true,
    enum: ['post', 'user', 'event', 'comment', 'message', 'report', 'role', 'setting', 'analytics', 'system'],
    description: 'The resource this permission applies to'
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'moderate', 'manage', 'view_all', 'export'],
    description: 'The action allowed by this permission'
  },
  scope: {
    type: String,
    enum: ['own', 'department', 'all'],
    default: 'own',
    description: 'Scope of the permission: own (only own resources), department (department resources), all (system-wide)'
  },
  isActive: {
    type: Boolean,
    default: true,
    description: 'Whether this permission is currently active'
  },
  category: {
    type: String,
    enum: ['content', 'user_management', 'moderation', 'administration', 'analytics', 'system'],
    required: true,
    description: 'Category for grouping permissions in UI'
  }
}, {
  timestamps: true
});

// Indexes
permissionSchema.index({ name: 1 });
permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ category: 1 });
permissionSchema.index({ isActive: 1 });

// Virtual for full permission string
permissionSchema.virtual('fullPermission').get(function() {
  return `${this.resource}:${this.action}:${this.scope}`;
});

// Methods
permissionSchema.methods.toJSON = function() {
  const permission = this.toObject();
  permission.fullPermission = this.fullPermission;
  return permission;
};

// Statics
permissionSchema.statics.findByResource = function(resource) {
  return this.find({ resource, isActive: true });
};

permissionSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

permissionSchema.statics.seedDefaultPermissions = async function() {
  const defaultPermissions = [
    // Post Permissions
    { name: 'post:create', displayName: 'Create Posts', description: 'Create new posts', resource: 'post', action: 'create', scope: 'own', category: 'content' },
    { name: 'post:read', displayName: 'Read Posts', description: 'View posts', resource: 'post', action: 'read', scope: 'all', category: 'content' },
    { name: 'post:update', displayName: 'Update Posts', description: 'Edit posts', resource: 'post', action: 'update', scope: 'own', category: 'content' },
    { name: 'post:delete', displayName: 'Delete Posts', description: 'Delete posts', resource: 'post', action: 'delete', scope: 'own', category: 'content' },
    { name: 'post:moderate', displayName: 'Moderate Posts', description: 'Moderate any post', resource: 'post', action: 'moderate', scope: 'all', category: 'moderation' },
    
    // User Permissions
    { name: 'user:read', displayName: 'View Users', description: 'View user profiles', resource: 'user', action: 'read', scope: 'all', category: 'user_management' },
    { name: 'user:update', displayName: 'Update Users', description: 'Edit user profiles', resource: 'user', action: 'update', scope: 'own', category: 'user_management' },
    { name: 'user:delete', displayName: 'Delete Users', description: 'Delete user accounts', resource: 'user', action: 'delete', scope: 'all', category: 'user_management' },
    { name: 'user:manage', displayName: 'Manage Users', description: 'Full user management', resource: 'user', action: 'manage', scope: 'all', category: 'administration' },
    
    // Event Permissions
    { name: 'event:create', displayName: 'Create Events', description: 'Create new events', resource: 'event', action: 'create', scope: 'own', category: 'content' },
    { name: 'event:read', displayName: 'View Events', description: 'View events', resource: 'event', action: 'read', scope: 'all', category: 'content' },
    { name: 'event:update', displayName: 'Update Events', description: 'Edit events', resource: 'event', action: 'update', scope: 'own', category: 'content' },
    { name: 'event:delete', displayName: 'Delete Events', description: 'Delete events', resource: 'event', action: 'delete', scope: 'own', category: 'content' },
    { name: 'event:moderate', displayName: 'Moderate Events', description: 'Moderate any event', resource: 'event', action: 'moderate', scope: 'all', category: 'moderation' },
    
    // Comment Permissions
    { name: 'comment:create', displayName: 'Create Comments', description: 'Post comments', resource: 'comment', action: 'create', scope: 'own', category: 'content' },
    { name: 'comment:update', displayName: 'Update Comments', description: 'Edit comments', resource: 'comment', action: 'update', scope: 'own', category: 'content' },
    { name: 'comment:delete', displayName: 'Delete Comments', description: 'Delete comments', resource: 'comment', action: 'delete', scope: 'own', category: 'content' },
    { name: 'comment:moderate', displayName: 'Moderate Comments', description: 'Moderate any comment', resource: 'comment', action: 'moderate', scope: 'all', category: 'moderation' },
    
    // Report Permissions
    { name: 'report:create', displayName: 'Create Reports', description: 'Report content', resource: 'report', action: 'create', scope: 'own', category: 'moderation' },
    { name: 'report:read', displayName: 'View Reports', description: 'View reports', resource: 'report', action: 'read', scope: 'all', category: 'moderation' },
    { name: 'report:manage', displayName: 'Manage Reports', description: 'Handle reports', resource: 'report', action: 'manage', scope: 'all', category: 'moderation' },
    
    // Role Permissions
    { name: 'role:read', displayName: 'View Roles', description: 'View roles and permissions', resource: 'role', action: 'read', scope: 'all', category: 'administration' },
    { name: 'role:manage', displayName: 'Manage Roles', description: 'Create and modify roles', resource: 'role', action: 'manage', scope: 'all', category: 'administration' },
    
    // Analytics Permissions
    { name: 'analytics:view_all', displayName: 'View Analytics', description: 'View system analytics', resource: 'analytics', action: 'view_all', scope: 'all', category: 'analytics' },
    { name: 'analytics:export', displayName: 'Export Analytics', description: 'Export analytics data', resource: 'analytics', action: 'export', scope: 'all', category: 'analytics' },
    
    // System Permissions
    { name: 'system:manage', displayName: 'System Management', description: 'Manage system settings', resource: 'system', action: 'manage', scope: 'all', category: 'administration' }
  ];

  for (const permission of defaultPermissions) {
    await this.findOneAndUpdate(
      { name: permission.name },
      permission,
      { upsert: true, new: true }
    );
  }

  console.log('✅ Default permissions seeded successfully');
};

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
