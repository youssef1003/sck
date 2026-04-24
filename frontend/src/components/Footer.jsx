import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentYear = new Date().getFullYear()

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.careers'), path: '/careers' },
    { name: t('nav.blog'), path: '/blog' },
    { name: t('nav.contact'), path: '/contact' },
  ]

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Professional SCQ Logo */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
                <svg width="28" height="28" viewBox="0 0 100 100" className="text-white">
                  {/* S */}
                  <path d="M15 25 Q15 15 25 15 L35 15 Q45 15 45 25 Q45 35 35 35 L25 35 Q15 35 15 45 Q15 55 25 55 L35 55 Q45 55 45 65" 
                        stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"/>
                  
                  {/* C */}
                  <path d="M75 25 Q65 15 55 25 L55 45 Q55 55 65 55 Q75 55 75 45" 
                        stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"/>
                  
                  {/* Q with checkmark */}
                  <circle cx="85" cy="40" r="12" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path d="M80 40 L83 43 L90 36" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M90 48 L95 53" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>SYNQOR</h3>
                <p className="text-sm text-blue-400" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {isRTL ? 'أنظمة الجودة والاستشارات' : 'Quality Systems & Consulting'}
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">{t('footer.quick_links')}</h4>
            <ul className="space-y-2">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">{t('footer.services_title')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>{t('services.feasibility_studies.title')}</li>
              <li>{t('services.strategic_planning.title')}</li>
              <li>{t('services.organizational_dev.title')}</li>
              <li>{t('services.hr_resources.title')}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">{t('footer.contact_title')}</h4>
            <ul className="space-y-3">
              <li className={`flex items-center gap-3 text-sm text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Mail size={18} className="text-blue-400" />
                <span>info@scq-consulting.com</span>
              </li>
              <li className={`flex items-center gap-3 text-sm text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone size={18} className="text-blue-400" />
                <span>+966 50 000 0000</span>
              </li>
              <li className={`flex items-center gap-3 text-sm text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin size={18} className="text-blue-400" />
                <span>{t('footer.saudi')} | {t('footer.egypt')}</span>
              </li>
            </ul>
            
            {/* Social Media */}
            <div className={`flex gap-4 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {[Linkedin, Twitter, Facebook, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all duration-300 hover:scale-110"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
