import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { 
  Building, 
  Target, 
  DollarSign, 
  FileText, 
  BarChart, 
  Users, 
  Briefcase, 
  Settings,
  ArrowLeft,
  Loader
} from 'lucide-react'

const iconMap = {
  'building': Building,
  'target': Target,
  'dollar-sign': DollarSign,
  'file-text': FileText,
  'bar-chart': BarChart,
  'users': Users,
  'briefcase': Briefcase,
  'settings': Settings
}

const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services')
      setServices(response.data.data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      setError('فشل في تحميل الخدمات')
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
            onClick={fetchServices}
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
            خدماتنا الاستشارية
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            نقدم مجموعة متكاملة من الخدمات الاستشارية في مجال الموارد البشرية وهندسة الأعمال
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Building

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={`/services/${service.slug}`}
                  className="group block h-full"
                >
                  <motion.div
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="relative h-full bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100"
                  >
                    {/* Icon */}
                    <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 mb-6 shadow-md">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {service.title_ar}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {service.short_description_ar}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                      <span>اعرف المزيد</span>
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-br-full" />
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Services
