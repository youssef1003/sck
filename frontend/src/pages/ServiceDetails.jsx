import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { 
  ArrowLeft, 
  Check, 
  Loader,
  Calendar,
  Phone,
  Mail
} from 'lucide-react'

const ServiceDetails = () => {
  const { slug } = useParams()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchService()
  }, [slug])

  const fetchService = async () => {
    try {
      const response = await axios.get(`/api/services?slug=${slug}`)
      setService(response.data.data)
    } catch (error) {
      console.error('Error fetching service:', error)
      setError('فشل في تحميل تفاصيل الخدمة')
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

  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error || 'الخدمة غير موجودة'}</p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5 rotate-180" />
            <span>العودة للخدمات</span>
          </Link>
        </div>
      </div>
    )
  }

  const isRecruitment = slug === 'recruitment'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-24">
      <div className="container mx-auto px-6">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition">الرئيسية</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-blue-600 transition">الخدمات</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{service.title_ar}</span>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            {service.title_ar}
          </h1>
          {service.subtitle_ar && (
            <p className="text-2xl text-slate-600 mb-8">
              {service.subtitle_ar}
            </p>
          )}
          <p className="text-xl text-slate-700 leading-relaxed max-w-4xl">
            {service.short_description_ar}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Details */}
            {service.details_ar && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h2 className="text-3xl font-bold text-slate-900 mb-6">تفاصيل الخدمة</h2>
                <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
                  {service.details_ar.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Deliverables */}
            {service.deliverables && service.deliverables.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h2 className="text-3xl font-bold text-slate-900 mb-6">ما ستحصل عليه</h2>
                <ul className="space-y-4">
                  {service.deliverables.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-lg text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Stages */}
            {service.stages && service.stages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h2 className="text-3xl font-bold text-slate-900 mb-6">مراحل العمل</h2>
                <div className="space-y-6">
                  {service.stages.map((stage, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 pt-2">
                        <p className="text-lg text-slate-700">{stage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Why SCQ */}
            {service.why_scq_ar && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-gradient-to-br from-blue-900 to-cyan-900 rounded-2xl p-8 shadow-lg text-white"
              >
                <h2 className="text-3xl font-bold mb-6">لماذا تختار SCQ GROUP؟</h2>
                <p className="text-lg leading-relaxed opacity-90">
                  {service.why_scq_ar}
                </p>
              </motion.div>
            )}
          </div>

          {/* Right Column - CTA */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="sticky top-24 space-y-6"
            >
              {/* Main CTA */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-100">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  احجز استشارة مجانية
                </h3>
                <p className="text-slate-600 mb-6">
                  تواصل معنا الآن للحصول على استشارة مجانية وتقييم احتياجاتك
                </p>
                <Link
                  to="/consultation"
                  className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center px-6 py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 mb-4"
                >
                  <Calendar className="w-5 h-5 inline-block ml-2" />
                  احجز الآن
                </Link>
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <a
                    href="tel:+966123456789"
                    className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition"
                  >
                    <Phone className="w-5 h-5" />
                    <span>+966 12 345 6789</span>
                  </a>
                  <a
                    href="mailto:info@scqgroup.com"
                    className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition"
                  >
                    <Mail className="w-5 h-5" />
                    <span>info@scqgroup.com</span>
                  </a>
                </div>
              </div>

              {/* Recruitment-specific CTAs */}
              {isRecruitment && (
                <>
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 shadow-lg text-white">
                    <h3 className="text-xl font-bold mb-3">باقات التوظيف</h3>
                    <p className="text-white/90 mb-4 text-sm">
                      اختر الباقة المناسبة لاحتياجاتك من بين باقاتنا المتنوعة
                    </p>
                    <Link
                      to="/recruitment-packages"
                      className="block w-full bg-white text-purple-600 text-center px-4 py-3 rounded-lg font-semibold hover:bg-purple-50 transition"
                    >
                      عرض الباقات
                    </Link>
                  </div>

                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 shadow-lg text-white">
                    <h3 className="text-xl font-bold mb-3">طلب عرض سعر</h3>
                    <p className="text-white/90 mb-4 text-sm">
                      احصل على عرض سعر مخصص لاحتياجاتك
                    </p>
                    <Link
                      to="/quote-request"
                      className="block w-full bg-white text-green-600 text-center px-4 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
                    >
                      طلب عرض سعر
                    </Link>
                  </div>

                  <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 shadow-lg text-white">
                    <h3 className="text-xl font-bold mb-3">تسجيل مرشح</h3>
                    <p className="text-white/90 mb-4 text-sm">
                      سجل بياناتك للانضمام إلى قاعدة بياناتنا
                    </p>
                    <Link
                      to="/candidate/register"
                      className="block w-full bg-white text-orange-600 text-center px-4 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
                    >
                      سجل الآن
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetails
