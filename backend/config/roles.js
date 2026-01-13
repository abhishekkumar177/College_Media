/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines user roles and their associated permissions
 */

const ROLES = {
    USER: 'student', // Default role (also 'alumni' has similar base permissions)
    MODERATOR: 'moderator',
    ADMIN: 'admin'
};

// Permission constants
const PERMISSIONS = {
    // User Management
    VIEW_USERS: 'view_users',
    DELETE_USER: 'delete_user',
    BAN_USER: 'ban_user',
    UPDATE_USER_ROLE: 'update_user_role',

    // Content Management
    DELETE_ANY_POST: 'delete_any_post',
    DELETE_ANY_MESSAGE: 'delete_any_message',
    VIEW_ANY_PROFILE: 'view_any_profile', // Including private ones

    // System
    VIEW_LOGS: 'view_logs',
    MANAGE_SETTINGS: 'manage_settings'
};

// Role-Permission Mappings
const ROLE_PERMISSIONS = {
    [ROLES.USER]: [
        // Students/Alumni have no special administrative permissions by default
        // They can only manage their own data (handled by ownership checks, not RBAC middleware)
    ],

    [ROLES.MODERATOR]: [
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.BAN_USER,
        PERMISSIONS.DELETE_ANY_POST,
        PERMISSIONS.VIEW_ANY_PROFILE
    ],

    [ROLES.ADMIN]: [
        // Admin has all permissions
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.BAN_USER,
        PERMISSIONS.UPDATE_USER_ROLE,
        PERMISSIONS.DELETE_ANY_POST,
        PERMISSIONS.DELETE_ANY_MESSAGE,
        PERMISSIONS.VIEW_ANY_PROFILE,
        PERMISSIONS.VIEW_LOGS,
        PERMISSIONS.MANAGE_SETTINGS
    ]
};

/**
 * Check if a role has a specific permission
 * @param {string} role - The user's role
 * @param {string} permission - The permission to check
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
    if (!role) return false;

    // Normalize role (handle potential case sensitivity or mapping)
    // Our User model uses 'student', 'alumni', 'admin'. 
    // Let's treat 'alumni' same as 'student' (USER) for RBAC purposes unless specified otherwise.
    let normalizedRole = role;
    if (role === 'alumni') normalizedRole = ROLES.USER;

    const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
    return permissions.includes(permission);
};

module.exports = {
    ROLES,
    PERMISSIONS,
    hasPermission
};
