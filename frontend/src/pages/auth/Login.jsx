import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { authAPI } from '../../utils/apiClient'
import toast from 'react-hot-toast'

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

  // Clear any existing tokens when login page loads
  useEffect(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Clear any existing tokens first
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')

    try {
      const response = await authAPI.login(formData.email, formData.password)
      
      if (response.success) {
        // Handle both old format (token) and new format (data.access_token)
        const access_token = response.data?.access_token || response.token
        const refresh_token = response.data?.refresh_token
        const user = response.data?.user || response.user
        
        if (!access_token || !user) {
          throw new Error('Invalid response format from server')
        }
        
        // Store new tokens and user data WITH PERMISSIONS
        localStorage.setItem('access_token', access_token)
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token)
        }
        // Ensure permissions are stored
        const userData = {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          permissions: user.permissions || [],
          phone: user.phone,
          company: user.company,
          is_active: user.is_active
        }
        localStorage.setItem('user_data', JSON.stringify(userData))
        
        // Show success message
        toast.success(isRTL ? 'تم تسجيل الدخول بنجاح' : 'Login successful')
        
        // Redirect based on role - support both super_admin and admin
        if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'subadmin') {
          navigate('/admin/dashboard')
        } else if (user.role === 'employer') {
          navigate('/employer/dashboard')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      
      // Get error message from API response
      let errorMessage = 'Invalid credentials'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err.message) {
        errorMessage = err.message
      }
      
      // Translate to Arabic if needed
      if (isRTL) {
        if (errorMessage.includes('Only admin login')) {
          errorMessage = 'يُسمح بتسجيل دخول المشرف العام فقط حالياً'
        } else if (errorMessage.includes('Invalid') || errorMessage.includes('password')) {
          errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        } else if (errorMessage.includes('inactive')) {
          errorMessage = 'الحساب غير نشط. يرجى التواصل مع الدعم'
        } else {
          errorMessage = 'حدث خطأ في تسجيل الدخول'
        }
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
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
