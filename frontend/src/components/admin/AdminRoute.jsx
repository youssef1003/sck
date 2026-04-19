import { Navigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { hasPermission, hasAnyPermission, isSuperAdmin } from '../../utils/permissions'

const AdminRoute = ({ children, permission, anyOf, superAdminOnly = false }) => {
  const token = localStorage.getItem('access_token')
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Check if user is admin or subadmin
  if (userData.role !== 'admin' && userData.role !== 'subadmin') {
    return <Navigate to="/login" replace />
  }

  // Check permissions if specified
  if (permission || anyOf || superAdminOnly) {
    // Super Admin bypass
    if (userData.role === 'admin') {
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
