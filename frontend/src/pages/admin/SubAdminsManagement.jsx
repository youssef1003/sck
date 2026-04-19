import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  X,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { PERMISSION_GROUPS, DEFAULT_PERMISSIONS, isSuperAdmin } from '../../utils/permissions'
import { useNavigate } from 'react-router-dom'

const SubAdminsManagement = () => {
  const navigate = useNavigate()
  const [subAdmins, setSubAdmins] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [toast, setToast] = useState(null)
  const [expandedGroups, setExpandedGroups] = useState({})

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    permissions: [...DEFAULT_PERMISSIONS.subadmin]
  })

  useEffect(() => {
    // التحقق من أن المستخدم Super Admin
    if (!isSuperAdmin()) {
      navigate('/admin/dashboard')
      return
    }

    loadSubAdmins()
  }, [navigate])

  const loadSubAdmins = () => {
    // تحميل Sub-Admins من localStorage
    const users = JSON.parse(localStorage.getItem('scq_admin_users') || '[]')
    const subAdminUsers = users.filter(u => u.role === 'subadmin')
    setSubAdmins(subAdminUsers)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openCreateModal = () => {
    setEditingAdmin(null)
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      permissions: [...DEFAULT_PERMISSIONS.subadmin]
    })
    setIsModalOpen(true)
  }

  const openEditModal = (admin) => {
    setEditingAdmin(admin)
    setFormData({
      username: admin.username,
      password: '',
      fullName: admin.fullName || '',
      email: admin.email || '',
      permissions: admin.permissions || [...DEFAULT_PERMISSIONS.subadmin]
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.username || (!editingAdmin && !formData.password)) {
      showToast('يرجى ملء جميع الحقول المطلوبة', 'error')
      return
    }

    const users = JSON.parse(localStorage.getItem('scq_admin_users') || '[]')

    if (editingAdmin) {
      // تعديل Sub-Admin موجود
      const updatedUsers = users.map(u => 
        u.id === editingAdmin.id 
          ? { 
              ...u, 
              username: formData.username,
              fullName: formData.fullName,
              email: formData.email,
              permissions: formData.permissions,
              ...(formData.password && { password: formData.password })
            }
          : u
      )
      localStorage.setItem('scq_admin_users', JSON.stringify(updatedUsers))
      showToast('تم تحديث المساعد بنجاح')
    } else {
      // إنشاء Sub-Admin جديد
      const existingUser = users.find(u => u.username === formData.username)
      if (existingUser) {
        showToast('اسم المستخدم موجود بالفعل', 'error')
        return
      }

      const newAdmin = {
        id: Date.now(),
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        role: 'subadmin',
        permissions: formData.permissions,
        createdAt: new Date().toISOString(),
        isActive: true
      }

      users.push(newAdmin)
      localStorage.setItem('scq_admin_users', JSON.stringify(users))
      showToast('تم إنشاء المساعد بنجاح')
    }

    setIsModalOpen(false)
    loadSubAdmins()
  }

  const handleDelete = (adminId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المساعد؟')) return

    const users = JSON.parse(localStorage.getItem('scq_admin_users') || '[]')
    const updatedUsers = users.filter(u => u.id !== adminId)
    localStorage.setItem('scq_admin_users', JSON.stringify(updatedUsers))
    
    showToast('تم حذف المساعد بنجاح')
    loadSubAdmins()
    setSelectedAdmin(null)
  }

  const togglePermission = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }))
  }

  const selectAllInGroup = (groupPermissions) => {
    const allSelected = groupPermissions.every(p => formData.permissions.includes(p.key))
    
    if (allSelected) {
      // إلغاء تحديد الكل
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !groupPermissions.find(gp => gp.key === p))
      }))
    } else {
      // تحديد الكل
      const newPermissions = [...formData.permissions]
      groupPermissions.forEach(p => {
        if (!newPermissions.includes(p.key)) {
          newPermissions.push(p.key)
        }
      })
      setFormData(prev => ({ ...prev, permissions: newPermissions }))
    }
  }

  const getPermissionCount = (permissions) => {
    return permissions ? permissions.length : 0
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-xl shadow-lg font-semibold ${
            toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">إدارة المساعدين (Sub-Admins)</h2>
          <p className="text-slate-600 mt-1">إنشاء وإدارة حسابات المساعدين وصلاحياتهم</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة مساعد جديد
        </button>
      </div>

      {/* Sub-Admins List */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {subAdmins.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg mb-4">لا يوجد مساعدين</p>
              <button
                onClick={openCreateModal}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                إضافة أول مساعد
              </button>
            </div>
          ) : (
            subAdmins.map((admin) => (
              <motion.div
                key={admin.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedAdmin(admin)}
                className={`bg-white rounded-2xl p-6 shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedAdmin?.id === admin.id
                    ? 'border-blue-500'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{admin.fullName || admin.username}</h3>
                      <p className="text-sm text-slate-600">@{admin.username}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    admin.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {admin.isActive ? 'نشط' : 'معطل'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{admin.email || 'لا يوجد بريد'}</span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    {getPermissionCount(admin.permissions)} صلاحية
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          {selectedAdmin ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-6">تفاصيل المساعد</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-slate-500 block mb-1">الاسم الكامل</label>
                  <p className="font-semibold text-slate-900">{selectedAdmin.fullName || selectedAdmin.username}</p>
                </div>

                <div>
                  <label className="text-sm text-slate-500 block mb-1">اسم المستخدم</label>
                  <p className="font-semibold text-slate-900">@{selectedAdmin.username}</p>
                </div>

                <div>
                  <label className="text-sm text-slate-500 block mb-1">البريد الإلكتروني</label>
                  <p className="font-semibold text-slate-900 text-sm break-all">{selectedAdmin.email || 'غير محدد'}</p>
                </div>

                <div>
                  <label className="text-sm text-slate-500 block mb-1">عدد الصلاحيات</label>
                  <p className="font-semibold text-slate-900">{getPermissionCount(selectedAdmin.permissions)} صلاحية</p>
                </div>

                <div>
                  <label className="text-sm text-slate-500 block mb-1">تاريخ الإنشاء</label>
                  <p className="font-semibold text-slate-900 text-sm">
                    {new Date(selectedAdmin.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-6 border-t border-slate-200">
                <button
                  onClick={() => openEditModal(selectedAdmin)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                  تعديل الصلاحيات
                </button>

                <button
                  onClick={() => handleDelete(selectedAdmin.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  حذف المساعد
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
              <Eye className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">اختر مساعداً لعرض التفاصيل</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 left-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {editingAdmin ? 'تعديل المساعد' : 'إضافة مساعد جديد'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">اسم المستخدم *</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                      placeholder="subadmin1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      كلمة المرور {editingAdmin ? '(اتركها فارغة للإبقاء)' : '*'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                      placeholder="••••••••"
                      required={!editingAdmin}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                      placeholder="أحمد محمد"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">الصلاحيات</h3>
                  <div className="space-y-3">
                    {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
                      const isExpanded = expandedGroups[groupKey]
                      const allSelected = group.permissions.every(p => formData.permissions.includes(p.key))
                      const someSelected = group.permissions.some(p => formData.permissions.includes(p.key))

                      return (
                        <div key={groupKey} className="border-2 border-slate-200 rounded-xl overflow-hidden">
                          <div
                            className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => toggleGroup(groupKey)}
                          >
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  selectAllInGroup(group.permissions)
                                }}
                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                              >
                                {allSelected ? (
                                  <CheckSquare className="w-5 h-5 text-blue-600" />
                                ) : someSelected ? (
                                  <Square className="w-5 h-5 text-blue-400" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-400" />
                                )}
                              </button>
                              <span className="font-semibold text-slate-900">{group.label}</span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-slate-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-600" />
                            )}
                          </div>

                          {isExpanded && (
                            <div className="p-4 space-y-2">
                              {group.permissions.map((perm) => (
                                <label
                                  key={perm.key}
                                  className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.permissions.includes(perm.key)}
                                    onChange={() => togglePermission(perm.key)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                  <span className="text-slate-700">{perm.label}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Save className="w-5 h-5" />
                    {editingAdmin ? 'حفظ التعديلات' : 'إنشاء المساعد'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SubAdminsManagement
