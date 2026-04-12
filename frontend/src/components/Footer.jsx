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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">SCQ</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">SCQ</h3>
                <p className="text-sm text-blue-400">{isRTL ? 'تكميل للاستشارات' : 'Takmeel Consulting'}</p>
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
