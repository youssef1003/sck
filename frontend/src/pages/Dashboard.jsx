import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  User, 
  Calendar, 
  MessageSquare, 
  FileText, 
  LogOut,
  Edit,
  Mail,
  Phone,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Home,
  Save,
  X
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [bookings, setBookings] = useState([])
  const [messages, setMessages] = useState([])
  const [applications, setApplications] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('scq_user_token')
    const user = JSON.parse(localStorage.getItem('scq_user_data') || '{}')
    
    if (!token || !user.id) {
      navigate('/login')
      return
    }

    setUserData(user)
    setEditForm({
      fullName: user.fullName || '',
      phone: user.phone || '',
      email: user.email || ''
    })

    // Load user data
    loadUserBookings(user.email)
    loadUserMessages(user.email)
    loadUserApplications(user.email)
  }, [navigate])

  const loadUserBookings = (email) => {
    const allBookings = JSON.parse(localStorage.getItem('scq_bookings') || '[]')
    const userBookings = allBookings.filter(b => b.email === email)
    setBookings(userBookings)
  }

  const loadUserMessages = (email) => {
    const allMessages = JSON.parse(localStorage.getItem('scq_contacts') || '[]')
    const userMessages = allMessages.filter(m => m.email === email)
    setMessages(userMessages)
  }

  const loadUserApplications = (email) => {
    const allApplications = JSON.parse(localStorage.getItem('scq_applications') || '[]')
    const userApps = allApplications.filter(app => app.email === email)
    setApplications(userApps)
  }

  const handleLogout = () => {
    localStorage.removeItem('scq_user_token')
    localStorage.removeItem('scq_user_data')
    navigate('/')
  }

  const handleUpdateProfile = () => {
    const users = JSON.parse(localStorage.getItem('scq_users') || '[]')
    const updatedUsers = users.map(u => 
      u.id === userData.id 
        ? { ...u, ...editForm }
        : u
    )
    localStorage.setItem('scq_users', JSON.stringify(updatedUsers))
    localStorage.setItem('scq_user_data', JSON.stringify({ ...userData, ...editForm }))
    setUserData({ ...userData, ...editForm })
    setIsEditing(false)
  }

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'قيد الانتظار', color: 'yellow', icon: Clock },
      confirmed: { label: 'مؤكد', color: 'blue', icon: CheckCircle },
      completed: { label: 'مكتمل', color: 'green', icon: CheckCircle },
      cancelled: { label: 'ملغي', color: 'red', icon: XCircle },
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

  if (!userData) return null

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
                <p className="text-sm text-slate-600">{userData.email}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
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
          className="bg-gradient-to-l from-blue-600 via-blue-700 to-cyan-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2">مرحباً، {userData.fullName} 👋</h1>
            <p className="text-blue-100 text-lg">إدارة حجوزاتك ورسائلك من مكان واحد</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">الملف الشخصي</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleUpdateProfile}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      حفظ
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <User className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="text-xs text-slate-500">الاسم</p>
                      <p className="font-medium text-slate-900">{userData.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Mail className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                      <p className="font-medium text-slate-900 text-sm break-all">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Phone className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="text-xs text-slate-500">رقم الهاتف</p>
                      <p className="font-medium text-slate-900" dir="ltr">{userData.phone || 'غير محدد'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-200">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
                  <p className="text-xs text-slate-600">حجز</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{messages.length}</p>
                  <p className="text-xs text-slate-600">رسالة</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{applications.length}</p>
                  <p className="text-xs text-slate-600">طلب</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bookings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">حجوزاتي</h2>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                  {bookings.length}
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">لا توجد حجوزات حتى الآن</p>
                  <Link
                    to="/services"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    احجز استشارة
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking, idx) => (
                    <div key={idx} className="p-4 border-2 border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-slate-900">{booking.serviceType}</h3>
                          <p className="text-sm text-slate-600">{booking.company || 'غير محدد'}</p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {booking.preferredDate || 'غير محدد'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.preferredTime || 'غير محدد'}
                        </span>
                      </div>
                      {booking.notes && (
                        <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                          {booking.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Applications */}
            {applications.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-slate-900">طلبات التوظيف</h2>
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                    {applications.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {applications.map((app, idx) => (
                    <div key={idx} className="p-4 border-2 border-slate-100 rounded-xl hover:border-purple-200 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-slate-900">{app.position}</h3>
                          <p className="text-sm text-slate-600 font-mono">{app.employeeCode}</p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                        <span>الخبرة: {app.experience}</span>
                        <span>التعليم: {app.education || '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-slate-900">رسائلي</h2>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                  {messages.length}
                </span>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">لا توجد رسائل حتى الآن</p>
                  <Link
                    to="/contact"
                    className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    أرسل رسالة
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, idx) => (
                    <div key={idx} className="p-4 border-2 border-slate-100 rounded-xl hover:border-green-200 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-slate-500">
                          {new Date(msg.date).toLocaleDateString('ar-EG')}
                        </p>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          msg.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          msg.status === 'contacted' ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {msg.status === 'new' ? 'جديد' : msg.status === 'contacted' ? 'تم التواصل' : 'قيد المتابعة'}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
