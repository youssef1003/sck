import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Filter, Loader, AlertCircle, Clock, User, FileText } from 'lucide-react'
import { getAuditLogs } from '../../utils/adminApi'

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    action: '',
    resource_type: '',
    search: ''
  })

  const actionOptions = ['create', 'update', 'delete', 'login', 'logout']
  const resourceTypeOptions = [
    'service_page', 'recruitment_package', 'quote_request', 
    'candidate_profile', 'subadmin', 'user', 'blog_post'
  ]

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await getAuditLogs()
      setLogs(response.data || [])
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      setError('فشل في تحميل سجلات التدقيق')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    if (filters.action && log.action !== filters.action) return false
    if (filters.resource_type && log.resource_type !== filters.resource_type) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        log.actor_email?.toLowerCase().includes(search) ||
        log.resource_id?.toLowerCase().includes(search)
      )
    }
    return true
  })

  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800'
      case 'update': return 'bg-blue-100 text-blue-800'
      case 'delete': return 'bg-red-100 text-red-800'
      case 'login': return 'bg-purple-100 text-purple-800'
      case 'logout': return 'bg-slate-100 text-slate-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getActionLabel = (action) => {
    const labels = {
      create: 'إنشاء',
      update: 'تحديث',
      delete: 'حذف',
      login: 'تسجيل دخول',
      logout: 'تسجيل خروج'
    }
    return labels[action] || action
  }

  const getResourceLabel = (resourceType) => {
    const labels = {
      service_page: 'خدمة',
      recruitment_package: 'باقة توظيف',
      quote_request: 'طلب سعر',
      candidate_profile: 'مرشح',
      subadmin: 'مساعد',
      user: 'مستخدم',
      blog_post: 'مقالة'
    }
    return labels[resourceType] || resourceType
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">سجلات التدقيق</h1>
        <div className="text-sm text-slate-600">
          {filteredLogs.length} سجل
        </div>
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
              <Filter className="w-4 h-4 inline-block ml-1" />
              الإجراء
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              {actionOptions.map(action => (
                <option key={action} value={action}>{getActionLabel(action)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <FileText className="w-4 h-4 inline-block ml-1" />
              نوع المورد
            </label>
            <select
              value={filters.resource_type}
              onChange={(e) => setFilters(prev => ({ ...prev, resource_type: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              {resourceTypeOptions.map(type => (
                <option key={type} value={type}>{getResourceLabel(type)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <User className="w-4 h-4 inline-block ml-1" />
              بحث (المستخدم / المعرف)
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="البريد الإلكتروني أو معرف المورد..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">التاريخ والوقت</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">المستخدم</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الإجراء</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">المورد</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">المعرف</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">التفاصيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredLogs.map((log) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    <div>
                      <div>{new Date(log.created_at).toLocaleDateString('ar-SA')}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(log.created_at).toLocaleTimeString('ar-SA')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-slate-900">
                      {log.users?.full_name || 'غير معروف'}
                    </div>
                    <div className="text-slate-500">{log.users?.email || '-'}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                    {getActionLabel(log.action)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {getResourceLabel(log.resource_type)}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-slate-600">
                  {log.resource_id || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {log.metadata && Object.keys(log.metadata).length > 0 ? (
                    <details className="cursor-pointer">
                      <summary className="text-blue-600 hover:text-blue-700">عرض</summary>
                      <pre className="mt-2 text-xs bg-slate-50 p-2 rounded overflow-auto max-w-xs">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  ) : (
                    '-'
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            لا توجد سجلات تدقيق
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditLogs
