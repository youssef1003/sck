import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, Filter, Eye, Edit2, Trash2, Download,
  Loader, AlertCircle, X, Save, Building, User
} from 'lucide-react'
import { getQuoteRequests, updateQuoteRequest, deleteQuoteRequest } from '../../utils/adminApi'

const QuoteRequestsManagement = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  })

  const [editData, setEditData] = useState({
    status: '',
    admin_notes: ''
  })

  const statusOptions = ['new', 'reviewing', 'quoted', 'contacted', 'closed', 'rejected']
  const statusLabels = {
    new: 'جديد',
    reviewing: 'قيد المراجعة',
    quoted: 'تم تقديم عرض',
    contacted: 'تم التواصل',
    closed: 'مغلق',
    rejected: 'مرفوض'
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await getQuoteRequests()
      setRequests(response.data || [])
    } catch (error) {
      console.error('Error fetching quote requests:', error)
      setError('فشل في تحميل طلبات الأسعار')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setEditData({
      status: request.status || 'new',
      admin_notes: request.admin_notes || ''
    })
    setShowDetails(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return

    try {
      setLoading(true)
      await updateQuoteRequest(selectedRequest.id, editData)
      await fetchRequests()
      setShowDetails(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error updating quote request:', error)
      setError('فشل في تحديث الطلب')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (request) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return

    try {
      await deleteQuoteRequest(request.id)
      await fetchRequests()
    } catch (error) {
      console.error('Error deleting quote request:', error)
      setError('فشل في حذف الطلب')
    }
  }

  const handleExportCSV = () => {
    const csvData = filteredRequests.map(req => ({
      'التاريخ': new Date(req.created_at).toLocaleDateString('ar-SA'),
      'اسم المسؤول': req.representative_name,
      'الشركة': req.company_name,
      'حجم الشركة': req.company_size,
      'عدد الموظفين': req.employees_needed,
      'الباقة': req.selected_package_slug || 'غير محدد',
      'الحالة': statusLabels[req.status] || req.status,
      'الجوال': req.mobile,
      'البريد': req.email
    }))

    const headers = Object.keys(csvData[0] || {})
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `quote-requests-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const filteredRequests = requests.filter(req => {
    if (filters.status && req.status !== filters.status) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        req.company_name?.toLowerCase().includes(search) ||
        req.representative_name?.toLowerCase().includes(search) ||
        req.email?.toLowerCase().includes(search)
      )
    }
    return true
  })

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">إدارة طلبات الأسعار</h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <Download className="w-5 h-5" />
          <span>تصدير CSV</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Search className="w-4 h-4 inline-block ml-1" />
              بحث
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="اسم الشركة، المسؤول، البريد..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Filter className="w-4 h-4 inline-block ml-1" />
              الحالة
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{statusLabels[status]}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-slate-600">
              عرض {filteredRequests.length} من {requests.length} طلب
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {!showDetails && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">التاريخ</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الشركة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">المسؤول</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الموظفين</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الباقة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الحالة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(request.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{request.company_name}</div>
                    <div className="text-sm text-slate-500">{request.company_size}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">{request.representative_name}</div>
                    <div className="text-sm text-slate-500">{request.representative_role}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {request.employees_needed}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {request.selected_package_slug || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      request.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                      request.status === 'contacted' ? 'bg-green-100 text-green-800' :
                      request.status === 'closed' ? 'bg-slate-100 text-slate-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {statusLabels[request.status] || request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(request)}
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

      {/* Details Modal */}
      {showDetails && selectedRequest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">تفاصيل الطلب</h2>
            <button
              onClick={() => setShowDetails(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                <Building className="w-5 h-5 text-blue-600" />
                معلومات الشركة
              </div>
              <div>
                <div className="text-sm text-slate-500">اسم الشركة</div>
                <div className="font-medium text-slate-900">{selectedRequest.company_name}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">حجم الشركة</div>
                <div className="font-medium text-slate-900">{selectedRequest.company_size}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">نشاط الشركة</div>
                <div className="font-medium text-slate-900">{selectedRequest.company_activity}</div>
              </div>
            </div>

            {/* Representative Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                معلومات المسؤول
              </div>
              <div>
                <div className="text-sm text-slate-500">الاسم</div>
                <div className="font-medium text-slate-900">{selectedRequest.representative_name}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">المسمى الوظيفي</div>
                <div className="font-medium text-slate-900">{selectedRequest.representative_role}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">الجوال</div>
                <div className="font-medium text-slate-900">{selectedRequest.mobile}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">البريد الإلكتروني</div>
                <div className="font-medium text-slate-900">{selectedRequest.email}</div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="border-t border-slate-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">تفاصيل الوظيفة</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-500">طبيعة الوظيفة</div>
                <div className="font-medium text-slate-900">{selectedRequest.vacancy_nature}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">عدد الموظفين المطلوبين</div>
                <div className="font-medium text-slate-900">{selectedRequest.employees_needed}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-slate-500 mb-2">التخصصات المطلوبة</div>
                <div className="flex flex-wrap gap-2">
                  {(selectedRequest.required_professions || []).map((prof, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {prof}
                    </span>
                  ))}
                </div>
              </div>
              {selectedRequest.challenges && selectedRequest.challenges.length > 0 && (
                <div className="md:col-span-2">
                  <div className="text-sm text-slate-500 mb-2">التحديات</div>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedRequest.challenges.map((challenge, idx) => (
                      <li key={idx} className="text-sm text-slate-700">{challenge}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedRequest.selected_package_slug && (
                <div>
                  <div className="text-sm text-slate-500">الباقة المختارة</div>
                  <div className="font-medium text-slate-900">{selectedRequest.selected_package_slug}</div>
                </div>
              )}
            </div>
          </div>

          {/* Status Update */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">تحديث الحالة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الحالة
                </label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{statusLabels[status]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  ملاحظات إدارية
                </label>
                <textarea
                  value={editData.admin_notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, admin_notes: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="أضف ملاحظات داخلية..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleUpdateStatus}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>حفظ التحديثات</span>
            </button>
            <button
              onClick={() => setShowDetails(false)}
              className="flex items-center gap-2 bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition"
            >
              <X className="w-5 h-5" />
              <span>إلغاء</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default QuoteRequestsManagement
