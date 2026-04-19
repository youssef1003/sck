import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, CalendarCheck, Clock, CheckCircle, XCircle, Eye, Phone, Mail, Building2 } from 'lucide-react'
import { getBookings, updateBookingStatus } from '../../utils/adminApi'
import { hasPermission, getCurrentUserPermissions, PERMISSIONS } from '../../utils/permissions'
import PermissionGuard from '../../components/admin/PermissionGuard'

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [totalCount, setTotalCount] = useState(0)
  const [toast, setToast] = useState(null)

  const userPermissions = getCurrentUserPermissions()
  const canChangeStatus = hasPermission(userPermissions, PERMISSIONS.BOOKINGS_CHANGE_STATUS)

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { limit: 50 }
      if (searchTerm) params.search = searchTerm
      if (statusFilter !== 'all') params.status = statusFilter
      const result = await getBookings(params)
      setBookings(result.data || [])
      setTotalCount(result.count || 0)
    } catch (err) {
      setError('فشل في تحميل الحجوزات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [statusFilter])
  useEffect(() => {
    const t = setTimeout(() => fetchBookings(), 400)
    return () => clearTimeout(t)
  }, [searchTerm])

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus)
      showToast('تم تحديث حالة الحجز')
      fetchBookings()
      if (selectedBooking?.id === id) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      showToast('فشل في تحديث الحالة', 'error')
    }
  }

  const statusConfig = {
    pending: { label: 'قيد الانتظار', color: 'yellow', icon: Clock },
    confirmed: { label: 'مؤكد', color: 'blue', icon: CheckCircle },
    completed: { label: 'مكتمل', color: 'green', icon: CheckCircle },
    cancelled: { label: 'ملغي', color: 'red', icon: XCircle },
  }

  const getStatusBadge = (status) => {
    const cfg = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-${cfg.color}-100 text-${cfg.color}-700 border border-${cfg.color}-200`}>
        <cfg.icon className="w-3.5 h-3.5" />
        {cfg.label}
      </span>
    )
  }

  return (
    <div>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg font-semibold ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {toast.message}
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">إدارة الحجوزات</h2>
          <p className="text-slate-600 mt-1">إجمالي {totalCount} حجز</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم أو البريد أو الهاتف..."
              className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none min-w-[160px]">
            <option value="all">كل الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600">جاري التحميل...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200">
              <CalendarCheck className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button onClick={fetchBookings} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">إعادة المحاولة</button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200">
              <CalendarCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">لا توجد حجوزات</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedBooking(booking)}
                className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${selectedBooking?.id === booking.id ? 'border-blue-500' : 'border-slate-200 hover:border-blue-300'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{booking.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{booking.service_type || 'غير محدد'}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{booking.email}</span>
                  <span className="flex items-center gap-1" dir="ltr"><Phone className="w-4 h-4" />{booking.phone}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{booking.preferred_date || '—'} {booking.preferred_time || ''}</span>
                  <span>{booking.created_at ? new Date(booking.created_at).toLocaleDateString('ar-EG') : '—'}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div>
          {selectedBooking ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-6">تفاصيل الحجز</h3>
              <div className="space-y-4 mb-6">
                {[
                  ['الاسم', selectedBooking.name],
                  ['البريد', selectedBooking.email],
                  ['الهاتف', selectedBooking.phone],
                  ['الشركة', selectedBooking.company || '—'],
                  ['نوع الخدمة', selectedBooking.service_type || '—'],
                  ['التاريخ المفضل', selectedBooking.preferred_date || '—'],
                  ['الوقت المفضل', selectedBooking.preferred_time || '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    <p className="font-medium text-slate-900">{value}</p>
                  </div>
                ))}
                {selectedBooking.notes && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">ملاحظات</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">تغيير الحالة</p>
                <PermissionGuard permission={PERMISSIONS.BOOKINGS_CHANGE_STATUS}>
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <button key={key} onClick={() => handleStatusChange(selectedBooking.id, key)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        selectedBooking.status === key
                          ? `bg-${cfg.color}-500 text-white`
                          : `bg-${cfg.color}-50 text-${cfg.color}-700 hover:bg-${cfg.color}-100`
                      }`}>
                      <cfg.icon className="w-4 h-4" />
                      {cfg.label}
                    </button>
                  ))}
                </PermissionGuard>
                <PermissionGuard 
                  permission={PERMISSIONS.BOOKINGS_CHANGE_STATUS}
                  fallback={
                    <p className="text-sm text-slate-500 text-center py-4">
                      ليس لديك صلاحية تغيير حالة الحجز
                    </p>
                  }
                />
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
              <Eye className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">اختر حجزاً لعرض التفاصيل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingsManagement
