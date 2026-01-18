const mongoose = require('mongoose');

/**
 * Role Model
 * Represents user roles with associated permissions
 * Issue #882: RBAC Implementation
 */
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    description: 'Unique role name'
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    description: 'Human-readable role name'
  },
  description: {
    type: String,
    required: true,
    description: 'Detailed description of the role'
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    description: 'Array of permission IDs'
  }],
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    description: 'Hierarchical level (0=lowest, 100=highest). Used for permission inheritance'
  },
  inheritsFrom: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    description: 'Parent roles to inherit permissions from'
  }],
  isSystemRole: {
    type: Boolean,
    default: false,
    description: 'System roles cannot be deleted or have their core permissions modified'
  },
  isActive: {
    type: Boolean,
    default: true,
    description: 'Whether this role is currently active'
  },
  color: {
    type: String,
    default: '#667eea',
    description: 'Color code for UI display'
  },
  icon: {
    type: String,
    default: '👤',
    description: 'Emoji icon for UI display'
  },
  maxUsers: {
    type: Number,
    default: null,
    description: 'Maximum number of users that can have this role (null = unlimited)'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    description: 'Additional role metadata'
  }
}, {
  timestamps: true
});

// Indexes
roleSchema.index({ name: 1 });
roleSchema.index({ level: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ isSystemRole: 1 });

// Virtuals
roleSchema.virtual('userCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'role',
  count: true
});

// Methods
roleSchema.methods.getAllPermissions = async function() {
  await this.populate('permissions inheritsFrom');
  
  const allPermissions = new Set();
  
  // Add own permissions
  this.permissions.forEach(p => allPermissions.add(p._id.toString()));
  
  // Add inherited permissions
  if (this.inheritsFrom && this.inheritsFrom.length > 0) {
    for (const parentRole of this.inheritsFrom) {
      const parentPermissions = await parentRole.getAllPermissions();
      parentPermissions.forEach(p => allPermissions.add(p));
    }
  }
  
  return Array.from(allPermissions);
};

roleSchema.methods.hasPermission = async function(permissionName) {
  await this.populate('permissions');
  
  // Check direct permissions
  const hasDirectPermission = this.permissions.some(p => p.name === permissionName);
  if (hasDirectPermission) return true;
  
  // Check inherited permissions
  if (this.inheritsFrom && this.inheritsFrom.length > 0) {
    await this.populate('inheritsFrom');
    for (const parentRole of this.inheritsFrom) {
      const hasInheritedPermission = await parentRole.hasPermission(permissionName);
      if (hasInheritedPermission) return true;
    }
  }
  
  return false;
};

roleSchema.methods.canManageRole = function(targetRole) {
  // Higher level roles can manage lower level roles
  return this.level > targetRole.level;
};

roleSchema.methods.toJSON = function() {
  const role = this.toObject({ virtuals: true });
  return role;
};

// Statics
roleSchema.statics.findByLevel = function(minLevel, maxLevel = 100) {
  return this.find({ 
    level: { $gte: minLevel, $lte: maxLevel },
    isActive: true 
  }).populate('permissions');
};

roleSchema.statics.seedDefaultRoles = async function() {
  const Permission = mongoose.model('Permission');
  
  // Get all permissions
  const allPermissions = await Permission.find({ isActive: true });
  const permissionMap = {};
  allPermissions.forEach(p => {
    permissionMap[p.name] = p._id;
  });

  const defaultRoles = [
    {
      name: 'user',
      displayName: 'User',
      description: 'Standard user with basic permissions',
      level: 10,
      isSystemRole: true,
      color: '#667eea',
      icon: '👤',
      permissions: [
        'post:create', 'post:read', 'post:update', 'post:delete',
        'user:read', 'user:update',
        'event:read', 'event:create', 'event:update', 'event:delete',
        'comment:create', 'comment:update', 'comment:delete',
        'report:create'
      ].map(p => permissionMap[p]).filter(Boolean)
    },
    {
      name: 'moderator',
      displayName: 'Moderator',
      description: 'Content moderator with enhanced permissions',
      level: 40,
      isSystemRole: true,
      color: '#50c878',
      icon: '🛡️',
      permissions: [
        'post:create', 'post:read', 'post:update', 'post:delete', 'post:moderate',
        'user:read',
        'event:read', 'event:create', 'event:update', 'event:delete', 'event:moderate',
        'comment:create', 'comment:update', 'comment:delete', 'comment:moderate',
        'report:create', 'report:read', 'report:manage'
      ].map(p => permissionMap[p]).filter(Boolean)
    },
    {
      name: 'department_head',
      displayName: 'Department Head',
      description: 'Department-level administrative access',
      level: 60,
      isSystemRole: false,
      color: '#ffa500',
      icon: '🏛️',
      permissions: [
        'post:create', 'post:read', 'post:update', 'post:delete', 'post:moderate',
        'user:read', 'user:update',
        'event:read', 'event:create', 'event:update', 'event:delete', 'event:moderate',
        'comment:create', 'comment:update', 'comment:delete', 'comment:moderate',
        'report:create', 'report:read', 'report:manage',
        'analytics:view_all'
      ].map(p => permissionMap[p]).filter(Boolean)
    },
    {
      name: 'student_leader',
      displayName: 'Student Leader',
      description: 'Student organization leader with event management capabilities',
      level: 30,
      isSystemRole: false,
      color: '#9b59b6',
      icon: '⭐',
      permissions: [
        'post:create', 'post:read', 'post:update', 'post:delete',
        'user:read',
        'event:read', 'event:create', 'event:update', 'event:delete', 'event:moderate',
        'comment:create', 'comment:update', 'comment:delete',
        'report:create'
      ].map(p => permissionMap[p]).filter(Boolean)
    },
    {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Full system access with all permissions',
      level: 100,
      isSystemRole: true,
      color: '#e74c3c',
      icon: '👑',
      permissions: allPermissions.map(p => p._id)
    }
  ];

  for (const role of defaultRoles) {
    await this.findOneAndUpdate(
      { name: role.name },
      role,
      { upsert: true, new: true }
    );
  }

  console.log('✅ Default roles seeded successfully');
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
