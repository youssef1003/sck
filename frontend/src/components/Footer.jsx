import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SCK</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">SCK</h3>
                <p className="text-sm text-secondary">Smart Consulting</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              منصة استشارات إدارية ذكية تساعد الشركات في مصر والسعودية على النمو والتطور
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-secondary">روابط سريعة</h4>
            <ul className="space-y-2">
              {['الرئيسية', 'من نحن', 'خدماتنا', 'المدونة', 'تواصل معنا'].map((item, index) => (
                <li key={index}>
                  <Link
                    to={index === 0 ? '/' : `/${['', 'about', 'services', 'blog', 'contact'][index]}`}
                    className="text-gray-300 hover:text-secondary transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-secondary">خدماتنا</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>الاستشارات الإدارية</li>
              <li>استشارات الموارد البشرية</li>
              <li>التطوير التنظيمي</li>
              <li>التخطيط الاستراتيجي</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-secondary">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 space-x-reverse text-sm text-gray-300">
                <Mail size={18} className="text-secondary" />
                <span>info@sck-consulting.com</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse text-sm text-gray-300">
                <Phone size={18} className="text-secondary" />
                <span>+20 123 456 7890</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse text-sm text-gray-300">
                <MapPin size={18} className="text-secondary" />
                <span>القاهرة، مصر | الرياض، السعودية</span>
              </li>
            </ul>
            
            {/* Social Media */}
            <div className="flex space-x-4 space-x-reverse mt-6">
              {[Linkedin, Twitter, Facebook, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary transition-all duration-300 hover:scale-110"
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
            © {currentYear} SCK. جميع الحقوق محفوظة | صُنع بـ ❤️ في مصر والسعودية
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
