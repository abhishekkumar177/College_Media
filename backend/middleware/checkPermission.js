const Role = require('../models/Role');
const Permission = require('../models/Permission');
const logger = require('../utils/logger');

/**
 * RBAC Middleware - Permission Checking
 * Issue #882: Role-Based Access Control System
 */

/**
 * Check if user has specific permission
 * @param {string|string[]} requiredPermission - Permission name(s) required (e.g., 'post:create' or ['post:create', 'post:update'])
 * @param {object} options - Additional options
 * @param {boolean} options.requireAll - If true, user must have ALL permissions. If false, ANY permission is sufficient
 * @param {boolean} options.checkOwnership - If true, checks if user owns the resource
 * @param {function} options.getResourceOwnerId - Function to get resource owner ID from req
 */
const checkPermission = (requiredPermission, options = {}) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const {
        requireAll = false,
        checkOwnership = false,
        getResourceOwnerId = null
      } = options;

      // Get user with role and permissions
      const User = require('../models/User');
      const user = await User.findById(req.userId).populate({
        path: 'role',
        populate: {
          path: 'permissions inheritsFrom',
          populate: {
            path: 'permissions'
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // If user has no role assigned, deny access
      if (!user.role) {
        return res.status(403).json({
          success: false,
          message: 'No role assigned to user'
        });
      }

      // Get all permissions including inherited ones
      const userPermissions = await user.role.getAllPermissions();
      const allPermissions = await Permission.find({
        _id: { $in: userPermissions }
      });

      // Handle single or multiple permissions
      const permissionsToCheck = Array.isArray(requiredPermission) 
        ? requiredPermission 
        : [requiredPermission];

      // Check if user has required permissions
      const hasPermission = (permName) => {
        return allPermissions.some(p => {
          // Exact match
          if (p.name === permName) return true;
          
          // Wildcard match (e.g., 'post:*' matches 'post:create', 'post:update', etc.)
          const [resource, action] = permName.split(':');
          return p.name === `${resource}:*` || p.name === '*:*';
        });
      };

      let authorized = false;
      if (requireAll) {
        // User must have ALL required permissions
        authorized = permissionsToCheck.every(hasPermission);
      } else {
        // User must have ANY of the required permissions
        authorized = permissionsToCheck.some(hasPermission);
      }

      if (!authorized) {
        logger.warn(`Permission denied for user ${user.username}: Required ${permissionsToCheck.join(' or ')}`);
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: permissionsToCheck
        });
      }

      // Check ownership if required
      if (checkOwnership && getResourceOwnerId) {
        const resourceOwnerId = await getResourceOwnerId(req);
        
        if (!resourceOwnerId) {
          return res.status(404).json({
            success: false,
            message: 'Resource not found'
          });
        }

        // Allow if user owns the resource OR has scope 'all'
        const hasAllScope = allPermissions.some(p => 
          permissionsToCheck.includes(p.name) && p.scope === 'all'
        );

        if (resourceOwnerId.toString() !== req.userId.toString() && !hasAllScope) {
          return res.status(403).json({
            success: false,
            message: 'You can only modify your own resources'
          });
        }
      }

      // Attach user permissions to request for later use
      req.userPermissions = allPermissions.map(p => p.name);
      req.userRole = user.role;

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

/**
 * Check if user has minimum role level
 * @param {number} minLevel - Minimum role level required (0-100)
 */
const checkRoleLevel = (minLevel) => {
  return async (req, res, next) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const User = require('../models/User');
      const user = await User.findById(req.userId).populate('role');

      if (!user || !user.role) {
        return res.status(403).json({
          success: false,
          message: 'No role assigned'
        });
      }

      if (user.role.level < minLevel) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient role level',
          required: minLevel,
          current: user.role.level
        });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      logger.error('Role level check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking role level'
      });
    }
  };
};

/**
 * Check if user can manage target user/role
 * Higher level roles can manage lower level roles
 */
const checkCanManage = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const User = require('../models/User');
    const user = await User.findById(req.userId).populate('role');
    const targetUserId = req.params.userId || req.body.userId;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID required'
      });
    }

    const targetUser = await User.findById(targetUserId).populate('role');

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    // Users can always manage themselves
    if (user._id.toString() === targetUser._id.toString()) {
      return next();
    }

    // Check role hierarchy
    if (!user.role || !targetUser.role) {
      return res.status(403).json({
        success: false,
        message: 'Role information missing'
      });
    }

    if (user.role.level <= targetUser.role.level) {
      return res.status(403).json({
        success: false,
        message: 'Cannot manage users with equal or higher role level'
      });
    }

    req.userRole = user.role;
    req.targetRole = targetUser.role;
    next();
  } catch (error) {
    logger.error('Manage check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking management permissions'
    });
  }
};

/**
 * Load user permissions into request object
 * Useful for endpoints that need to check permissions conditionally
 */
const loadPermissions = async (req, res, next) => {
  try {
    if (!req.userId) {
      req.userPermissions = [];
      req.userRole = null;
      return next();
    }

    const User = require('../models/User');
    const user = await User.findById(req.userId).populate({
      path: 'role',
      populate: {
        path: 'permissions inheritsFrom',
        populate: {
          path: 'permissions'
        }
      }
    });

    if (!user || !user.role) {
      req.userPermissions = [];
      req.userRole = null;
      return next();
    }

    const userPermissions = await user.role.getAllPermissions();
    const allPermissions = await Permission.find({
      _id: { $in: userPermissions }
    });

    req.userPermissions = allPermissions.map(p => p.name);
    req.userRole = user.role;
    
    next();
  } catch (error) {
    logger.error('Load permissions error:', error);
    req.userPermissions = [];
    req.userRole = null;
    next();
  }
};

/**
 * Helper function to check if user has permission (can be used in controllers)
 */
const hasPermission = (userPermissions, requiredPermission) => {
  if (!Array.isArray(userPermissions)) return false;
  
  const permissionsToCheck = Array.isArray(requiredPermission) 
    ? requiredPermission 
    : [requiredPermission];

  return permissionsToCheck.some(permName => {
    return userPermissions.some(userPerm => {
      // Exact match
      if (userPerm === permName) return true;
      
      // Wildcard match
      const [resource, action] = permName.split(':');
      return userPerm === `${resource}:*` || userPerm === '*:*';
    });
  });
};

module.exports = {
  checkPermission,
  checkRoleLevel,
  checkCanManage,
  loadPermissions,
  hasPermission
};
