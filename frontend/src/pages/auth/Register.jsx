import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const Register = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl items-center justify-center mb-4 shadow-lg">
              <span className="text-white font-bold text-3xl">SCQ</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {isRTL ? 'التسجيل متاح قريباً' : 'Registration Coming Soon'}
            </h1>
            <p className="text-slate-600">
              {isRTL ? 'نعمل على تحسين نظام التسجيل' : 'We are improving our registration system'}
            </p>
          </div>

          {/* Info Message */}
          <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-slate-700 text-center leading-relaxed">
              {isRTL 
                ? 'التسجيل الذاتي غير متاح حالياً. للحصول على حساب، يرجى التواصل معنا عبر صفحة "تواصل معنا" وسنقوم بإنشاء حساب لك.'
                : 'Self-registration is currently unavailable. To get an account, please contact us via the "Contact Us" page and we will create an account for you.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/contact"
              className="block w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isRTL ? 'تواصل معنا' : 'Contact Us'}
            </Link>

            <Link
              to="/login"
              className="block w-full py-3 rounded-xl bg-slate-200 text-slate-700 font-semibold text-center hover:bg-slate-300 transition-colors"
            >
              {isRTL ? 'لديك حساب؟ تسجيل الدخول' : 'Have an account? Login'}
            </Link>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link to="/" className={`inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
