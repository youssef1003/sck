import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { 
  Check, 
  Loader,
  Award,
  Clock,
  FileText,
  ArrowLeft,
  Sparkles
} from 'lucide-react'

const tierColors = {
  bronze: {
    gradient: 'from-amber-700 to-orange-800',
    badge: 'bg-amber-100 text-amber-800',
    button: 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
  },
  silver: {
    gradient: 'from-slate-400 to-slate-600',
    badge: 'bg-slate-100 text-slate-800',
    button: 'from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800'
  },
  gold: {
    gradient: 'from-yellow-500 to-amber-600',
    badge: 'bg-yellow-100 text-yellow-800',
    button: 'from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700'
  },
  platinum: {
    gradient: 'from-purple-600 to-pink-600',
    badge: 'bg-purple-100 text-purple-800',
    button: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
  }
}

const RecruitmentPackages = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await axios.get('/api/recruitment-packages')
      setPackages(response.data.data || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
      setError('فشل في تحميل الباقات')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <button
            onClick={fetchPackages}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-24">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            باقات التوظيف
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            اختر الباقة المناسبة لاحتياجاتك من بين باقاتنا المتنوعة
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">نستقطب الجدارة ونوفر لك الكفاءات المناسبة</span>
          </div>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {packages.map((pkg, index) => {
            const colors = tierColors[pkg.tier] || tierColors.bronze
            const isVerified = pkg.is_scq_verified

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {/* Premium Badge */}
                {isVerified && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>SCQ Verified</span>
                    </div>
                  </div>
                )}

                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  className={`relative h-full bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                    isVerified ? 'border-purple-200' : 'border-slate-100'
                  }`}
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-br ${colors.gradient} rounded-xl p-6 mb-6 text-white`}>
                    <h3 className="text-2xl font-bold mb-2">{pkg.name_ar}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5" />
                      <span className="text-lg font-semibold">{pkg.cv_count} سيرة ذاتية</span>
                    </div>
                    {pkg.badge_ar && (
                      <div className={`inline-block ${colors.badge} px-3 py-1 rounded-full text-sm font-semibold`}>
                        {pkg.badge_ar}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  {pkg.status_ar && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900 font-medium">{pkg.status_ar}</p>
                    </div>
                  )}

                  {/* Scope */}
                  {pkg.scope_ar && (
                    <div className="mb-4 flex items-center gap-2 text-slate-700">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-sm">{pkg.scope_ar}</span>
                    </div>
                  )}

                  {/* Duration */}
                  {pkg.duration_days && (
                    <div className="mb-6 flex items-center gap-2 text-slate-700">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-sm">التسليم خلال {pkg.duration_days} يوم</span>
                    </div>
                  )}

                  {/* Features */}
                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Advisory Value */}
                  {pkg.advisory_value_ar && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-900 font-medium">{pkg.advisory_value_ar}</p>
                    </div>
                  )}

                  {/* Compatibility */}
                  {pkg.compatibility_ar && (
                    <div className="mb-6 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700">{pkg.compatibility_ar}</p>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Link
                    to={`/quote-request?package=${pkg.slug}`}
                    className={`block w-full bg-gradient-to-r ${colors.button} text-white text-center px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    طلب عرض سعر
                  </Link>
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-blue-900 to-cyan-900 rounded-2xl p-8 shadow-lg text-white">
            <h2 className="text-3xl font-bold mb-4">لماذا تختار باقاتنا؟</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">✓ جودة مضمونة</h3>
                <p className="text-white/90">جميع السير الذاتية مفلترة ومحققة حسب معاييرنا الصارمة</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">✓ توفير الوقت</h3>
                <p className="text-white/90">نوفر عليك 80% من الجهد الإداري في عملية التوظيف</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">✓ خبرة 25+ عاماً</h3>
                <p className="text-white/90">نمتلك خبرة تراكمية في استقطاب الكفاءات</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">✓ قاعدة بيانات ضخمة</h3>
                <p className="text-white/90">نصل إلى آلاف المرشحين المؤهلين في مختلف التخصصات</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-lg text-slate-600 mb-6">
            لا تجد الباقة المناسبة؟ تواصل معنا للحصول على عرض مخصص
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/quote-request"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              طلب عرض سعر مخصص
            </Link>
            <Link
              to="/consultation"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300"
            >
              احجز استشارة مجانية
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RecruitmentPackages
