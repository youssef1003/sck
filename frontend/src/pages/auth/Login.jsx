import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const Login = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      // Check if admin credentials
      if (formData.email === 'admin' && formData.password === 'scq2025') {
        // Main Admin login
        localStorage.setItem('admin_token', 'authenticated')
        localStorage.setItem('admin_user', JSON.stringify({ 
          username: 'admin', 
          role: 'admin',
          permissions: 'all'
        }))
        navigate('/admin/dashboard')
        setIsLoading(false)
        return
      }

      // Check if sub-admin credentials (3 accounts)
      const subAdmins = [
        { email: 'subadmin1', password: 'scq2025sub1', name: 'Sub Admin 1' },
        { email: 'subadmin2', password: 'scq2025sub2', name: 'Sub Admin 2' },
        { email: 'subadmin3', password: 'scq2025sub3', name: 'Sub Admin 3' }
      ]

      const subAdmin = subAdmins.find(sa => sa.email === formData.email && sa.password === formData.password)
      
      if (subAdmin) {
        // Sub-Admin login
        localStorage.setItem('admin_token', 'authenticated')
        localStorage.setItem('admin_user', JSON.stringify({ 
          username: subAdmin.name, 
          role: 'subadmin',
          permissions: 'limited' // careers, content editing only
        }))
        navigate('/admin/dashboard')
        setIsLoading(false)
        return
      }

      // Check regular users (clients and employers)
      const users = JSON.parse(localStorage.getItem('scq_users') || '[]')
      const user = users.find(u => u.email === formData.email && u.password === formData.password)

      if (user) {
        // Regular user login successful
        localStorage.setItem('scq_user_token', 'authenticated')
        localStorage.setItem('scq_user_data', JSON.stringify(user))
        
        // Redirect based on user type
        if (user.userType === 'employer') {
          navigate('/employer/dashboard')
        } else {
          navigate('/dashboard')
        }
      } else {
        setError(isRTL ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password')
      }
      setIsLoading(false)
    }, 1000)
  }

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
              {isRTL ? 'تسجيل الدخول' : 'Login'}
            </h1>
            <p className="text-slate-600">
              {isRTL ? 'مرحباً بعودتك إلى SCQ' : 'Welcome Back to SCQ'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {isRTL ? 'البريد الإلكتروني أو اسم المستخدم' : 'Email or Username'}
              </label>
              <div className="relative">
                <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={isRTL ? 'أدخل البريد الإلكتروني أو admin' : 'Enter email or admin'}
                  className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {isRTL ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (isRTL ? 'جاري تسجيل الدخول...' : 'Logging in...') 
                : (isRTL ? 'تسجيل الدخول' : 'Login')}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {isRTL ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">
                {isRTL ? 'إنشاء حساب' : 'Register'}
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
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

export default Login
