import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowRight,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Briefcase,
  Calendar
} from 'lucide-react'

const CareersManagement = () => {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState(null)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('scq_admin_token')
    if (!token) {
      navigate('/admin/login')
      return
    }

    // Load applications from localStorage (temporary)
    const stored = localStorage.getItem('scq_applications')
    if (stored) {
      setApplications(JSON.parse(stored))
    }
  }, [navigate])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow'
      case 'approved': return 'green'
      case 'rejected': return 'red'
      default: return 'gray'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة'
      case 'approved': return 'مقبول'
      case 'rejected': return 'مرفوض'
      default: return 'غير محدد'
    }
  }

  const updateStatus = (id, newStatus) => {
    const updated = applications.map(app =>
      app.id === id ? { ...app, status: newStatus } : app
    )
    setApplications(updated)
    localStorage.setItem('scq_applications', JSON.stringify(updated))
  }

  const deleteApplication = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      const updated = applications.filter(app => app.id !== id)
      setApplications(updated)
      localStorage.setItem('scq_applications', JSON.stringify(updated))
      setSelectedApplication(null)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/dashboard"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">إدارة طلبات التوظيف</h1>
              <p className="text-slate-600 mt-1">عرض وإدارة جميع المتقدمين</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
              {applications.length} طلب
            </span>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث بالاسم، البريد، الوظيفة، أو الكود..."
                className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none appearance-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">قيد المراجعة</option>
                <option value="approved">مقبول</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>

            {/* Export Button */}
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              <Download className="w-5 h-5" />
              تصدير Excel
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredApplications.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-lg border-2 border-slate-100">
                <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">لا توجد طلبات توظيف</p>
              </div>
            ) : (
              filteredApplications.map((app) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedApplication(app)}
                  className={`bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all hover:shadow-xl ${
                    selectedApplication?.id === app.id
                      ? 'border-blue-500'
                      : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {app.fullName}
                      </h3>
                      <p className="text-blue-600 font-semibold mb-2">{app.position}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {app.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {app.phone}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold bg-${getStatusColor(app.status)}-100 text-${getStatusColor(app.status)}-700`}>
                      {getStatusText(app.status)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-mono">
                      {app.employeeCode}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(app.submittedAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedApplication ? (
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 sticky top-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">تفاصيل المتقدم</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm text-slate-500 block mb-1">الاسم الكامل</label>
                    <p className="font-semibold text-slate-900">{selectedApplication.fullName}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-500 block mb-1">البريد الإلكتروني</label>
                    <p className="font-semibold text-slate-900">{selectedApplication.email}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-500 block mb-1">رقم الهاتف</label>
                    <p className="font-semibold text-slate-900">{selectedApplication.phone}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-500 block mb-1">الوظيفة المطلوبة</label>
                    <p className="font-semibold text-slate-900">{selectedApplication.position}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-500 block mb-1">سنوات الخبرة</label>
                    <p className="font-semibold text-slate-900">{selectedApplication.experience}</p>
                  </div>

                  {selectedApplication.education && (
                    <div>
                      <label className="text-sm text-slate-500 block mb-1">المؤهل الدراسي</label>
                      <p className="font-semibold text-slate-900">{selectedApplication.education}</p>
                    </div>
                  )}

                  {selectedApplication.currentCompany && (
                    <div>
                      <label className="text-sm text-slate-500 block mb-1">الشركة الحالية</label>
                      <p className="font-semibold text-slate-900">{selectedApplication.currentCompany}</p>
                    </div>
                  )}

                  {selectedApplication.coverLetter && (
                    <div>
                      <label className="text-sm text-slate-500 block mb-1">خطاب التقديم</label>
                      <p className="text-slate-700 text-sm leading-relaxed">{selectedApplication.coverLetter}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-slate-500 block mb-1">كود المتقدم</label>
                    <p className="font-mono font-bold text-blue-600">{selectedApplication.employeeCode}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => updateStatus(selectedApplication.id, 'approved')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    قبول
                  </button>

                  <button
                    onClick={() => updateStatus(selectedApplication.id, 'rejected')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    رفض
                  </button>

                  <button
                    onClick={() => updateStatus(selectedApplication.id, 'pending')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
                  >
                    <Clock className="w-5 h-5" />
                    قيد المراجعة
                  </button>

                  <button
                    onClick={() => deleteApplication(selectedApplication.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    حذف
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-lg border-2 border-slate-100">
                <Eye className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">اختر طلباً لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CareersManagement
