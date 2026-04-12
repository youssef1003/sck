import { motion } from 'framer-motion'
import { 
  FileText, 
  Target, 
  Building2, 
  Users, 
  Award,
  Briefcase,
  ArrowRight 
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const Services = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const services = [
    {
      icon: FileText,
      key: 'feasibility_studies',
      color: 'from-blue-500 to-blue-600',
      gradient: 'from-blue-500/10 to-blue-600/10'
    },
    {
      icon: Target,
      key: 'strategic_planning',
      color: 'from-cyan-500 to-blue-500',
      gradient: 'from-cyan-500/10 to-blue-500/10'
    },
    {
      icon: Building2,
      key: 'organizational_dev',
      color: 'from-blue-600 to-cyan-600',
      gradient: 'from-blue-600/10 to-cyan-600/10'
    },
    {
      icon: Users,
      key: 'hr_resources',
      color: 'from-sky-500 to-blue-500',
      gradient: 'from-sky-500/10 to-blue-500/10'
    },
    {
      icon: Award,
      key: 'iso_certification',
      color: 'from-blue-500 to-indigo-500',
      gradient: 'from-blue-500/10 to-indigo-500/10'
    },
    {
      icon: Briefcase,
      key: 'business_engineering',
      color: 'from-cyan-600 to-blue-600',
      gradient: 'from-cyan-600/10 to-blue-600/10'
    },
  ]

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-50">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="relative container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {t('services.title')}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="group relative"
            >
              {/* Card */}
              <motion.div
                whileHover={{ y: -10 }}
                className="relative h-full p-8 rounded-2xl bg-white border-2 border-blue-100 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Animated Background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    animate={{
                      scale: hoveredIndex === index ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${service.color} mb-6 shadow-lg`}
                  >
                    <service.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {t(`services.${service.key}.title`)}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {t(`services.${service.key}.description`)}
                  </p>

                  {/* CTA */}
                  <motion.button
                    whileHover={{ x: isRTL ? -5 : 5 }}
                    className="flex items-center gap-2 text-blue-600 font-semibold group-hover:text-blue-700 transition-colors"
                  >
                    {t('blog.read_more')}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </motion.button>
                </div>

                {/* Decorative Corner */}
                <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-24 h-24 bg-gradient-to-${isRTL ? 'br' : 'bl'} from-blue-500/5 to-transparent rounded-${isRTL ? 'br' : 'bl'}-full`} />
              </motion.div>

              {/* Glow Effect */}
              <motion.div
                animate={{
                  opacity: hoveredIndex === index ? 0.5 : 0,
                }}
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.gradient} blur-xl -z-10`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
