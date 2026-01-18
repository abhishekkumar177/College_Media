import React, { ReactNode } from 'react';
import { usePermission } from '../../context/PermissionContext';

interface PermissionGateProps {
  children: ReactNode;
  permission?: string | string[];
  requireAll?: boolean;
  minRoleLevel?: number;
  fallback?: ReactNode;
  showFallback?: boolean;
}

/**
 * PermissionGate Component
 * Conditionally renders children based on user permissions
 * Issue #882: RBAC Implementation
 * 
 * @example
 * // Single permission
 * <PermissionGate permission="post:create">
 *   <CreatePostButton />
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (ANY)
 * <PermissionGate permission={["post:update", "post:moderate"]}>
 *   <EditButton />
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (ALL required)
 * <PermissionGate permission={["post:update", "post:delete"]} requireAll>
 *   <AdminPanel />
 * </PermissionGate>
 * 
 * @example
 * // Role level check
 * <PermissionGate minRoleLevel={40}>
 *   <ModeratorDashboard />
 * </PermissionGate>
 * 
 * @example
 * // With fallback component
 * <PermissionGate permission="post:create" fallback={<div>Access Denied</div>} showFallback>
 *   <CreatePostButton />
 * </PermissionGate>
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  requireAll = false,
  minRoleLevel,
  fallback = null,
  showFallback = false
}) => {
  const { hasPermission, hasRoleLevel, loading } = usePermission();

  // Show nothing while loading permissions
  if (loading) {
    return null;
  }

  // Check permission if provided
  if (permission) {
    const hasRequiredPermission = hasPermission(permission, requireAll);
    if (!hasRequiredPermission) {
      return showFallback ? <>{fallback}</> : null;
    }
  }

  // Check role level if provided
  if (minRoleLevel !== undefined) {
    const hasRequiredLevel = hasRoleLevel(minRoleLevel);
    if (!hasRequiredLevel) {
      return showFallback ? <>{fallback}</> : null;
    }
  }

  // If no checks specified or all checks passed, render children
  return <>{children}</>;
};

export default PermissionGate;
