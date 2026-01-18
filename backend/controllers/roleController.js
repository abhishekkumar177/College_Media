const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Role Controller - Manage roles and permissions
 * Issue #882: RBAC Implementation
 */
class RoleController {
  /**
   * Get all roles
   * GET /api/roles
   */
  static async getAllRoles(req, res) {
    try {
      const roles = await Role.find({ isActive: true })
        .populate('permissions')
        .populate('inheritsFrom', 'name displayName')
        .sort({ level: -1 });

      // Get user count for each role
      const rolesWithCount = await Promise.all(
        roles.map(async (role) => {
          const userCount = await User.countDocuments({ role: role._id });
          return {
            ...role.toJSON(),
            userCount
          };
        })
      );

      res.json({
        success: true,
        data: rolesWithCount
      });
    } catch (error) {
      logger.error('Get all roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch roles'
      });
    }
  }

  /**
   * Get role by ID
   * GET /api/roles/:roleId
   */
  static async getRoleById(req, res) {
    try {
      const { roleId } = req.params;

      const role = await Role.findById(roleId)
        .populate('permissions')
        .populate('inheritsFrom');

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      const userCount = await User.countDocuments({ role: role._id });

      res.json({
        success: true,
        data: {
          ...role.toJSON(),
          userCount
        }
      });
    } catch (error) {
      logger.error('Get role by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch role'
      });
    }
  }

  /**
   * Create new role
   * POST /api/roles
   */
  static async createRole(req, res) {
    try {
      const {
        name,
        displayName,
        description,
        permissions,
        level,
        inheritsFrom,
        color,
        icon,
        maxUsers
      } = req.body;

      // Validate required fields
      if (!name || !displayName || !description || level === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Name, displayName, description, and level are required'
        });
      }

      // Check if role name already exists
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        return res.status(409).json({
          success: false,
          message: 'Role with this name already exists'
        });
      }

      // Validate permissions exist
      if (permissions && permissions.length > 0) {
        const validPermissions = await Permission.find({
          _id: { $in: permissions }
        });

        if (validPermissions.length !== permissions.length) {
          return res.status(400).json({
            success: false,
            message: 'Some permissions are invalid'
          });
        }
      }

      // Create role
      const role = new Role({
        name,
        displayName,
        description,
        permissions: permissions || [],
        level,
        inheritsFrom: inheritsFrom || [],
        color: color || '#667eea',
        icon: icon || '👤',
        maxUsers: maxUsers || null
      });

      await role.save();
      await role.populate('permissions inheritsFrom');

      logger.info(`Role created: ${role.name} by user ${req.userId}`);

      res.status(201).json({
        success: true,
        data: role,
        message: 'Role created successfully'
      });
    } catch (error) {
      logger.error('Create role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create role'
      });
    }
  }

  /**
   * Update role
   * PUT /api/roles/:roleId
   */
  static async updateRole(req, res) {
    try {
      const { roleId } = req.params;
      const {
        displayName,
        description,
        permissions,
        level,
        inheritsFrom,
        color,
        icon,
        maxUsers,
        isActive
      } = req.body;

      const role = await Role.findById(roleId);

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      // Prevent modification of system roles' core properties
      if (role.isSystemRole && (level !== undefined || permissions)) {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify core properties of system roles'
        });
      }

      // Validate permissions if provided
      if (permissions && permissions.length > 0) {
        const validPermissions = await Permission.find({
          _id: { $in: permissions }
        });

        if (validPermissions.length !== permissions.length) {
          return res.status(400).json({
            success: false,
            message: 'Some permissions are invalid'
          });
        }
      }

      // Update fields
      if (displayName !== undefined) role.displayName = displayName;
      if (description !== undefined) role.description = description;
      if (permissions !== undefined) role.permissions = permissions;
      if (level !== undefined && !role.isSystemRole) role.level = level;
      if (inheritsFrom !== undefined) role.inheritsFrom = inheritsFrom;
      if (color !== undefined) role.color = color;
      if (icon !== undefined) role.icon = icon;
      if (maxUsers !== undefined) role.maxUsers = maxUsers;
      if (isActive !== undefined) role.isActive = isActive;

      await role.save();
      await role.populate('permissions inheritsFrom');

      logger.info(`Role updated: ${role.name} by user ${req.userId}`);

      res.json({
        success: true,
        data: role,
        message: 'Role updated successfully'
      });
    } catch (error) {
      logger.error('Update role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update role'
      });
    }
  }

  /**
   * Delete role
   * DELETE /api/roles/:roleId
   */
  static async deleteRole(req, res) {
    try {
      const { roleId } = req.params;

      const role = await Role.findById(roleId);

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      // Prevent deletion of system roles
      if (role.isSystemRole) {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete system roles'
        });
      }

      // Check if any users have this role
      const userCount = await User.countDocuments({ role: roleId });
      if (userCount > 0) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete role: ${userCount} users still have this role`,
          userCount
        });
      }

      await role.deleteOne();

      logger.info(`Role deleted: ${role.name} by user ${req.userId}`);

      res.json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (error) {
      logger.error('Delete role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete role'
      });
    }
  }

  /**
   * Get all permissions
   * GET /api/roles/permissions
   */
  static async getAllPermissions(req, res) {
    try {
      const { category, resource } = req.query;

      const query = { isActive: true };
      if (category) query.category = category;
      if (resource) query.resource = resource;

      const permissions = await Permission.find(query).sort({ category: 1, resource: 1, action: 1 });

      // Group by category
      const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.category]) {
          acc[perm.category] = [];
        }
        acc[perm.category].push(perm);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          permissions,
          grouped: groupedPermissions
        }
      });
    } catch (error) {
      logger.error('Get all permissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch permissions'
      });
    }
  }

  /**
   * Assign role to user
   * POST /api/roles/assign
   */
  static async assignRole(req, res) {
    try {
      const { userId, roleId } = req.body;

      if (!userId || !roleId) {
        return res.status(400).json({
          success: false,
          message: 'userId and roleId are required'
        });
      }

      const user = await User.findById(userId).populate('role');
      const role = await Role.findById(roleId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      // Check if role has maxUsers limit
      if (role.maxUsers) {
        const currentCount = await User.countDocuments({ role: roleId });
        if (currentCount >= role.maxUsers) {
          return res.status(409).json({
            success: false,
            message: `Role has reached maximum user limit (${role.maxUsers})`
          });
        }
      }

      // Check if assigning user can manage target role level
      if (req.userRole && role.level >= req.userRole.level) {
        return res.status(403).json({
          success: false,
          message: 'Cannot assign role with equal or higher level than your own'
        });
      }

      user.role = roleId;
      await user.save();

      logger.info(`Role assigned: ${role.name} to user ${user.username} by ${req.userId}`);

      res.json({
        success: true,
        message: 'Role assigned successfully',
        data: {
          userId: user._id,
          username: user.username,
          role: role.name,
          roleDisplayName: role.displayName
        }
      });
    } catch (error) {
      logger.error('Assign role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign role'
      });
    }
  }

  /**
   * Get users by role
   * GET /api/roles/:roleId/users
   */
  static async getUsersByRole(req, res) {
    try {
      const { roleId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [users, total] = await Promise.all([
        User.find({ role: roleId })
          .select('username email firstName lastName profilePicture isActive createdAt')
          .skip(skip)
          .limit(parseInt(limit))
          .sort({ createdAt: -1 }),
        User.countDocuments({ role: roleId })
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          },
          role: {
            _id: role._id,
            name: role.name,
            displayName: role.displayName
          }
        }
      });
    } catch (error) {
      logger.error('Get users by role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  /**
   * Initialize default roles and permissions
   * POST /api/roles/seed
   */
  static async seedDefaults(req, res) {
    try {
      // Only allow admins to seed
      if (!req.userRole || req.userRole.level < 100) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can seed default data'
        });
      }

      await Permission.seedDefaultPermissions();
      await Role.seedDefaultRoles();

      res.json({
        success: true,
        message: 'Default roles and permissions seeded successfully'
      });
    } catch (error) {
      logger.error('Seed defaults error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to seed default data'
      });
    }
  }
}

module.exports = RoleController;
