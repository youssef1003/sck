import { getCurrentUserPermissions, hasPermission, hasAnyPermission, isSuperAdmin } from '../../utils/permissions'

/**
 * PermissionGuard - Component to conditionally render content based on permissions
 * 
 * Usage:
 * <PermissionGuard permission="users_edit">
 *   <button>Edit User</button>
 * </PermissionGuard>
 * 
 * <PermissionGuard anyOf={["users_edit", "users_delete"]}>
 *   <button>Manage User</button>
 * </PermissionGuard>
 * 
 * <PermissionGuard superAdminOnly>
 *   <button>Super Admin Only</button>
 * </PermissionGuard>
 */
const PermissionGuard = ({ 
  children, 
  permission, 
  anyOf, 
  allOf,
  superAdminOnly = false,
  fallback = null 
}) => {
  // Super Admin check
  if (superAdminOnly) {
    return isSuperAdmin() ? children : fallback
  }

  // Super Admin has all permissions
  if (isSuperAdmin()) {
    return children
  }

  const userPermissions = getCurrentUserPermissions()

  // Check single permission
  if (permission) {
    return hasPermission(userPermissions, permission) ? children : fallback
  }

  // Check any of multiple permissions
  if (anyOf && Array.isArray(anyOf)) {
    return hasAnyPermission(userPermissions, anyOf) ? children : fallback
  }

  // Check all of multiple permissions
  if (allOf && Array.isArray(allOf)) {
    const hasAll = allOf.every(perm => hasPermission(userPermissions, perm))
    return hasAll ? children : fallback
  }

  // No permission specified - render children
  return children
}

export default PermissionGuard
