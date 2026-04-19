import { Navigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  )
}

export default AdminRoute
