import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Shield,
  Loader, AlertCircle, CheckCircle
} from 'lucide-react'
import { getSubAdmins, createSubAdmin, updateSubAdmin, deleteSubAdmin } from '../../utils/adminApi'
import { PERMISSION_GROUPS } from '../../utils/permissions'

const SubAdminsManagementNew = () => {
  const [subadmins, setSubadmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingSubadmin, setEditingSubadmin] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    permissions: [],
    is_active: true
  })

  const permissionGroups = {
    'إدارة المستخدمين': [
      'users_view', 'users_create', 'users_edit', 'users_delete', 'users_change_role'
    ],
    'إدارة الحجوزات': [
      'bookings_view', 'bookings_edit', 'bookings_delete', 'bookings_change_status'
    ],
    'إدارة الرسائل': [
      'messages_view', 'messages_edit', 'messages_delete', 'messages_change_status'
    ],
    'إدارة المدونة': [
      'blog_view', 'blog_create', 'blog_edit', 'blog_delete', 'blog_publish'
    ],
    'إدارة الخدمات': [
      'services_view', 'services_create', 'services_edit', 'services_delete'
    ],
    'إدارة الباقات': [
      'packages_view', 'packages_create', 'packages_edit', 'packages_delete'
    ],
    'إدارة طلبات الأسعار': [
      'quote_requests_view', 'quote_requests_edit', 'quote_requests_delete', 'quote_requests_export'
    ],
    'إدارة المرشحين': [
      'candidates_view', 'candidates_edit', 'candidates_verify', 'candidates_delete', 
      'candidates_export', 'candidates_view_contact_info'
    ],
    'إدارة المساعدين': [
      'subadmins_view', 'subadmins_create', 'subadmins_edit', 'subadmins_delete', 'subadmins_manage_permissions'
    ],
    'إدارة المحتوى': [
      'content_view', 'content_edit', 'home_edit'
    ],
    'التحليلات والتقارير': [
      'analytics_view', 'reports_export', 'audit_logs_view'
    ],
    'إدارة RAG': [
      'rag_ingest'
    ]
  }

  useEffect(() => {
    fetchSubadmins()
  }, [])

  const fetchSubadmins = async () => {
    try {
      setLoading(true)
      const response = await getSubAdmins()
      setSubadmins(response.data || [])
    } catch (error) {
      console.error('Error fetching subadmins:', error)
      setError('فشل في تحميل المساعدين')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const handleGroupToggle = (groupPermissions) => {
    const allSelected = groupPermissions.every(p => formData.permissions.includes(p))
    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !groupPermissions.includes(p))
        : [...new Set([...prev.permissions, ...groupPermissions])]
    }))
  }

  const handleEdit = (subadmin) => {
    setEditingSubadmin(subadmin)
    setFormData({
      email: subadmin.email || '',
      full_name: subadmin.full_name || '',
      password: '',
      permissions: subadmin.permissions || [],
      is_active: subadmin.is_active !== false
    })
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingSubadmin(null)
    setFormData({
      email: '',
      full_name: '',
      password: '',
      permissions: [],
      is_active: true
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingSubadmin) {
        const updateData = {
          full_name: formData.full_name,
          permissions: formData.permissions,
          is_active: formData.is_active
        }
        if (formData.password) {
          updateData.password = formData.password
        }
        await updateSubAdmin(editingSubadmin.id, updateData)
      } else {
        if (!formData.password) {
          setError('كلمة المرور مطلوبة للمساعد الجديد')
          setLoading(false)
          return
        }
        await createSubAdmin(formData)
      }

      await fetchSubadmins()
      setShowForm(false)
      setEditingSubadmin(null)
    } catch (error) {
      console.error('Error saving subadmin:', error)
      setError(error.response?.data?.error || 'فشل في حفظ المساعد')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (subadmin) => {
    try {
      await updateSubAdmin(subadmin.id, {
        is_active: !subadmin.is_active
      })
      await fetchSubadmins()
    } catch (error) {
      console.error('Error toggling subadmin:', error)
      setError('فشل في تحديث حالة المساعد')
    }
  }

  const handleDelete = async (subadmin) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المساعد؟')) return

    try {
      await deleteSubAdmin(subadmin.id)
      await fetchSubadmins()
    } catch (error) {
      console.error('Error deleting subadmin:', error)
      setError('فشل في حذف المساعد')
    }
  }

  if (loading && subadmins.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">إدارة المساعدين</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة مساعد</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Subadmins List */}
      {!showForm && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الاسم</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">البريد الإلكتروني</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الصلاحيات</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الحالة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subadmins.map((subadmin) => (
                <tr key={subadmin.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{subadmin.full_name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {subadmin.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {(subadmin.permissions || []).length} صلاحية
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      subadmin.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {subadmin.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(subadmin)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(subadmin)}
                        className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition"
                        title={subadmin.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                      >
                        {subadmin.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(subadmin)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={!!editingSubadmin}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                كلمة المرور {editingSubadmin ? '(اتركها فارغة للإبقاء على القديمة)' : '*'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!editingSubadmin}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={editingSubadmin ? 'اتركها فارغة للإبقاء على القديمة' : ''}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-700">نشط</span>
              </label>
            </div>

            {/* Permissions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">الصلاحيات</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(permissionGroups).map(([groupName, groupPermissions]) => {
                  const allSelected = groupPermissions.every(p => formData.permissions.includes(p))
                  const someSelected = groupPermissions.some(p => formData.permissions.includes(p))

                  return (
                    <div key={groupName} className="border border-slate-200 rounded-lg p-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => handleGroupToggle(groupPermissions)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-slate-900">{groupName}</span>
                        {someSelected && !allSelected && (
                          <span className="text-xs text-blue-600">(بعض الصلاحيات)</span>
                        )}
                      </label>
                      <div className="grid md:grid-cols-2 gap-2 mr-7">
                        {groupPermissions.map(permission => (
                          <label key={permission} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={() => handlePermissionToggle(permission)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-slate-700">{permission}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{editingSubadmin ? 'تحديث' : 'إضافة'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingSubadmin(null)
                }}
                className="flex items-center gap-2 bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition"
              >
                <X className="w-5 h-5" />
                <span>إلغاء</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  )
}

export default SubAdminsManagementNew
