import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Phone, LogOut, FileText, Calendar, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const Dashboard = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('scq_user_token')
    const userData = localStorage.getItem('scq_user_data')

    if (!token || !userData) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Get user's applications
    const allApplications = JSON.parse(localStorage.getItem('scq_applications') || '[]')
    const userApps = allApplications.filter(app => app.email === parsedUser.email)
    setApplications(userApps)
  }, [navigate])

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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.fullName}</h1>
                <p className="text-blue-200">{isRTL ? 'لوحة التحكم' : 'Dashboard'}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className={`text-xl font-bold text-slate-900 mb-6 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'معلومات الحساب' : 'Profile Information'}
              </h2>
              <div className="space-y-4">
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm text-slate-500">{isRTL ? 'الاسم' : 'Name'}</p>
                    <p className="font-medium text-slate-900">{user.fullName}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm text-slate-500">{isRTL ? 'البريد الإلكتروني' : 'Email'}</p>
                    <p className="font-medium text-slate-900 break-all">{user.email}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm text-slate-500">{isRTL ? 'الهاتف' : 'Phone'}</p>
                    <p className="font-medium text-slate-900">{user.phone}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm text-slate-500">{isRTL ? 'تاريخ التسجيل' : 'Member Since'}</p>
                    <p className="font-medium text-slate-900">
                      {new Date(user.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2 className="text-xl font-bold text-slate-900">
                  {isRTL ? 'طلبات التوظيف' : 'Job Applications'}
                </h2>
                <Link
                  to="/careers"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                >
                  {isRTL ? 'تقديم طلب جديد' : 'New Application'}
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">
                    {isRTL ? 'لم تقدم أي طلبات توظيف بعد' : 'No applications submitted yet'}
                  </p>
                  <Link
                    to="/careers"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isRTL ? 'تقديم طلب الآن' : 'Submit Application Now'}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <motion.div
                      key={app.employeeCode}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-colors"
                    >
                      <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={isRTL ? 'text-right' : ''}>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{app.position}</h3>
                          <p className="text-sm text-slate-500">
                            {isRTL ? 'رقم الموظف: ' : 'Employee Code: '}
                            <span className="font-mono font-medium text-blue-600">{app.employeeCode}</span>
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${getStatusColor(app.status)} ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {getStatusIcon(app.status)}
                          <span className="text-sm font-medium">{getStatusText(app.status)}</span>
                        </div>
                      </div>
                      <div className={`grid grid-cols-2 gap-4 text-sm ${isRTL ? 'text-right' : ''}`}>
                        <div>
                          <p className="text-slate-500">{isRTL ? 'الخبرة' : 'Experience'}</p>
                          <p className="font-medium text-slate-900">{app.experience}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">{isRTL ? 'التعليم' : 'Education'}</p>
                          <p className="font-medium text-slate-900">{app.education || '-'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">{isRTL ? 'تاريخ التقديم' : 'Applied On'}</p>
                          <p className="font-medium text-slate-900">
                            {new Date(app.submittedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">{isRTL ? 'فترة الإشعار' : 'Notice Period'}</p>
                          <p className="font-medium text-slate-900">{app.noticePeriod || '-'}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
