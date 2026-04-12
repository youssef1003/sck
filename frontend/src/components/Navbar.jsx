import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import BookingModal from './BookingModal'
import LanguageSwitcher from './LanguageSwitcher'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const location = useLocation()
  const { t } = useTranslation()

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
    { name: t('nav.blog'), path: '/blog' },
    { name: t('nav.contact'), path: '/contact' },
  ]

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">SCK</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-primary">SCK</h1>
              <p className="text-xs text-secondary">Smart Consulting</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors relative group ${
                  location.pathname === link.path
                    ? 'text-secondary'
                    : isScrolled
                    ? 'text-gray-700 hover:text-secondary'
                    : 'text-white hover:text-secondary'
                }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 right-0 h-0.5 bg-secondary transition-all duration-300 ${
                    location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
            <LanguageSwitcher />
            <button 
              onClick={() => setIsBookingOpen(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-secondary to-yellow-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              {t('booking.title')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? (
              <X className={isScrolled ? 'text-primary' : 'text-white'} size={24} />
            ) : (
              <Menu className={isScrolled ? 'text-primary' : 'text-white'} size={24} />
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
                      ? 'text-secondary'
                      : 'text-gray-700 hover:text-secondary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-2">
                <LanguageSwitcher />
              </div>
              <button 
                onClick={() => {
                  setIsBookingOpen(true)
                  setIsOpen(false)
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-secondary to-yellow-600 text-white rounded-lg font-medium"
              >
                {t('booking.title')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </nav>
  )
}

export default Navbar
