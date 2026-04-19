import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, Shield, UserCheck, UserX, Trash2, ChevronDown } from 'lucide-react'
import { getUsers, updateUserRole, updateUserStatus, deleteUser } from '../../utils/adminApi'

const UsersManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [totalCount, setTotalCount] = useState(0)
  const [toast, setToast] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { limit: 50 }
      if (searchTerm) params.search = searchTerm
      if (roleFilter !== 'all') params.role = roleFilter
      const result = await getUsers(params)
      setUsers(result.data || [])
      setTotalCount(result.count || 0)
    } catch (err) {
      setError('فشل في تحميل المستخدمين')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [roleFilter])

  useEffect(() => {
    const timer = setTimeout(() => { if (searchTerm !== undefined) fetchUsers() }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole)
      showToast('تم تحديث الدور بنجاح')
      fetchUsers()
    } catch (err) {
      showToast('فشل في تحديث الدور', 'error')
    }
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await updateUserStatus(userId, !currentStatus)
      showToast(currentStatus ? 'تم تعطيل المستخدم' : 'تم تفعيل المستخدم')
      fetchUsers()
    } catch (err) {
      showToast('فشل في تحديث الحالة', 'error')
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return
    try {
      await deleteUser(userId)
      showToast('تم حذف المستخدم بنجاح')
      fetchUsers()
    } catch (err) {
      showToast('فشل في حذف المستخدم', 'error')
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 text-red-700 border-red-200',
      subadmin: 'bg-orange-100 text-orange-700 border-orange-200',
      consultant: 'bg-purple-100 text-purple-700 border-purple-200',
      employer: 'bg-blue-100 text-blue-700 border-blue-200',
      client: 'bg-green-100 text-green-700 border-green-200',
      user: 'bg-slate-100 text-slate-700 border-slate-200',
    }
    const labels = {
      admin: 'مدير', subadmin: 'مساعد مدير', consultant: 'مستشار',
      employer: 'صاحب عمل', client: 'عميل', user: 'مستخدم'
    }
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${styles[role] || styles.user}`}>
        {labels[role] || role}
      </span>
    )
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg font-semibold ${
            toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      {/* Header Stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">إدارة المستخدمين</h2>
          <p className="text-slate-600 mt-1">إجمالي {totalCount} مستخدم</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-slate-600">RBAC</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم أو البريد أو الهاتف..."
              className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none min-w-[160px]"
          >
            <option value="all">كل الأدوار</option>
            <option value="admin">مدير</option>
            <option value="subadmin">مساعد مدير</option>
            <option value="consultant">مستشار</option>
            <option value="employer">صاحب عمل</option>
            <option value="client">عميل</option>
            <option value="user">مستخدم</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">جاري تحميل المستخدمين...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center">
            <Users className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">{error}</p>
            <button onClick={fetchUsers} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              إعادة المحاولة
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">لا يوجد مستخدمون</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">المستخدم</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">البريد</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">الهاتف</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">الدور</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">التاريخ</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{(user.full_name || '?')[0]}</span>
                        </div>
                        <span className="font-medium text-slate-900">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600" dir="ltr">{user.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none cursor-pointer"
                      >
                        <option value="client">عميل</option>
                        <option value="user">مستخدم</option>
                        <option value="employer">صاحب عمل</option>
                        <option value="consultant">مستشار</option>
                        <option value="subadmin">مساعد مدير</option>
                        <option value="admin">مدير</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusToggle(user.id, user.is_active)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          user.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {user.is_active ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        {user.is_active ? 'نشط' : 'معطل'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersManagement
