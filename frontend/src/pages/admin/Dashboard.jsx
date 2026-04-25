import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  Briefcase,
  MessageSquare,
  FileText,
  CalendarCheck,
  Home,
  TrendingUp,
  Clock,
  ArrowUpRight
} from 'lucide-react'
import { adminAPI, systemAPI } from '../../utils/apiClient'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStats()
        if (response.success) {
          setStats(response.data)
        } else {
          throw new Error(response.error || 'Failed to fetch stats')
        }
      } catch (err) {
        setError('فشل في تحميل الإحصائيات')
        console.error(err)
        // Fallback to default stats
        setStats({
          users: 0,
          bookings: 0,
          contacts: 0,
          blog_posts: 0,
          new_messages: 0,
          pending_bookings: 0
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'المستخدمون', value: stats?.users ?? '—', icon: Users, color: 'blue', path: '/admin/users', gradient: 'from-blue-500 to-blue-600' },
    { label: 'الحجوزات', value: stats?.bookings ?? '—', icon: CalendarCheck, color: 'cyan', path: '/admin/bookings', gradient: 'from-cyan-500 to-teal-500' },
    { label: 'الرسائل الجديدة', value: stats?.new_messages ?? '—', icon: MessageSquare, color: 'green', path: '/admin/contacts', gradient: 'from-emerald-500 to-green-500' },
    { label: 'المقالات', value: stats?.blog_posts ?? '—', icon: FileText, color: 'purple', path: '/admin/blog', gradient: 'from-purple-500 to-violet-500' },
  ]

  const quickActions = [
    { title: 'تعديل الصفحة الرئيسية', desc: 'Hero, Services, Stats', icon: Home, path: '/admin/home', color: 'blue' },
    { title: 'إدارة الخدمات', desc: 'تعديل صفحة خدماتنا', icon: Briefcase, path: '/admin/services', color: 'cyan' },
    { title: 'إدارة من نحن', desc: 'تعديل صفحة من نحن', icon: Users, path: '/admin/about', color: 'purple' },
    { title: 'إدارة تواصل معنا', desc: 'تعديل معلومات الاتصال', icon: MessageSquare, path: '/admin/contact-page', color: 'emerald' },
    { title: 'إدارة التوظيف', desc: 'عرض الطلبات والمتقدمين', icon: Briefcase, path: '/admin/careers', color: 'amber' },
    { title: 'إدارة المستخدمين', desc: 'الأدوار والصلاحيات', icon: Users, path: '/admin/users', color: 'rose' },
    { title: 'إدارة الحجوزات', desc: 'حجوزات الاستشارات', icon: CalendarCheck, path: '/admin/bookings', color: 'indigo' },
    { title: 'الرسائل', desc: 'رسائل التواصل', icon: MessageSquare, path: '/admin/contacts', color: 'pink' },
    { title: 'المدونة', desc: 'إنشاء وتعديل المقالات', icon: FileText, path: '/admin/blog', color: 'teal' },
  ]

  // Check if user is Super Admin
  const isSuperAdmin = () => {
    const userData = localStorage.getItem('user_data')
    if (!userData) return false
    try {
      const user = JSON.parse(userData)
      return user.role === 'admin'
    } catch {
      return false
    }
  }

  return (
    <div>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-l from-blue-600 via-blue-700 to-cyan-600 rounded-2xl p-6 md:p-8 mb-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">مرحباً بك في لوحة التحكم 👋</h1>
          <p className="text-blue-100 text-lg">إدارة محتوى الموقع بالكامل من مكان واحد</p>
        </div>
        <div className="absolute left-6 top-6 opacity-10">
          <TrendingUp className="w-32 h-32" />
        </div>
      </motion.div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                <div className="w-16 h-8 bg-slate-200 rounded-lg" />
              </div>
              <div className="w-24 h-5 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-8 mb-8 text-center shadow-sm border border-slate-200">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={stat.path} className="block bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 font-medium">{stat.label}</p>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pending Alerts */}
      {stats && (stats.pending_bookings > 0 || stats.new_messages > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 mb-8 flex items-center gap-4"
        >
          <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">تحتاج اهتمامك</p>
            <p className="text-sm text-amber-700">
              {stats.pending_bookings > 0 && `${stats.pending_bookings} حجز بانتظار التأكيد`}
              {stats.pending_bookings > 0 && stats.new_messages > 0 && ' • '}
              {stats.new_messages > 0 && `${stats.new_messages} رسالة جديدة`}
            </p>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.05 }}>
              <Link
                to={action.path}
                className={`block p-5 rounded-xl border-2 border-${action.color}-100 hover:border-${action.color}-300 hover:bg-${action.color}-50/50 transition-all text-center group`}
              >
                <action.icon className={`w-8 h-8 text-${action.color}-600 mx-auto mb-3 group-hover:scale-110 transition-transform`} />
                <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                <p className="text-sm text-slate-600">{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Sub-Admins Management - Super Admin Only */}
        {isSuperAdmin() && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              إدارة متقدمة (Super Admin فقط)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sub-Admins Management */}
              <Link
                to="/admin/subadmins"
                className="block p-5 rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 hover:border-orange-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="font-bold text-slate-900 text-lg mb-1">إدارة المساعدين</h4>
                    <p className="text-sm text-slate-600">إنشاء وإدارة حسابات المساعدين وصلاحياتهم</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-orange-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </Link>

              {/* System Backup */}
              <button
                onClick={async () => {
                  try {
                    await systemAPI.downloadBackup()
                    // Show success message
                  } catch (error) {
                    console.error('Backup failed:', error)
                  }
                }}
                className="block p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:border-blue-300 hover:shadow-md transition-all group text-right"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-lg mb-1">نسخ احتياطي</h4>
                    <p className="text-sm text-slate-600">تحميل نسخة احتياطية من جميع البيانات</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
