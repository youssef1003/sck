import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, User, Eye, EyeOff } from 'lucide-react'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Temporary credentials - will be changed later
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'scq2025'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      if (
        formData.username === ADMIN_CREDENTIALS.username &&
        formData.password === ADMIN_CREDENTIALS.password
      ) {
        // Store auth token
        localStorage.setItem('scq_admin_token', 'authenticated')
        localStorage.setItem('scq_admin_user', formData.username)
        navigate('/admin/dashboard')
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة')
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
            <div className="inline-flex w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl items-center justify-center mb-4 shadow-lg">
              <span className="text-white font-bold text-3xl">SCQ</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              لوحة التحكم
            </h1>
            <p className="text-slate-600">
              تسجيل الدخول للوصول إلى لوحة الإدارة
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
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pr-12 pl-12 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Temp Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
            <p className="text-xs text-blue-600 text-center mb-2 font-semibold">
              بيانات الدخول المؤقتة:
            </p>
            <p className="text-xs text-slate-600 text-center">
              Username: <span className="font-mono font-bold">admin</span>
            </p>
            <p className="text-xs text-slate-600 text-center">
              Password: <span className="font-mono font-bold">scq2025</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin
