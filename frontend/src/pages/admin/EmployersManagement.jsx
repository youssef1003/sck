import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, CheckCircle, XCircle, Clock, Mail, Phone, Building2, Calendar, Eye, Trash2 } from 'lucide-react'

const EmployersManagement = () => {
  const [employers, setEmployers] = useState([])
  const [filteredEmployers, setFilteredEmployers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEmployer, setSelectedEmployer] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadEmployers()
  }, [])

  useEffect(() => {
    filterEmployers()
  }, [employers, searchTerm, statusFilter])

  const loadEmployers = () => {
    const users = JSON.parse(localStorage.getItem('scq_users') || '[]')
    const employerUsers = users.filter(u => u.userType === 'employer')
    setEmployers(employerUsers)
  }

  const filterEmployers = () => {
    let filtered = [...employers]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.phone && emp.phone.includes(searchTerm))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'approved') {
        filtered = filtered.filter(emp => emp.isApproved === true)
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(emp => emp.isApproved === false)
      }
    }

    setFilteredEmployers(filtered)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleApprove = (employerId) => {
    const users = JSON.parse(localStorage.getItem('scq_users') || '[]')
    const updatedUsers = users.map(u =>
      u.id === employerId ? { ...u, isApproved: true, subscriptionStatus: 'active' } : u
    )
    localStorage.setItem('scq_users', JSON.stringify(updatedUsers))
    loadEmployers()
    showToast('تم الموافقة على صاحب العمل')
    if (selectedEmployer?.id === employerId) {
      setSelectedEmployer({ ...selectedEmployer, isApproved: true, subscriptionStatus: 'active' })
    }
  }

  const handleReject = (employerId) => {
    const users = JSON.parse(localStorage.getItem('scq_users') || '[]')
    const updatedUsers = users.map(u =>
      u.id === employerId ? { ...u, isApproved: false, subscriptionStatus: 'rejected' } : u
    )
    localStorage.setItem('scq_users', JSON.stringify(updatedUsers))
    loadEmployers()
    showToast('تم رفض صاحب العمل', 'error')
    if (selectedEmployer?.id === employerId) {
      setSelectedEmployer({ ...selectedEmployer, isApproved: false, subscriptionStatus: 'rejected' })
    }
  }

  const handleDelete = (employerId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الحساب؟')) return
    
    const users = JSON.parse(localStorage.getItem('scq_users') || '[]')
    const updatedUsers = users.filter(u => u.id !== employerId)
    localStorage.setItem('scq_users', JSON.stringify(updatedUsers))
    loadEmployers()
    showToast('تم حذف الحساب')
    setSelectedEmployer(null)
  }

  const getStatusBadge = (employer) => {
    if (employer.isApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
          <CheckCircle className="w-3.5 h-3.5" />
          مفعّل
        </span>
      )
    } else if (employer.subscriptionStatus === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
          <XCircle className="w-3.5 h-3.5" />
          مرفوض
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-100 text-yellow-700">
          <Clock className="w-3.5 h-3.5" />
          قيد المراجعة
        </span>
      )
    }
  }

  const getStats = () => {
    return {
      total: employers.length,
      approved: employers.filter(e => e.isApproved === true).length,
      pending: employers.filter(e => e.isApproved === false && e.subscriptionStatus !== 'rejected').length,
      rejected: employers.filter(e => e.subscriptionStatus === 'rejected').length
    }
  }

  const stats = getStats()

  return (
    <div>
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg font-semibold ${
            toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">إدارة أصحاب العمل</h2>
          <p className="text-slate-600 mt-1">الموافقة على الحسابات وإدارة الاشتراكات</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-slate-900">{stats.total}</span>
          </div>
          <p className="text-slate-600 font-medium">إجمالي أصحاب العمل</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-slate-900">{stats.approved}</span>
          </div>
          <p className="text-slate-600 font-medium">مفعّل</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-3xl font-bold text-slate-900">{stats.pending}</span>
          </div>
          <p className="text-slate-600 font-medium">قيد المراجعة</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-red-600" />
            <span className="text-3xl font-bold text-slate-900">{stats.rejected}</span>
          </div>
          <p className="text-slate-600 font-medium">مرفوض</p>
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
              placeholder="بحث بالاسم، البريد، أو الهاتف..."
              className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none min-w-[160px]"
          >
            <option value="all">كل الحالات</option>
            <option value="approved">مفعّل</option>
            <option value="pending">قيد المراجعة</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>

      {/* Employers List */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredEmployers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">لا يوجد أصحاب عمل</p>
            </div>
          ) : (
            filteredEmployers.map((employer) => (
              <motion.div
                key={employer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedEmployer(employer)}
                className={`bg-white rounded-2xl p-6 shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedEmployer?.id === employer.id
                    ? 'border-blue-500'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{employer.fullName?.[0]}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{employer.fullName}</h3>
                      <p className="text-sm text-slate-600">{employer.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(employer)}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {employer.phone || 'غير محدد'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(employer.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          {selectedEmployer ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-6">تفاصيل صاحب العمل</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-slate-500 block mb-1">الاسم الكامل</label>
                  <p className="font-semibold text-slate-900">{selectedEmployer.fullName}</p>
                </div>

                <div>
                  <label className="text-sm text-slate-500 block mb-1">البريد الإلكتروني</label>
                  <p className="font-semibold text-slate-900 text-sm break-all">{selectedEmployer.email}</p>
                </div>

                <div>
                  <label className="text-sm text-slate-500 block mb-1">رقم الهاتف</label>
                  <p className="font-semibold text-slate-900" dir="ltr">{selectedEmployer.phone || 'غير محدد'}</p>
                </div>

                <div>
                  <label className="text-sm text-slate-500 block mb-1">تاريخ التسجيل</label>
                  <p className="font-semibold text-slate-900">
                    {new Date(selectedEmployer.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-slate-500 block mb-1">حالة الاشتراك</label>
                  <p className="font-semibold text-slate-900">{selectedEmployer.subscriptionStatus || 'pending'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-6 border-t border-slate-200">
                {!selectedEmployer.isApproved && selectedEmployer.subscriptionStatus !== 'rejected' && (
                  <button
                    onClick={() => handleApprove(selectedEmployer.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    الموافقة وتفعيل الحساب
                  </button>
                )}

                {!selectedEmployer.isApproved && selectedEmployer.subscriptionStatus !== 'rejected' && (
                  <button
                    onClick={() => handleReject(selectedEmployer.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    رفض الطلب
                  </button>
                )}

                {selectedEmployer.isApproved && (
                  <button
                    onClick={() => handleReject(selectedEmployer.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
                  >
                    <Clock className="w-5 h-5" />
                    إيقاف الحساب
                  </button>
                )}

                <button
                  onClick={() => handleDelete(selectedEmployer.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  حذف الحساب
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
              <Eye className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">اختر صاحب عمل لعرض التفاصيل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployersManagement
