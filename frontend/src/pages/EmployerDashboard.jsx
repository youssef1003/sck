import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Phone, LogOut, Users, Search, Filter, ArrowRight, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const EmployerDashboard = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedApp, setSelectedApp] = useState(null)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('scq_user_token')
    const userData = localStorage.getItem('scq_user_data')

    if (!token || !userData) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    
    // Check if user is employer
    if (parsedUser.userType !== 'employer') {
      navigate('/dashboard')
      return
    }

    setUser(parsedUser)

    // Check if employer is approved
    if (parsedUser.userType === 'employer' && !parsedUser.isApproved) {
      // Employer not approved yet - show message
      setApplications([])
      setFilteredApplications([])
      return
    }

    // Get approved applications only (for approved employers)
    const allApplications = JSON.parse(localStorage.getItem('scq_applications') || '[]')
    const approvedApps = allApplications.filter(app => app.status === 'approved')
    setApplications(approvedApps)
    setFilteredApplications(approvedApps)
  }, [navigate])

  useEffect(() => {
    // Filter applications
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus)
    }

    setFilteredApplications(filtered)
  }, [searchTerm, filterStatus, applications])

  const handleLogout = () => {
    localStorage.removeItem('scq_user_token')
    localStorage.removeItem('scq_user_data')
    navigate('/')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />
      case 'rejected':
        return <XCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return isRTL ? 'مقبول' : 'Approved'
      case 'rejected':
        return isRTL ? 'مرفوض' : 'Rejected'
      default:
        return isRTL ? 'قيد المراجعة' : 'Pending'
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.fullName}</h1>
                <p className="text-blue-200">{isRTL ? 'لوحة تحكم صاحب العمل' : 'Employer Dashboard'}</p>
              </div>
            </div>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                {isRTL ? 'الرئيسية' : 'Home'}
              </Link>
              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <LogOut className="w-5 h-5" />
                {isRTL ? 'تسجيل الخروج' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Check if employer is approved */}
        {user.userType === 'employer' && !user.isApproved ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="inline-flex p-6 rounded-full bg-yellow-100 mb-6">
              <Clock className="w-16 h-16 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {isRTL ? 'حسابك قيد المراجعة' : 'Your Account is Under Review'}
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              {isRTL 
                ? 'شكراً لتسجيلك كصاحب عمل. حسابك قيد المراجعة من قبل الإدارة.'
                : 'Thank you for registering as an employer. Your account is under review by administration.'}
            </p>
            <div className="bg-blue-50 rounded-xl p-6 max-w-2xl mx-auto mb-8">
              <h3 className="font-bold text-slate-900 mb-3">
                {isRTL ? '📋 الخطوات التالية:' : '📋 Next Steps:'}
              </h3>
              <ul className={`text-slate-700 space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>{isRTL ? 'سيقوم فريقنا بمراجعة طلبك خلال 24-48 ساعة' : 'Our team will review your request within 24-48 hours'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>{isRTL ? 'سنتواصل معك عبر البريد الإلكتروني أو الهاتف' : 'We will contact you via email or phone'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>{isRTL ? 'بعد الموافقة، ستتمكن من الوصول إلى قاعدة بيانات المرشحين' : 'After approval, you will have access to our candidate database'}</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 max-w-2xl mx-auto">
              <p className="text-sm text-slate-600 mb-2">
                {isRTL ? '💡 هل تريد تسريع العملية؟' : '💡 Want to speed up the process?'}
              </p>
              <p className="text-slate-700">
                {isRTL 
                  ? 'تواصل معنا مباشرة عبر الواتساب أو البريد الإلكتروني'
                  : 'Contact us directly via WhatsApp or email'}
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-slate-500">{isRTL ? 'المرشحين المتاحين' : 'Available Candidates'}</p>
                <p className="text-3xl font-bold text-slate-900">{applications.length}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {isRTL ? 'المرشحين المقبولين من الإدارة' : 'Approved by Admin'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-slate-500">{isRTL ? 'إجمالي المشاهدات' : 'Total Views'}</p>
                <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {isRTL ? 'المرشحين الذين شاهدتهم' : 'Candidates you viewed'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'text-right' : ''}`}>
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isRTL ? 'بحث بالاسم، البريد، الوظيفة، أو الكود...' : 'Search by name, email, position, or code...'}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors`}
              />
            </div>
            <div className="relative">
              <Filter className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white`}
              >
                <option value="all">{isRTL ? 'كل المرشحين' : 'All Candidates'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className={`text-2xl font-bold text-slate-900 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'المرشحين المتاحين' : 'Available Candidates'}
          </h2>
          <p className={`text-sm text-slate-500 mb-6 ${isRTL ? 'text-right' : ''}`}>
            {isRTL 
              ? 'المرشحين الذين تمت الموافقة عليهم من قبل الإدارة'
              : 'Candidates approved by administration'}
          </p>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">
                {isRTL ? 'لا يوجد مرشحين متاحين حالياً' : 'No candidates available at the moment'}
              </p>
              <p className="text-xs text-slate-400">
                {isRTL 
                  ? 'سيظهر المرشحون هنا بعد موافقة الإدارة عليهم'
                  : 'Candidates will appear here after admin approval'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <motion.div
                  key={app.employeeCode}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-colors"
                >
                  <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : ''}>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{app.fullName}</h3>
                      <p className="text-sm text-slate-600 mb-2">{app.position}</p>
                      <p className="text-xs text-slate-500">
                        {isRTL ? 'رقم الموظف: ' : 'Employee Code: '}
                        <span className="font-mono font-medium text-blue-600">{app.employeeCode}</span>
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-green-50 border-green-200 text-green-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{isRTL ? 'مقبول' : 'Approved'}</span>
                    </div>
                  </div>
                  
                  <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>
                    <div>
                      <p className="text-slate-500">{isRTL ? 'البريد' : 'Email'}</p>
                      <p className="font-medium text-slate-900 truncate">{app.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{isRTL ? 'الهاتف' : 'Phone'}</p>
                      <p className="font-medium text-slate-900">{app.phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{isRTL ? 'الخبرة' : 'Experience'}</p>
                      <p className="font-medium text-slate-900">{app.experience}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{isRTL ? 'التعليم' : 'Education'}</p>
                      <p className="font-medium text-slate-900">{app.education || '-'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedApp(app)}
                    className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <Eye className="w-4 h-4" />
                    {isRTL ? 'عرض التفاصيل' : 'View Details'}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
          onClick={() => setSelectedApp(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all"
            >
              <XCircle size={24} />
            </button>

            <div className="p-8">
              <h2 className={`text-2xl font-bold text-slate-900 mb-6 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'تفاصيل المتقدم' : 'Applicant Details'}
              </h2>

              <div className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'الاسم الكامل' : 'Full Name'}</p>
                    <p className="font-medium text-slate-900">{selectedApp.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'رقم الموظف' : 'Employee Code'}</p>
                    <p className="font-mono font-medium text-blue-600">{selectedApp.employeeCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'البريد الإلكتروني' : 'Email'}</p>
                    <p className="font-medium text-slate-900">{selectedApp.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'الهاتف' : 'Phone'}</p>
                    <p className="font-medium text-slate-900">{selectedApp.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'الوظيفة المطلوبة' : 'Position'}</p>
                    <p className="font-medium text-slate-900">{selectedApp.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'سنوات الخبرة' : 'Experience'}</p>
                    <p className="font-medium text-slate-900">{selectedApp.experience}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'المؤهل الدراسي' : 'Education'}</p>
                    <p className="font-medium text-slate-900">{selectedApp.education || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'الشركة الحالية' : 'Current Company'}</p>
                    <p className="font-medium text-slate-900">{selectedApp.currentCompany || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'الراتب المتوقع' : 'Expected Salary'}</p>
                    <p className="font-medium text-slate-900">{selectedApp.expectedSalary || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'فترة الإشعار' : 'Notice Period'}</p>
                    <p className="font-medium text-slate-900">{selectedApp.noticePeriod || '-'}</p>
                  </div>
                </div>

                {selectedApp.linkedin && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">{isRTL ? 'LinkedIn' : 'LinkedIn'}</p>
                    <a href={selectedApp.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {selectedApp.linkedin}
                    </a>
                  </div>
                )}

                {selectedApp.portfolio && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">{isRTL ? 'معرض الأعمال' : 'Portfolio'}</p>
                    <a href={selectedApp.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {selectedApp.portfolio}
                    </a>
                  </div>
                )}

                {selectedApp.coverLetter && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">{isRTL ? 'خطاب التقديم' : 'Cover Letter'}</p>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-slate-700 whitespace-pre-wrap">{selectedApp.coverLetter}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-slate-500">{isRTL ? 'تاريخ التقديم' : 'Applied On'}</p>
                  <p className="font-medium text-slate-900">
                    {new Date(selectedApp.submittedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployerDashboard
