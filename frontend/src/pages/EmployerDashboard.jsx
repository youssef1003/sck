import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  User, 
  Users,
  Briefcase,
  LogOut,
  Home,
  Mail,
  Phone,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
  Search,
  Filter
} from 'lucide-react'

const EmployerDashboard = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [applications, setApplications] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedApp, setSelectedApp] = useState(null)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('scq_user_token')
    const user = JSON.parse(localStorage.getItem('scq_user_data') || '{}')
    
    if (!token || !user.id || user.userType !== 'employer') {
      navigate('/login')
      return
    }

    setUserData(user)
    loadApplications()
  }, [navigate])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter])

  const loadApplications = () => {
    const allApplications = JSON.parse(localStorage.getItem('scq_applications') || '[]')
    setApplications(allApplications)
  }

  const filterApplications = () => {
    let filtered = [...applications]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }

  const handleLogout = () => {
    localStorage.removeItem('scq_user_token')
    localStorage.removeItem('scq_user_data')
    navigate('/')
  }

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'قيد المراجعة', color: 'yellow', icon: Clock },
      approved: { label: 'مقبول', color: 'green', icon: CheckCircle },
      rejected: { label: 'مرفوض', color: 'red', icon: XCircle }
    }
    const cfg = config[status] || config.pending
    const Icon = cfg.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-${cfg.color}-100 text-${cfg.color}-700`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    )
  }

  const getStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    }
  }

  if (!userData) return null

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">الرئيسية</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-slate-900">{userData.fullName}</p>
                <p className="text-sm text-blue-600">صاحب عمل</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">{userData.fullName?.[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-l from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2">مرحباً، {userData.fullName} 👋</h1>
            <p className="text-purple-100 text-lg">إدارة المتقدمين للوظائف</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-slate-900">{stats.total}</span>
            </div>
            <p className="text-slate-600 font-medium">إجمالي المتقدمين</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-slate-900">{stats.pending}</span>
            </div>
            <p className="text-slate-600 font-medium">قيد المراجعة</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-slate-900">{stats.approved}</span>
            </div>
            <p className="text-slate-600 font-medium">مقبول</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-600" />
              <span className="text-3xl font-bold text-slate-900">{stats.rejected}</span>
            </div>
            <p className="text-slate-600 font-medium">مرفوض</p>
          </motion.div>
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
                placeholder="بحث بالاسم، البريد، الوظيفة، أو الكود..."
                className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none min-w-[160px]"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">قيد المراجعة</option>
                <option value="approved">مقبول</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredApplications.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
                <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">لا توجد طلبات توظيف</p>
              </div>
            ) : (
              filteredApplications.map((app) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedApp(app)}
                  className={`bg-white rounded-2xl p-6 shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedApp?.id === app.id
                      ? 'border-purple-500'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {app.fullName}
                      </h3>
                      <p className="text-purple-600 font-semibold mb-2">{app.position}</p>
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
                    {getStatusBadge(app.status)}
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
            {selectedApp ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
                <h3 className="text-xl font-bold text-slate-900 mb-6">تفاصيل المتقدم</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm text-slate-500 block mb-1">الاسم الكامل</label>
                    <p className="font-semibold text-slate-900">{selectedApp.fullName}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-500 block mb-1">البريد الإلكتروني</label>
                    <p className="font-semibold text-slate-900 text-sm break-all">{selectedApp.email}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-500 block mb-1">رقم الهاتف</label>
                    <p className="font-semibold text-slate-900" dir="ltr">{selectedApp.phone}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-500 block mb-1">الوظيفة المطلوبة</label>
                    <p className="font-semibold text-slate-900">{selectedApp.position}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-500 block mb-1">سنوات الخبرة</label>
                    <p className="font-semibold text-slate-900">{selectedApp.experience}</p>
                  </div>

                  {selectedApp.education && (
                    <div>
                      <label className="text-sm text-slate-500 block mb-1">المؤهل الدراسي</label>
                      <p className="font-semibold text-slate-900">{selectedApp.education}</p>
                    </div>
                  )}

                  {selectedApp.currentCompany && (
                    <div>
                      <label className="text-sm text-slate-500 block mb-1">الشركة الحالية</label>
                      <p className="font-semibold text-slate-900">{selectedApp.currentCompany}</p>
                    </div>
                  )}

                  {selectedApp.coverLetter && (
                    <div>
                      <label className="text-sm text-slate-500 block mb-1">خطاب التقديم</label>
                      <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg">
                        {selectedApp.coverLetter}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-slate-500 block mb-1">كود المتقدم</label>
                    <p className="font-mono font-bold text-purple-600">{selectedApp.employeeCode}</p>
                  </div>
                </div>

                {/* Contact Button */}
                <a
                  href={`mailto:${selectedApp.email}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all mb-3"
                >
                  <Mail className="w-5 h-5" />
                  تواصل عبر البريد
                </a>

                <a
                  href={`tel:${selectedApp.phone}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  اتصل الآن
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
                <Eye className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">اختر متقدماً لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployerDashboard
