import { Navigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { hasPermission, hasAnyPermission, isSuperAdmin } from '../../utils/permissions'

const AdminRoute = ({ children, permission, anyOf, superAdminOnly = false }) => {
  const token = localStorage.getItem('access_token')
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Check if user is super_admin, admin, or subadmin
  const isAdmin = userData.role === 'super_admin' || userData.role === 'admin' || userData.role === 'subadmin'
  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }

  // Check permissions if specified
  if (permission || anyOf || superAdminOnly) {
    // Super Admin bypass (both super_admin and admin roles)
    if (isSuperAdmin()) {
      return <AdminLayout>{children}</AdminLayout>
    }

    // Super Admin only route
    if (superAdminOnly) {
      return <Navigate to="/admin/dashboard" replace />
    }

    const userPermissions = userData.permissions || []

    // Check single permission
    if (permission && !hasPermission(userPermissions, permission)) {
      return <Navigate to="/admin/dashboard" replace />
    }

    // Check any of multiple permissions
    if (anyOf && !hasAnyPermission(userPermissions, anyOf)) {
      return <Navigate to="/admin/dashboard" replace />
    }
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  )
}

export default AdminRoute
