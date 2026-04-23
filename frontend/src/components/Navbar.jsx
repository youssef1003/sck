import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, User, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import BookingModal from './BookingModal'
import LanguageSwitcher from './LanguageSwitcher'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('scq_user_data')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [location])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.careers'), path: '/careers' },
    { name: t('nav.blog'), path: '/blog' },
    { name: t('nav.contact'), path: '/contact' },
  ]

  return (
    <nav
      className={`synqor-navbar fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">SCQ</span>
            </div>
            <div className="hidden md:block">
              <h1 className={`text-xl font-bold ${isScrolled ? 'text-blue-900' : 'text-white'}`}>
                SCQ
              </h1>
              <p className={`text-xs ${isScrolled ? 'text-blue-600' : 'text-blue-200'}`}>
                {isRTL ? 'استشارات إدارية' : 'Consulting'}
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className={`hidden md:flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`synqor-nav-link text-sm font-medium transition-colors relative group px-3 py-2 ${
                  location.pathname === link.path
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <LanguageSwitcher />
            
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 shadow-md ml-2"
              >
                <User className="w-4 h-4" />
                <span className="max-w-[80px] truncate text-sm">{user.fullName}</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 ml-2 text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isRTL ? 'دخول' : 'Login'}</span>
                </Link>
                
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 shadow-md text-sm"
                >
                  <User className="w-4 h-4" />
                  <span>{isRTL ? 'تسجيل' : 'Sign Up'}</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100/10 transition-colors"
          >
            {isOpen ? (
              <X className={isScrolled ? 'text-blue-900' : 'text-white'} size={24} />
            ) : (
              <Menu className={isScrolled ? 'text-blue-900' : 'text-white'} size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2 text-base font-medium ${
                    location.pathname === link.path
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-2">
                <LanguageSwitcher />
              </div>
              
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <User className="w-5 h-5" />
                  <span className="truncate">{user.fullName}</span>
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 w-full px-4 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <LogIn className="w-5 h-5" />
                    {isRTL ? 'تسجيل الدخول' : 'Login'}
                  </Link>
                  
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <User className="w-5 h-5" />
                    {isRTL ? 'إنشاء حساب جديد' : 'Create Account'}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </nav>
  )
}

export default Navbar
