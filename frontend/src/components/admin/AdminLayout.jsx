import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  Home,
  FileText,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Bell,
  Shield,
  Package,
  DollarSign,
  UserCheck,
  Edit,
  ClipboardList
} from 'lucide-react'
import { hasAnyPermission, getCurrentUserPermissions, isSuperAdmin, PERMISSIONS } from '../../utils/permissions'

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [adminUser, setAdminUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user_data')
    if (!token || !userData) {
      navigate('/login')
      return
    }
    setAdminUser(JSON.parse(userData))
  }, [navigate])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    navigate('/')
  }

  const userPermissions = getCurrentUserPermissions()
  const isSuper = isSuperAdmin()

  const menuItems = [
    { 
      title: 'لوحة التحكم', 
      icon: LayoutDashboard, 
      path: '/admin/dashboard', 
      permissions: [] // Always visible
    },
    { 
      title: 'المحتوى الرئيسي', 
      icon: Home, 
      path: '/admin/home-content', 
      permissions: ['content_view', 'content_edit', 'home_edit']
    },
    { 
      title: 'الخدمات', 
      icon: Briefcase, 
      path: '/admin/services', 
      permissions: ['services_view', 'services_edit']
    },
    { 
      title: 'باقات التوظيف', 
      icon: Package, 
      path: '/admin/packages', 
      permissions: ['packages_view', 'packages_edit']
    },
    { 
      title: 'طلبات الأسعار', 
      icon: DollarSign, 
      path: '/admin/quote-requests', 
      permissions: ['quote_requests_view', 'quote_requests_edit']
    },
    { 
      title: 'المرشحين', 
      icon: UserCheck, 
      path: '/admin/candidates', 
      permissions: ['candidates_view', 'candidates_edit']
    },
    { 
      title: 'المستخدمون', 
      icon: Users, 
      path: '/admin/users', 
      permissions: [PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_EDIT, PERMISSIONS.USERS_DELETE]
    },
    { 
      title: 'الحجوزات', 
      icon: CalendarCheck, 
      path: '/admin/bookings', 
      permissions: [PERMISSIONS.BOOKINGS_VIEW, PERMISSIONS.BOOKINGS_EDIT]
    },
    { 
      title: 'التوظيف', 
      icon: Briefcase, 
      path: '/admin/careers', 
      permissions: [PERMISSIONS.CAREERS_VIEW, PERMISSIONS.CAREERS_EDIT]
    },
    { 
      title: 'الرسائل', 
      icon: MessageSquare, 
      path: '/admin/contacts', 
      permissions: [PERMISSIONS.MESSAGES_VIEW, PERMISSIONS.MESSAGES_EDIT]
    },
    { 
      title: 'أصحاب العمل', 
      icon: Users, 
      path: '/admin/employers', 
      permissions: [PERMISSIONS.EMPLOYERS_VIEW, PERMISSIONS.EMPLOYERS_APPROVE]
    },
    { 
      title: 'المدونة', 
      icon: FileText, 
      path: '/admin/blog', 
      permissions: [PERMISSIONS.BLOG_VIEW, PERMISSIONS.BLOG_CREATE, PERMISSIONS.BLOG_EDIT]
    },
    { 
      title: 'المساعدين', 
      icon: Shield, 
      path: '/admin/subadmins', 
      permissions: ['subadmins_view', 'subadmins_edit']
    },
    { 
      title: 'سجلات التدقيق', 
      icon: ClipboardList, 
      path: '/admin/audit-logs', 
      permissions: ['audit_logs_view']
    },
  ]

  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter(item => {
    // Super Admin sees everything
    if (isSuper) return true
    
    // Super Admin only items
    if (item.superAdminOnly) return false
    
    // Items with no permission requirements (like dashboard)
    if (!item.permissions || item.permissions.length === 0) return true
    
    // Check if user has any of the required permissions
    return hasAnyPermission(userPermissions, item.permissions)
  })

  const isActive = (path) => location.pathname === path

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between mb-8 px-2">
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg">SCQ</span>
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">لوحة التحكم</h2>
              <p className="text-xs text-blue-300">Admin Panel</p>
            </div>
          </motion.div>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden md:block"
        >
          {isSidebarOpen ? <ChevronLeft className="w-5 h-5 text-blue-300" /> : <Menu className="w-5 h-5 text-blue-300" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {filteredMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
              isActive(item.path)
                ? 'bg-white/15 text-white shadow-lg shadow-blue-500/10'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isActive(item.path) && (
              <motion.div
                layoutId="activeTab"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-l-full"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? 'text-cyan-400' : ''}`} />
            {isSidebarOpen && (
              <span className="text-sm font-medium">{item.title}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="mt-auto pt-6 border-t border-white/10">
        {isSidebarOpen && adminUser && (
          <div className="px-4 py-3 mb-2">
            <p className="text-sm font-medium text-white truncate">{adminUser.fullName || adminUser.username || 'Admin'}</p>
            <div className="flex items-center gap-2 mt-1">
              {isSuper ? (
                <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded">
                  Super Admin
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 text-xs font-semibold rounded">
                  Sub-Admin
                </span>
              )}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-colors w-full text-red-300 hover:text-red-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isSidebarOpen && <span className="text-sm font-medium">تسجيل الخروج</span>}
        </button>
      </div>
    </>
  )

  if (!adminUser) return null

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-gradient-to-b from-blue-900 via-blue-950 to-slate-900 text-white fixed h-full z-40 shadow-2xl hidden md:flex flex-col p-4"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-gradient-to-b from-blue-900 via-blue-950 to-slate-900 text-white fixed h-full z-50 w-72 right-0 flex flex-col p-4 md:hidden"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute left-4 top-4 p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:mr-[280px]' : 'md:mr-[80px]'}`}>
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg md:hidden"
              >
                <Menu className="w-6 h-6 text-slate-700" />
              </button>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-slate-900">
                  {menuItems.find(i => isActive(i.path))?.title || 'لوحة التحكم'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {(adminUser?.username || 'A')[0].toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
