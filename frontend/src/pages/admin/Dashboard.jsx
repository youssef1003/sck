import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
  Home,
  Info,
  Wrench,
  BookOpen,
  Phone,
  Menu,
  X
} from 'lucide-react'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [adminUser, setAdminUser] = useState(null)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')
    
    if (!token || !userData) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setAdminUser(parsedUser)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    navigate('/')
  }

  const isSubAdmin = adminUser?.role === 'subadmin'

  const menuItems = [
    {
      title: 'لوحة التحكم',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      color: 'blue',
      allowSubAdmin: true
    },
    {
      title: 'الصفحة الرئيسية',
      icon: Home,
      path: '/admin/home',
      color: 'green',
      allowSubAdmin: true
    },
    {
      title: 'التوظيف',
      icon: Briefcase,
      path: '/admin/careers',
      color: 'yellow',
      allowSubAdmin: true
    },
    {
      title: 'الرسائل',
      icon: MessageSquare,
      path: '/admin/contacts',
      color: 'cyan',
      allowSubAdmin: true
    },
    {
      title: 'أصحاب العمل',
      icon: Users,
      path: '/admin/employers',
      color: 'purple',
      allowSubAdmin: false
    }
  ]

  // Filter menu items based on user role
  const filteredMenuItems = isSubAdmin 
    ? menuItems.filter(item => item.allowSubAdmin)
    : menuItems

  const stats = [
    { label: 'طلبات التوظيف', value: '0', color: 'blue', icon: Users },
    { label: 'الرسائل الجديدة', value: '0', color: 'green', icon: MessageSquare },
    { label: 'المقالات', value: '0', color: 'purple', icon: FileText },
    { label: 'الزوار اليوم', value: '0', color: 'orange', icon: LayoutDashboard }
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-gradient-to-b from-blue-900 to-blue-950 text-white fixed h-full z-50 shadow-2xl"
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SCQ</span>
                </div>
                <div>
                  <h2 className="font-bold text-lg">لوحة التحكم</h2>
                  <p className="text-xs text-blue-300">Admin Panel</p>
                </div>
              </motion.div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {filteredMenuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors group"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="text-sm font-medium">{item.title}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-colors w-full mt-8 text-red-300 hover:text-red-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="text-sm font-medium">تسجيل الخروج</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'mr-[280px]' : 'mr-[80px]'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">مرحباً بك في لوحة التحكم</h1>
              <p className="text-slate-600 mt-1">إدارة محتوى الموقع بالكامل</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900">Admin</p>
                <p className="text-xs text-slate-500">مدير النظام</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                </div>
                <p className="text-slate-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">إجراءات سريعة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/home"
                className="p-6 rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-center group"
              >
                <Home className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">تعديل الصفحة الرئيسية</h3>
                <p className="text-sm text-slate-600">Hero, Services, Stats</p>
              </Link>

              <Link
                to="/admin/careers"
                className="p-6 rounded-xl border-2 border-cyan-100 hover:border-cyan-300 hover:bg-cyan-50 transition-all text-center group"
              >
                <Briefcase className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">إدارة التوظيف</h3>
                <p className="text-sm text-slate-600">عرض الطلبات والمتقدمين</p>
              </Link>

              <Link
                to="/admin/employers"
                className="p-6 rounded-xl border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all text-center group"
              >
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">إدارة أصحاب العمل</h3>
                <p className="text-sm text-slate-600">الموافقة والاشتراكات</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
