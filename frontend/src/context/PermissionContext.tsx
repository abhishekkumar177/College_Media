import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface Permission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  scope: string;
  category: string;
}

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  level: number;
  permissions: Permission[];
  color: string;
  icon: string;
}

interface PermissionContextType {
  role: Role | null;
  permissions: string[];
  loading: boolean;
  hasPermission: (permission: string | string[], requireAll?: boolean) => boolean;
  hasRoleLevel: (minLevel: number) => boolean;
  canManageRole: (targetRoleLevel: number) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchUserPermissions = useCallback(async () => {
    if (!user || !token) {
      setRole(null);
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch user's role and permissions
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user permissions');
      }

      const data = await response.json();

      if (data.success && data.data.role) {
        setRole(data.data.role);
        
        // Extract permission names from role
        const permissionNames = data.data.role.permissions?.map((p: Permission) => p.name) || [];
        setPermissions(permissionNames);
      } else {
        setRole(null);
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setRole(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [user, token, API_BASE_URL]);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  /**
   * Check if user has specific permission(s)
   * @param permission - Single permission string or array of permissions
   * @param requireAll - If true, user must have ALL permissions. If false, ANY permission is sufficient
   */
  const hasPermission = useCallback((
    permission: string | string[],
    requireAll: boolean = false
  ): boolean => {
    if (!permissions || permissions.length === 0) return false;

    const permissionsToCheck = Array.isArray(permission) ? permission : [permission];

    const checkPerm = (permName: string): boolean => {
      return permissions.some(userPerm => {
        // Exact match
        if (userPerm === permName) return true;

        // Wildcard match
        const [resource, action] = permName.split(':');
        return userPerm === `${resource}:*` || userPerm === '*:*';
      });
    };

    if (requireAll) {
      return permissionsToCheck.every(checkPerm);
    } else {
      return permissionsToCheck.some(checkPerm);
    }
  }, [permissions]);

  /**
   * Check if user's role level meets minimum requirement
   */
  const hasRoleLevel = useCallback((minLevel: number): boolean => {
    if (!role) return false;
    return role.level >= minLevel;
  }, [role]);

  /**
   * Check if user can manage a role with specific level
   * Higher level roles can manage lower level roles
   */
  const canManageRole = useCallback((targetRoleLevel: number): boolean => {
    if (!role) return false;
    return role.level > targetRoleLevel;
  }, [role]);

  /**
   * Manually refresh permissions (useful after role assignment)
   */
  const refreshPermissions = useCallback(async () => {
    await fetchUserPermissions();
  }, [fetchUserPermissions]);

  const value: PermissionContextType = {
    role,
    permissions,
    loading,
    hasPermission,
    hasRoleLevel,
    canManageRole,
    refreshPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

export default PermissionContext;
